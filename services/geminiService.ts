
import { GoogleGenAI } from "@google/genai";
import { KPI, TrendData } from "../types";

export const getAIInsights = async (kpis: KPI[], trends: TrendData[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const prompt = `
    作为网约车安全专家，分析以下疲劳驾驶预防系统的数据并给出3条简明扼要的中文洞察建议。
    
    核心指标:
    ${kpis.map(k => `${k.title}: ${k.value}${k.unit} (环比: ${k.change}%)`).join('\n')}
    
    近期趋势:
    ${trends.map(t => `${t.date}: 事故率${t.accidentRate}, 干预率${t.interventionRate}%`).join('\n')}
    
    请输出JSON格式，包含 title, content, type (alert/suggestion/positive)。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Insights error:", error);
    return [
      { title: "数据分析中", content: "正在同步最新安全监控数据...", type: "suggestion" }
    ];
  }
};
