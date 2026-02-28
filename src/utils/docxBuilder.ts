/**
 * Minimal .docx builder using JSZip.
 * Supports: headings (H1-H3), paragraphs, bold, italic, code, bullet lists.
 */
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface DocxBlock {
  type: "h1" | "h2" | "h3" | "p" | "li" | "code" | "break";
  text: string;
  bold?: boolean;
  italic?: boolean;
}

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseMarkdownToBlocks(markdown: string): DocxBlock[] {
  const blocks: DocxBlock[] = [];
  const lines = markdown.split("\n");
  let inCodeBlock = false;
  let codeLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false;
        blocks.push({ type: "code", text: codeLines.join("\n") });
        codeLines = [];
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
      blocks.push({ type: "break", text: "" });
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
    } else if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
    } else if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2).trim() });
    } else if (line.startsWith("- ") || line.startsWith("* ") || /^\d+\.\s/.test(line)) {
      const text = line.replace(/^[-*]\s|^\d+\.\s/, "").trim();
      blocks.push({ type: "li", text });
    } else {
      blocks.push({ type: "p", text: line });
    }
  }

  return blocks;
}

// Inline markdown: **bold**, *italic*, `code`
function renderRunsXml(text: string): string {
  let out = "";
  // Split on **bold**, *italic*, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = escXml(part.slice(2, -2));
      out += `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${inner}</w:t></w:r>`;
    } else if (part.startsWith("*") && part.endsWith("*")) {
      const inner = escXml(part.slice(1, -1));
      out += `<w:r><w:rPr><w:i/></w:rPr><w:t xml:space="preserve">${inner}</w:t></w:r>`;
    } else if (part.startsWith("`") && part.endsWith("`")) {
      const inner = escXml(part.slice(1, -1));
      out += `<w:r><w:rPr><w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/><w:sz w:val="18"/><w:color w:val="c7254e"/></w:rPr><w:t xml:space="preserve">${inner}</w:t></w:r>`;
    } else if (part) {
      out += `<w:r><w:t xml:space="preserve">${escXml(part)}</w:t></w:r>`;
    }
  }
  return out || `<w:r><w:t></w:t></w:r>`;
}

function blockToXml(block: DocxBlock): string {
  const runs = renderRunsXml(block.text);

  switch (block.type) {
    case "h1":
      return `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr>${runs}</w:p>`;
    case "h2":
      return `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr>${runs}</w:p>`;
    case "h3":
      return `<w:p><w:pPr><w:pStyle w:val="Heading3"/></w:pPr>${runs}</w:p>`;
    case "li":
      return `<w:p>
        <w:pPr>
          <w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>
          <w:ind w:left="720"/>
        </w:pPr>
        ${runs}
      </w:p>`;
    case "code": {
      const codeLines = block.text.split("\n");
      return codeLines
        .map((line) => {
          const escaped = escXml(line);
          return `<w:p>
            <w:pPr><w:shd w:val="clear" w:color="auto" w:fill="F5F5F5"/></w:pPr>
            <w:r><w:rPr><w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/><w:sz w:val="18"/></w:rPr>
              <w:t xml:space="preserve">${escaped}</w:t>
            </w:r>
          </w:p>`;
        })
        .join("\n");
    }
    case "break":
      return `<w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p>`;
    default:
      return `<w:p>${runs}</w:p>`;
  }
}

function buildDocumentXml(blocks: DocxBlock[], title: string): string {
  const body = blocks.map(blockToXml).join("\n");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
  xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 wp14">
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Title"/></w:pPr>
      <w:r><w:t>${escXml(title)}</w:t></w:r>
    </w:p>
    ${body}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:docDefaults>
    <w:rPrDefault><w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
      <w:sz w:val="24"/><w:szCs w:val="24"/>
    </w:rPr></w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="52"/><w:color w:val="1F3864"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr><w:spacing w:before="240" w:after="120"/><w:keepNext/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="2F5496"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:pPr><w:spacing w:before="200" w:after="80"/><w:keepNext/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="2F5496"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:pPr><w:spacing w:before="160" w:after="60"/><w:keepNext/></w:pPr>
    <w:rPr><w:b/><w:i/><w:sz w:val="24"/><w:color w:val="1F3864"/></w:rPr>
  </w:style>
</w:styles>`;

const NUMBERING_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1">
    <w:abstractNumId w:val="0"/>
  </w:num>
</w:numbering>`;

export async function buildAndDownloadDocx(markdown: string, title: string = "Document") {
  const blocks = parseMarkdownToBlocks(markdown);
  const documentXml = buildDocumentXml(blocks, title);

  const zip = new JSZip();

  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>`);

  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>`);

  zip.file("word/document.xml", documentXml);
  zip.file("word/styles.xml", STYLES_XML);
  zip.file("word/numbering.xml", NUMBERING_XML);

  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  saveAs(blob, `${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.docx`);
}
