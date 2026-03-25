import { convert } from "html-to-markdown";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

export function htmlToMarkdown(html: string): string {
  return convert(html);
}

export function markdownToHtml(markdown: string): string {
  return md.render(markdown);
}
