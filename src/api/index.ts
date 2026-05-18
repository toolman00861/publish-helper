import { AnalysisRequest, AnalysisResult } from '../types';

export async function analyzeContent({ text, title, apiKey }: AnalysisRequest): Promise<AnalysisResult> {
  const prompt = `
    请作为一名专业的新闻/事件分析专家，对以下内容进行分析。
    请返回一个 JSON 格式的结果，包含以下字段：
    - "title": 事件标题（如果我提供了标题，请优化；如果没有提供，请基于内容生成一个凝练的标题）
    - "type": 分类，必须是以下之一：教育、劳动、校园 、政治、经济、社会、文化、科技、体育、娱乐、国际、军事、法治、环境、其他
    - "summary": 3-5 句核心摘要
    - "score": 热度分，范围 1-10的整数，表示事件可能引发的舆论热度
    - "reason": 评分理由（影响人数、传播性、历史参考等维度简要说明）

    ${title ? `\n提供的参考标题: ${title}` : ''}
    需要分析的内容:
    ${text}
  `;

  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "GLM-4.7-FlashX",
      messages: [
        {
          role: "system",
          content: "你是一个专业的事件分析助手。请务必只返回合法的 JSON，不要包含任何 markdown 代码块标记，直接返回 JSON 对象。结构为 {title, type, summary, score, reason}。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API 请求失败，状态码: ${response.status}`);
  }

  const data = await response.json();
  let content = data.choices[0]?.message?.content || "";

  try {
    // 去除可能包含的 markdown 标记
    content = content.replace(/^```json/m, '').replace(/^```/m, '').replace(/```$/m, '').trim();
    return JSON.parse(content) as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse JSON from response:", content);
    throw new Error("AI 返回的数据格式无法解析");
  }
}
