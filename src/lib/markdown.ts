import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({ breaks: true, gfm: true });

/** Markdown → безопасен HTML (за описания, новини, текстове). */
export function renderMarkdown(md: string): string {
  if (!md?.trim()) return "";
  const html = marked.parse(md) as string;
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li", "h2", "h3", "h4",
      "blockquote", "hr", "img", "table", "thead", "tbody", "tr", "th", "td", "code", "pre",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (tag, attribs) => ({
        tagName: "a",
        attribs: { ...attribs, rel: "noopener", ...(attribs.href?.startsWith("http") ? { target: "_blank" } : {}) },
      }),
    },
  });
}

/** Кратък plain-text откъс от markdown. */
export function excerptOf(md: string, max = 160): string {
  const text = md.replace(/[#*_>`\[\]()!-]/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}
