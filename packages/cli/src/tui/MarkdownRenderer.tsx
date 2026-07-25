import { Text } from "ink"
import { marked } from "marked"

marked.setOptions({ breaks: true })

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<(\/)?(strong|b)>/gi, "")
    .replace(/<(\/)?(em|i)>/gi, "")
    .replace(/<code[^>]*>([^<]*)<\/code>/gi, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
}

function parseMarkdown(text: string): string[] {
  const html = marked.parse(text, { async: false }) as string
  const cleaned = stripHtml(html)
  return cleaned.split("\n")
}

export function MarkdownRenderer({ content }: { content: string }) {
  const lines = parseMarkdown(content)
  return (
    <Text>
      {lines.map((line, i) => (
        <Text key={i}>
          {line || " "}
          {i < lines.length - 1 ? "\n" : null}
        </Text>
      ))}
    </Text>
  )
}
