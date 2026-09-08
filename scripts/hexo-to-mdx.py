#!/usr/bin/env python3
"""Hexo -> MDX 迁移脚本：把 hexo-old/source/_posts/*.md 转成 content/posts/*.mdx

处理项：
- 5 篇缺起始 --- 的旧 Jekyll 头，自动补全后按 YAML 解析
- 文件名日期前缀剥离，slug 语义化（映射表见 SLUG_MAP）
- Hexo 标签插件 {% codeblock lang %} / {% code %} / {% endcodeblock %} -> ``` 围栏代码块
- {% raw %}/{% endraw %} 剥离（保留其中文字）
- <!-- more --> 摘要标记移除
- 正文首行与 title 重复的 H1 移除
- Jekyll 遗留 {{site.url}}/images/x.jpg -> /images/legacy/x.jpg（需手动补图）
- 旧分类降级为 tag；category 统一归档为 archive
- date 归一化为 YYYY-MM-DD；description 由 DESC_MAP 补齐（SEO 必填）
"""
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.exit("需要 pyyaml：pip install pyyaml")

SRC = Path("hexo-old/source/_posts")
DST = Path("content/posts")

# 完整文件名（无扩展名）-> slug，用于同名文章消歧（优先于 SLUG_MAP）
FILENAME_SLUG = {
    "2021-07-14-forget-about-setting-goals": "forget-about-setting-goals-2021",
}

# 文件名（去日期前缀）-> 语义化 slug
SLUG_MAP = {
    "hello2012": "hello-2012",
    "clojure": "clojure-philosophy",
    "jdeeemacs24": "jdee-on-emacs-24",
    "jekyllgithub": "blog-with-jekyll-github-pages",
    "grails-intellij-debug": "grails-intellij-debug",
    "grails-tip-1": "grails-tips-1",
    "grails-tip-2": "grails-tips-2",
    "grails-tip-3": "grails-tips-3",
    "swift": "swift-first-impression",
    "mac-life---yosemite": "mac-life-yosemite",
    "lsof": "lsof-who-opened-my-file",
    "migrate-from-jekyll-to-hexo": "jekyll-to-hexo",
    "zotero-series-5": "zotero-scrivener-integration",
    "forget-about-setting-goals": "forget-about-setting-goals",
    "create-a-blog-using-hexo": "create-a-blog-using-hexo",
    "razor-pages-tutorial-1": "razor-pages-tutorial-1",
    "swim-in-code-with-opengrok": "opengrok-on-debian",
    "migration-log": "hexo-on-tencent-cloud",
}
# description 补全（原文缺失/为空时；SEO 必填，120 字内）
DESC_MAP = {
    "hello-2012": "2012 年新年第一篇，聊聊新一年的打算与博客的重新出发。",
    "clojure-philosophy": "Clojure 的基本理念：不可变数据、函数式与简洁性的设计哲学笔记。",
    "jdee-on-emacs-24": "折腾记录：终于让 JDEE 在 Emacs 24 上跑起来了。",
    "blog-with-jekyll-github-pages": "基于 Jekyll Bootstrap 和 GitHub Pages 搭建个人博客的完整步骤记录。",
    "grails-intellij-debug": "使用 IntelliJ IDEA 开发 Grails 应用时遇到的几个问题及解决方法。",
    "grails-tips-1": "Grails 点滴（一）：运行测试代码时遇到的几个小问题及解决方法。",
    "grails-tips-2": "Grails 点滴（二）：Grails 开发中的零碎问题与技巧记录。",
    "grails-tips-3": "Grails 点滴（三）：Grails 开发中的零碎问题与技巧记录。",
    "swift-first-impression": "WWDC 2014 后第一时间上手 Swift 语言的初步印象与点评。",
    "mac-life-yosemite": "升级 OS X Yosemite 的踩坑记：软件崩溃、登录卡死与最终的解决方案。",
    "lsof-who-opened-my-file": "文件被占用无法删除？用 lsof 命令找出是谁打开了你的文件。",
    "jekyll-to-hexo": "把博客从 Jekyll Bootstrap 迁移到 Hexo 的完整过程与配置记录。",
    "zotero-scrivener-integration": "Zotero 科研系列（五）：与 Scrivener 整合，实现写作时一键插入文献引用。",
    "forget-about-setting-goals": "忘掉设定目标，专注于系统：目标和系统的差别，译文笔记。",
    "forget-about-setting-goals-2021": "忘记设定目标，专注于此（2021 更新版）：原文作者大幅改写后的重新翻译，与 2017 版对照阅读。",
    "create-a-blog-using-hexo": "使用 Hexo 创建博客站点的步骤备忘。",
    "razor-pages-tutorial-1": "ASP.NET Core Razor Pages 入门（一）：官方教程的中文翻译与修正补充。",
    "opengrok-on-debian": "代码畅游必备工具：在 Debian 上安装配置 OpenGrok 源码搜索引擎。",
    "hexo-on-tencent-cloud": "在腾讯云服务器上搭建 Hexo 博客的备忘录：Nginx、Git、部署与 SSL。",
}


