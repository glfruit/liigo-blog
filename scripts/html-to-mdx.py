#!/usr/bin/env python3
"""HTML 报告 -> MDX 转换脚本：把 ai-infra 产出的 HTML 报告转成 content/posts/*.mdx

处理项：
- frontmatter 自动生成：title（<title> 或首个 <h1>）、date（今天）、
  category（默认 ai-reports）、tags（meta keywords，无则 [ai]）、
  description（meta description 或前 150 字纯文本）、draft: true
- h1-h6 → 对应 #；首个 h1 与 title 重复则跳过
- p/div → 段落；br → 换行；script/style/nav/footer/header 整体丢弃
- pre → ``` 围栏代码块（内部原样不转义）；行内 code → `code`
- table → GFM 表格（首行表头 + 分隔行）
- ul/ol/li → 列表；blockquote → >
- img → ![alt](src)；a[href] → [text](href)（站外链接保留）
- HTML 实体由 parser 自动还原（&amp; &lt; &gt; &quot; &#39;）
- 行尾空格清理、3 个以上连续空行压缩、中文引号规整

用法：
    python3 scripts/html-to-mdx.py <input.html> [output.mdx]
    无输出参数时打印到 stdout
"""
import html
import html.parser
import re
import sys
from datetime import date
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.exit("需要 pyyaml：pip install pyyaml")

DEFAULT_CATEGORY = "ai-reports"
DEFAULT_TAGS = ["ai"]
DESC_LIMIT = 150

# 整体丢弃的元素（含其子树）
DROP_TAGS = {"script", "style", "nav", "footer", "header"}

# 块级元素：渲染时保证前后有空行
BLOCK_TAGS = {
    "p", "div", "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "blockquote", "pre", "table", "hr", "section", "article", "main",
}

SKIP_TAGS = {"tbody", "thead", "tfoot", "colgroup", "caption", "body", "html", "span", "font"}


class Node:
    __slots__ = ("tag", "attrs", "children")

    def __init__(self, tag=None, attrs=None):
        self.tag = tag  # None 表示文本节点，attrs 即文本内容
        self.attrs = attrs or {}
        self.children = []

    @property
    def text(self) -> str:
        if self.tag is None:
            return self.attrs
        return "".join(c.text for c in self.children)


class TreeParser(html.parser.HTMLParser):
    """解析为简易 DOM 树，同时丢弃 script/style/nav/footer/header"""

    def __init__(self):
        super().__init__(convert_charrefs=True)  # 实体自动还原
        self.root = Node("root")
        self.stack = [self.root]
        self.drop_depth = 0  # 处于被丢弃元素内时 > 0

    def handle_starttag(self, tag, attrs):
        if tag in DROP_TAGS:
            self.drop_depth += 1
            return
        if self.drop_depth:
            return
        node = Node(tag, dict(attrs))
        self.stack[-1].children.append(node)
        if tag not in {"br", "hr", "img", "meta", "link", "input", "col"}:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        if self.drop_depth:
            return
        self.stack[-1].children.append(Node(tag, dict(attrs)))

    def handle_endtag(self, tag):
        if tag in DROP_TAGS:
            if self.drop_depth:
                self.drop_depth -= 1
            return
        if self.drop_depth:
            return
        # 弹出到匹配标签（容忍未闭合）
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if self.drop_depth:
            return
        if data:
            self.stack[-1].children.append(Node(None, data))


# ---------------------------------------------------------------------------
# 元信息提取
# ---------------------------------------------------------------------------

def find_first(node: Node, tag: str) -> Node | None:
    if node.tag == tag:
        return node
    for c in node.children:
        r = find_first(c, tag)
        if r:
            return r
    return None


def find_all(node: Node, tag: str) -> list:
    out = [node] if node.tag == tag else []
    for c in node.children:
        out.extend(find_all(c, tag))
    return out


def extract_meta(root: Node, name: str) -> str:
    for m in find_all(root, "meta"):
        if m.attrs.get("name", "").lower() == name:
            return m.attrs.get("content", "").strip()
    return ""


def extract_title(root: Node) -> str:
    t = find_first(root, "title")
    if t and t.text.strip():
        return collapse_ws(t.text)
    h1 = find_first(root, "h1")
    if h1 and h1.text.strip():
        return collapse_ws(h1.text)
    return "未命名报告"


