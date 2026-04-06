/**
 * Lightweight markdown renderer for status content.
 * No external dependencies - regex-based parsing.
 */
// Pre-compiled regex patterns for better performance
const CODE_BLOCK_REGEX = /```(\w*)\n([\s\S]*?)```/g;
const H3_HEADER_REGEX = /^###\s+(.+)$/gm;
const H4_HEADER_REGEX = /^##\s+(.+)$/gm;
const UL_LIST_REGEX = /^[-*]\s+(.+)$/;
const OL_LIST_REGEX = /^\d+\.\s+(.+)$/;
const BOLD_REGEX = /\*\*(.+?)\*\*/g;
const ITALIC_REGEX = /\*(.+?)\*/g;
const CODE_REGEX = /`([^`]+)`/g;
const BLOCK_ELEMENT_START_REGEX = /^<(h[34]|ul|ol|pre|li)/;
const BLOCK_ELEMENT_END_REGEX = /<\/(h[34]|ul|ol|pre|li)>$/;
const PARAGRAPH_SPLIT_REGEX = /\n\n+/;
const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};
/**
 * Renders markdown to sanitized HTML.
 * @param markdown - Raw markdown content
 * @returns Sanitized HTML string
 */
export function renderMarkdown(markdown) {
  if (!markdown) {
    return "";
  }
  let html = escapeHtml(markdown);
  // Order matters! Process blocks before inline elements
  html = parseCodeBlocks(html);
  html = parseHeaders(html);
  html = parseLists(html);
  html = parseInlineElements(html);
  html = wrapParagraphs(html);
  return html;
}
function escapeHtml(text) {
  return text.replace(/[&<>]/g, (char) => HTML_ESCAPE_MAP[char] ?? char);
}
function parseCodeBlocks(html) {
  return html.replace(CODE_BLOCK_REGEX, (_match, lang, code) => {
    const langClass = lang ? ` class="language-${lang}"` : "";
    return `<pre><code${langClass}>${code.trim()}</code></pre>`;
  });
}
function parseHeaders(html) {
  let result = html.replace(
    H3_HEADER_REGEX,
    '<h3 class="status-heading">$1</h3>'
  );
  result = result.replace(
    H4_HEADER_REGEX,
    '<h4 class="status-subheading">$1</h4>'
  );
  return result;
}
function parseLists(html) {
  const lines = html.split("\n");
  const result = [];
  let currentListType = null;
  let listBuffer = [];
  const flushList = () => {
    if (currentListType && listBuffer.length > 0) {
      const tag = currentListType === "ul" ? "ul" : "ol";
      result.push(`<${tag} class="status-list">`);
      result.push(...listBuffer);
      result.push(`</${tag}>`);
      listBuffer = [];
      currentListType = null;
    }
  };
  const processLine = (line) => {
    const ulMatch = line.match(UL_LIST_REGEX);
    const olMatch = line.match(OL_LIST_REGEX);
    if (ulMatch) {
      if (currentListType === "ol") {
        flushList();
      }
      if (!currentListType) {
        currentListType = "ul";
      }
      listBuffer.push(`<li>${ulMatch[1]}</li>`);
    } else if (olMatch) {
      if (currentListType === "ul") {
        flushList();
      }
      if (!currentListType) {
        currentListType = "ol";
      }
      listBuffer.push(`<li>${olMatch[1]}</li>`);
    } else {
      flushList();
      result.push(line);
    }
  };
  for (const line of lines) {
    processLine(line);
  }
  flushList();
  return result.join("\n");
}
function parseInlineElements(html) {
  let result = html.replace(BOLD_REGEX, "<strong>$1</strong>");
  result = result.replace(ITALIC_REGEX, "<em>$1</em>");
  result = result.replace(CODE_REGEX, "<code>$1</code>");
  return result;
}
function wrapParagraphs(html) {
  const blocks = html.split(PARAGRAPH_SPLIT_REGEX);
  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) {
        return "";
      }
      // Don't wrap if it's already a block element
      if (BLOCK_ELEMENT_START_REGEX.test(trimmed)) {
        return block;
      }
      // Don't wrap if it ends with a block element
      if (BLOCK_ELEMENT_END_REGEX.test(trimmed)) {
        return block;
      }
      return `<p>${trimmed}</p>`;
    })
    .filter(Boolean)
    .join("\n\n");
}

export { renderMarkdown as MarkdownRenderer };