def fix_broken_frontmatter(text: str) -> str:
    """补齐缺起始 --- 的旧式 YAML 头（头部第一个 --- 之前的 key: 行视为 frontmatter）"""
    if text.startswith("---"):
        return text
    m = re.search(r"^---\s*$", text, re.M)
    if m and re.match(r"^\w+:", text):
        return "---\n" + text
    return text


def convert_hexo_tags(body: str) -> str:
    """{% codeblock lang:bash %} / {% codeblock bash %} / {% code %} -> ``` 围栏"""
    def open_repl(m: re.Match) -> str:
        arg = (m.group(1) or "").strip()
        arg = re.sub(r"^lang:", "", arg)
        return f"```{arg}"
    body = re.sub(r"\{%\s*(?:codeblock|code)\s*([^%]*?)%\}", open_repl, body)
    body = re.sub(r"\{%\s*end(?:codeblock|code)\s*%\}", "```", body)
    body = re.sub(r"\{%\s*end?raw\s*%\}", "", body)  # raw/endraw 直接剥离
    # 兜底：其余残留 {% ... %} 转为行内代码（多为讲解语法的示例文本）
    body = re.sub(r"\{%\s*(.*?)%\}", r"`\1`", body)
    return body


def clean_body(body: str, title: str) -> str:
    body = body.replace("<!-- more -->", "")
    body = re.sub(r"\{\{\s*site\.url\s*\}\}/images/", "/images/legacy/", body)
    # 旧站域名内链改写为新站 slug
    body = re.sub(
        r"https?://(?:www\.)?glfruit\.(?:me|github\.com)/\d{4}/\d{2}/\d{2}/forget-about-setting-goals/?",
        "/posts/forget-about-setting-goals", body,
    )
    # 去掉与标题重复的首个 H1
    body = re.sub(
        r"^\s*#\s+" + re.escape(title).replace(r"\ ", r"\s*") + r"\s*\n",
        "", body, count=1,
    )
    # 压缩 3 个以上连续空行
    body = re.sub(r"\n{3,}", "\n\n", body)
    return body.strip() + "\n"


def yaml_quote(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def migrate_one(path: Path) -> tuple[str, list[str]]:
    warnings: list[str] = []
    text = fix_broken_frontmatter(path.read_text(encoding="utf-8"))
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.S)
    if not m:
        raise ValueError(f"{path.name}: 无法解析 frontmatter")
    meta = yaml.safe_load(m.group(1)) or {}
    body = m.group(2)

    stem = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", path.stem)
    slug = FILENAME_SLUG.get(path.stem) or SLUG_MAP.get(stem, stem)
    if path.stem not in FILENAME_SLUG and stem not in SLUG_MAP:
        warnings.append(f"slug 未在映射表中，用原名：{stem}")

    title = str(meta.get("title", slug)).strip().strip('"').strip("'")
    date = str(meta.get("date", ""))[:10]
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
        warnings.append(f"日期异常：{meta.get('date')!r}")

    tags = list(meta.get("tags") or [])
    old_cat = meta.get("categories")
    if old_cat:
        cats = old_cat if isinstance(old_cat, list) else [old_cat]
        for c in cats:
            if c and c not in tags:
                tags.append(str(c))

    desc = str(meta.get("description") or "").strip() or DESC_MAP.get(slug, "")
    if not desc:
        warnings.append("description 缺失且映射表未覆盖！")

    body = clean_body(convert_hexo_tags(body), title)
    if "{%" in body:
        warnings.append("正文中仍残留 {% 标签")
    if "qiniudn.com" in body or "jamesclear.com/wp-content" in body:
        warnings.append("含已失效图床链接")

    out = (
        "---\n"
        f"title: {yaml_quote(title)}\n"
        f"date: {date}\n"
        f"category: archive\n"
        f"tags: [{', '.join(yaml_quote(t) for t in tags)}]\n"
        f"description: {yaml_quote(desc)}\n"
        f"source: hexo-legacy\n"
        f"draft: false\n"
        "---\n\n"
        f"{body}"
    )
    (DST / f"{slug}.mdx").write_text(out, encoding="utf-8")
    return slug, warnings


def main() -> None:
    if not SRC.is_dir():
        sys.exit(f"源目录不存在：{SRC}")
    DST.mkdir(parents=True, exist_ok=True)
    only = set(sys.argv[1:])  # 可选：只迁移指定文件名片段
    ok = 0
    for path in sorted(SRC.glob("*.md")):
        if only and not any(s in path.name for s in only):
            continue
        try:
            slug, warnings = migrate_one(path)
            ok += 1
            print(f"OK  {path.name} -> {slug}.mdx" + (f"  ⚠ {'; '.join(warnings)}" if warnings else ""))
        except Exception as e:
            print(f"FAIL {path.name}: {e}")
    print(f"\n共迁移 {ok} 篇")


if __name__ == "__main__":
    main()
