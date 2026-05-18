import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { AnalysisResult } from '../types';

export function exportToTxt(result: AnalysisResult) {
  const content = `标题：${result.title}
分类：${result.type}
热度分：${result.score}/10

摘要：
${result.summary}

评分理由：
${result.reason}
`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${result.title || '分析报告'}.txt`);
}

export async function exportToWord(result: AnalysisResult) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: result.title,
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "分类：", bold: true }),
            new TextRun(result.type),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "热度分：", bold: true }),
            new TextRun(`${result.score}/10`),
          ],
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          text: "摘要",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: result.summary,
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          text: "评分理由",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: result.reason,
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${result.title || '分析报告'}.docx`);
}
