import { promises as fs } from "fs";
import path from "path";

export type KnowledgeSection = {
  id: string;
  document: string;
  documentTitle: string;
  title: string;
  content: string;
};

export type KnowledgeDocument = {
  filename: string;
  title: string;
  content: string;
  sections: KnowledgeSection[];
};

const DOCS_DIRECTORY = path.join(process.cwd(), "docs");

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractTitle(content: string, filename: string): string {
  const h1Match = content.match(/^#\s+(.+)$/m);

  if (h1Match?.[1]) {
    return h1Match[1].trim();
  }

  return filename.replace(/\.md$/i, "");
}

function cleanSectionContent(lines: string[]): string {
  return lines.join("\n").trim();
}

export function splitMarkdownIntoSections(
  document: Omit<KnowledgeDocument, "sections">,
): KnowledgeSection[] {
  const lines = document.content.split(/\r?\n/);
  const sections: KnowledgeSection[] = [];

  let currentTitle = document.title;
  let buffer: string[] = [];

  function pushSection() {
    const content = cleanSectionContent(buffer);

    if (!content) {
      return;
    }

    sections.push({
      id: `${document.filename}#${slugify(currentTitle)}-${sections.length + 1}`,
      document: document.filename,
      documentTitle: document.title,
      title: currentTitle,
      content,
    });
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);

    if (headingMatch) {
      const headingText = headingMatch[2].trim();

      if (headingMatch[1] === "#" && headingText === document.title) {
        continue;
      }

      pushSection();
      currentTitle = headingText;
      buffer = [];
      continue;
    }

    buffer.push(line);
  }

  pushSection();

  return sections;
}

export async function loadKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  const filenames = (await fs.readdir(DOCS_DIRECTORY))
    .filter((filename) => filename.endsWith(".md"))
    .sort();

  const documents: KnowledgeDocument[] = [];

  for (const filename of filenames) {
    const filePath = path.join(DOCS_DIRECTORY, filename);
    const content = await fs.readFile(filePath, "utf-8");
    const title = extractTitle(content, filename);

    const documentWithoutSections = {
      filename,
      title,
      content,
    };

    documents.push({
      ...documentWithoutSections,
      sections: splitMarkdownIntoSections(documentWithoutSections),
    });
  }

  return documents;
}

export async function loadKnowledgeSections(): Promise<KnowledgeSection[]> {
  const documents = await loadKnowledgeDocuments();

  return documents.flatMap((document) => document.sections);
}