def collapse_ws(s: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def plain_text(node: Node) -> str:
    return collapse_ws(node.text)


# ---------------------------------------------------------------------------
# 正文渲染：DOM 树 → Markdown
# ---------------------------------------------------------------------------

def render_inline(children: list) -> str:
    return "".join(render(c) for c in children).strip()


def render(node: Node, list_stack: list | None = None) -> str:
    tag = node.tag
    if tag is None:
        return normalize_text(node.attrs)
    if tag == "head":
        return ""  # head 仅用于元信息提取，不进正文
    if tag in SKIP_TAGS:
        return "".join(render(c, list_stack) for c in node.children)
    if tag in {"strong", "b"}:
        inner = render_inline(node.children)
        return f"**{inner}**" if inner else ""
    if tag in {"em", "i"}:
        inner = render_inline(node.children)
        return f"*{inner}*" if inner else ""
    if tag == "code":
        return inline_code(node.text)
    if tag == "br":
        return "\n"
    if tag == "hr":
        return "\n\n---\n\n"
    if tag == "a":
        text = render_inline(node.children) or node.attrs.get("href", "")
        href = node.attrs.get("href", "")
        return f"[{text}]({href})" if href else text
    if tag == "img":
        src = node.attrs.get("src", "")
        alt = node.attrs.get("alt", "")
        return f"![{alt}]({src})" if src else ""
    if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
        level = int(tag[1])
        inner = render_inline(node.children)
        return f"\n\n{'#' * level} {inner}\n\n" if inner else ""
    if tag in {"p", "div", "section", "article", "main"}:
        inner = render_inline(node.children)
        return f"\n\n{inner}\n\n" if inner else ""
    if tag == "pre":
        code = "".join(c.attrs for c in node.children if c.tag is None)
        if not code and node.children:
            code = node.children[0].text  # <pre><code>...</code></pre>
        code = code.rstrip("\n")
        return f"\n\n```\n{code}\n```\n\n"
    if tag == "blockquote":
        inner = render_children(node, list_stack).strip("\n")
        quoted = "\n".join("> " + l if l.strip() else ">" for l in inner.split("\n"))
        return f"\n\n{quoted}\n\n"
    if tag in {"ul", "ol"}:
        return render_list(node, ordered=(tag == "ol"), list_stack=list_stack or [])
    if tag == "table":
        return render_table(node)
    if tag == "figure":
        inner = render_children(node, list_stack).strip("\n")
        return f"\n\n{inner}\n\n"
    if tag == "figcaption":
        inner = render_inline(node.children)
        return f"*{inner}*\n" if inner else ""
    return render_children(node, list_stack)


def render_children(node: Node, list_stack=None) -> str:
    return "".join(render(c, list_stack) for c in node.children)


def render_list(node: Node, ordered: bool, list_stack: list) -> str:
    depth = len(list_stack)
    indent = "  " * depth
    items = [c for c in node.children if c.tag == "li"]
    lines = []
    for idx, li in enumerate(items, 1):
        marker = f"{idx}." if ordered else "-"
        # li 的子内容：嵌套列表单独提取
        nested = [c for c in li.children if c.tag in {"ul", "ol"}]
        inline_parts = [c for c in li.children if c.tag not in {"ul", "ol"}]
        content = render_inline(inline_parts)
        item_lines = content.split("\n") if content else [""]
        lines.append(f"{indent}{marker} {item_lines[0]}".rstrip())
        for cont in item_lines[1:]:
            lines.append(f"{indent}  {cont}".rstrip())
        for n in nested:
            lines.append(render_list(n, ordered=(n.tag == "ol"), list_stack=list_stack + [1]).rstrip("\n"))
    return "\n\n" + "\n".join(lines) + "\n\n"


def render_table(node: Node) -> str:
    rows = []
    for tr in find_all(node, "tr"):
        cells = [collapse_ws(c.text) for c in tr.children if c.tag in {"th", "td"}]
        if cells:
            rows.append(cells)
    if not rows:
        return ""
    width = max(len(r) for r in rows)
    rows = [r + [""] * (width - len(r)) for r in rows]
    out = ["| " + " | ".join(rows[0]) + " |"]
    out.append("|" + " --- |" * width)
    for r in rows[1:]:
        out.append("| " + " | ".join(r) + " |")
    return "\n\n" + "\n".join(out) + "\n\n"


def inline_code(text: str) -> str:
    text = text.strip()
    if not text:
        return ""
    ticks = "`" if "`" not in text else "``"
    return f"{ticks}{text}{ticks}"


QUOTE_PAIRS = {
    "“": "「", "”": "」",
    "‘": "『", "’": "』",
}


def normalize_text(s: str) -> str:
    for src, dst in QUOTE_PAIRS.items():
        s = s.replace(src, dst)
    # 兜底再解码一层残留实体（如源头双重编码的 &amp;quot;）
    return html.unescape(s)


# ---------------------------------------------------------------------------
# 正文规整
# ---------------------------------------------------------------------------

def tidy_body(md: str, title: str) -> str:
    # 去掉与标题重复的首个 H1
    md = re.sub(
        r"^\s*#\s+" + re.escape(title).replace(r"\ ", r"\s*") + r"\s*\n",
        "", md, count=1, flags=re.M,
    )
    # 行尾空格清理、3 个以上连续空行压缩为 1 个
    md = "\n".join(line.rstrip() for line in md.split("\n"))
    md = re.sub(r"\n{3,}", "\n\n", md)
    return md.strip() + "\n"


# ---------------------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------------------

def yaml_quote(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def convert(html_text: str) -> tuple[str, list[str]]:
    warnings: list[str] = []
    parser = TreeParser()
    parser.feed(html_text)
    root = parser.root

    title = extract_title(root)
    keywords = extract_meta(root, "keywords")
    tags = [t.strip() for t in keywords.split(",") if t.strip()] or DEFAULT_TAGS
    description = extract_meta(root, "description") or plain_text(root)[:DESC_LIMIT]
    if not extract_meta(root, "description"):
        warnings.append("无 meta description，用正文前 150 字代替")
    if title == "未命名报告":
        warnings.append("未找到 <title> 与 <h1>，title 需手动补全")

    body = tidy_body(render_children(root), title)

    out = (
        "---\n"
        f"title: {yaml_quote(title)}\n"
        f"date: {date.today().isoformat()}\n"
        f"category: {DEFAULT_CATEGORY}\n"
        f"tags: [{', '.join(yaml_quote(t) for t in tags)}]\n"
        f"description: {yaml_quote(collapse_ws(description))}\n"
        f"draft: true\n"
        "---\n\n"
        f"{body}"
    )
    return out, warnings


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    if not src.is_file():
        sys.exit(f"输入文件不存在：{src}")

    mdx, warnings = convert(src.read_text(encoding="utf-8"))
    for w in warnings:
        print(f"⚠ {w}", file=sys.stderr)

    if len(sys.argv) >= 3:
        out_path = Path(sys.argv[2])
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(mdx, encoding="utf-8")
        print(f"OK  {src} -> {out_path}")
    else:
        print(mdx, end="")


if __name__ == "__main__":
    main()
