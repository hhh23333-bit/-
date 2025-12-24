
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

export const getCustomResponse = async (query: string, kpis: KPI[], trends: TrendData[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const context = `
    当前网约车安全监控数据：
    核心指标: ${kpis.map(k => `${k.title}: ${k.value}${k.unit}`).join(', ')}
    趋势数据: ${trends.map(t => `${t.date}事故率${t.accidentRate}, 干预率${t.interventionRate}%`).join(', ')}
  `;

  const prompt = `你是一位专业的网约车安全管理专家。基于以下实时监控数据，回答用户关于安全运营的问题。\n\n${context}\n\n用户问题：${query}\n\n请直接给出专业、精准、简洁的中文回答。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Custom AI Query error:", error);
    return "抱歉，分析数据时出现错误，请稍后再试。";
  }
};
