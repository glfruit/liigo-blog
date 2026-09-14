/**
 * Obsidian 兼容层 remark 插件（content/posts 即 Vault）
 *
 * 处理项：
 * - wikiLink：[[Page Name]] / [[Page Name|别名]] → 站内 link 节点 /posts/{slug}；
 *   未匹配（vault 里未发布的笔记）→ <span class="wiki-broken"> 纯文本，不报错不断链
 * - wikiImage：![[file.webp]] / ![[file.webp|300]] → image 节点 /attachments/{file}，
 *   尺寸后缀（纯数字）转为 width 属性
 * - callout：> [!note] 标题 → <Callout type="..." title="...">（mdxJsxFlowElement）；
 *   非 callout 的 blockquote 保持原样
 *
 * 技术说明：
 * - [[ 与 ![ 在标准 mdast 解析后是纯文本，插件按正则拆分 text 节点重建
 * - package.json 未显式声明 unist-util-visit（只是 remark 的传递依赖），
 *   按项目约定手写递归遍历，不新增依赖
 * - 注入的 mdxJsx* 节点带 data._mdxExplicitJsx，确保 @mdx-js/mdx 识别为显式 JSX
 */

/** 手写递归遍历：visitor 返回 undefined 保留节点，返回节点/节点数组则替换 */
function visitReplace(tree, visitor) {
  const walk = (node, parent, index) => {
    const replacement = visitor(node, parent, index);
    let target = node;
    if (replacement !== undefined && parent) {
      if (Array.isArray(replacement)) {
        parent.children.splice(index, 1, ...replacement);
        target = { children: replacement };
      } else {
        parent.children[index] = replacement;
        target = replacement;
      }
    }
    if (target.children) {
      for (let i = 0; i < target.children.length; i++) {
        walk(target.children[i], target, i);
      }
    }
  };
  if (tree.children) {
    for (let i = 0; i < tree.children.length; i++) {
      walk(tree.children[i], tree, i);
    }
  }
}

/** 按正则把 text 节点拆成 [text | 自定义节点] 序列 */
function splitTextNodes(node, regex, build) {
  const out = [];
  let changed = false;
  for (const child of node.children) {
    if (child.type !== "text") {
      out.push(child);
      continue;
    }
    const value = child.value;
    if (!regex.test(value)) {
      out.push(child);
      continue;
    }
    regex.lastIndex = 0;
    let last = 0;
    for (let m = regex.exec(value); m; m = regex.exec(value)) {
      if (m.index > last) out.push({ type: "text", value: value.slice(last, m.index) });
      out.push(build(m));
      last = m.index + m[0].length;
    }
    if (last < value.length) out.push({ type: "text", value: value.slice(last) });
    changed = true;
  }
  return changed ? out : undefined;
}

// ---------------------------------------------------------------------------
// 1. wikiLink：[[Page Name]] / [[Page Name|别名]]
// ---------------------------------------------------------------------------

/** target 归一化：全小写、空白折叠为连字符（"Page Name" → "page-name"） */
function normalizeTarget(target) {
  return target.trim().toLowerCase().replace(/\s+/g, "-");
}

/**
 * wikiLink 插件工厂，参数为文章映射 [{ slug, title }]
 * 匹配规则：归一化 target === slug，或 target 全小写 === title 全小写
 */
export function wikiLink(pages) {
  const bySlug = new Map();
  const byTitle = new Map();
  for (const p of pages) {
    bySlug.set(p.slug, p);
    byTitle.set(p.title.toLowerCase(), p);
  }
  const resolve = (target) =>
    bySlug.get(normalizeTarget(target)) ?? byTitle.get(target.trim().toLowerCase());

  const WIKI_LINK = /(?<!!)\[\[([^\][|]+?)(?:\|([^\]]+?))?\]\]/g;

  return () => (tree) => {
    visitReplace(tree, (node) => {
      if (node.type !== "paragraph" && node.type !== "heading") return undefined;
      const children = splitTextNodes(node, WIKI_LINK, (m) => {
        const target = m[1].trim();
        const alias = m[2]?.trim();
        const page = resolve(target);
        if (page) {
          return {
            type: "link",
            url: `/posts/${page.slug}`,
            children: [{ type: "text", value: alias || target }],
          };
        }
        return {
          type: "mdxJsxTextElement",
          name: "span",
          attributes: [
            { type: "mdxJsxAttribute", name: "className", value: "wiki-broken" },
          ],
          children: [{ type: "text", value: alias || target }],
          data: { _mdxExplicitJsx: true },
        };
      });
      return children ? { ...node, children } : undefined;
    });
  };
}

// ---------------------------------------------------------------------------
// 2. wikiImage：![[file.webp]] / ![[file.webp|300]]
// ---------------------------------------------------------------------------

const WIKI_IMAGE = /!\[\[([^\][|]+?)(?:\|(\d+))?\]\]/g;

export function wikiImage() {
  return () => (tree) => {
    visitReplace(tree, (node) => {
      if (node.type !== "paragraph" && node.type !== "heading") return undefined;
      const children = splitTextNodes(node, WIKI_IMAGE, (m) => {
        const file = m[1].trim();
        const size = m[2];
        const image = {
          type: "image",
          url: `/attachments/${file}`,
          alt: file,
        };
        if (size) image.data = { hProperties: { width: `${size}px` } };
        return image;
      });
      return children ? { ...node, children } : undefined;
    });
  };
}

// ---------------------------------------------------------------------------
// 3. callout：> [!note] 标题 → <Callout type="..." title="...">
// ---------------------------------------------------------------------------

const CALLOUT_MARKER = /^\[!(\w+)\](-)?\s*(.*)$/;

export function callout() {
  return () => (tree) => {
    visitReplace(tree, (node) => {
      if (node.type !== "blockquote") return undefined;
      const first = node.children[0];
      if (!first || first.type !== "paragraph") return undefined;
      const firstText = first.children[0];
      if (!firstText || firstText.type !== "text") return undefined;
      const m = CALLOUT_MARKER.exec(firstText.value);
      if (!m) return undefined;
      const attributes = [
        { type: "mdxJsxAttribute", name: "type", value: m[1].toLowerCase() },
      ];
      if (m[3].trim()) {
        attributes.push({
          type: "mdxJsxAttribute",
          name: "title",
          value: m[3].trim(),
        });
      }
      return {
        type: "mdxJsxFlowElement",
        name: "Callout",
        attributes,
        children: node.children.slice(1),
        data: { _mdxExplicitJsx: true },
      };
    });
  };
}

/** 组合数组（page.tsx 也可直接用此数组） */
export function obsidianPlugins(pages) {
  return [callout, wikiImage, wikiLink(pages)];
}
