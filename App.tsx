
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { 
  ShieldAlert, 
  TrendingDown, 
  Activity, 
  Download, 
  BrainCircuit, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';

import { CORE_KPIS, MOCK_TREND, MOCK_DETAILS } from './constants';
import { AIInsight } from './types';
import { getAIInsights } from './services/geminiService';

const App: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingAI(true);
      const data = await getAIInsights(CORE_KPIS, MOCK_TREND);
      setInsights(data);
      setLoadingAI(false);
    };
    fetchInsights();

    // Real-time clock update (every 10 seconds is enough since we only show minutes)
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    // Removed seconds per user request
    return `${y}-${m}-${d} ${hh}:${mm}`;
  };

  const downloadCSV = () => {
    const headers = "ID,Driver,City,RiskScore,FatigueHours,Status,Time\n";
    const rows = MOCK_DETAILS.map(d => 
      `${d.id},${d.driverId},${d.city},${d.riskScore},${d.fatigueDuration},${d.interventionStatus},${d.timestamp}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "fatigue_safety_report.csv";
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">疲劳驾驶数字化安全管控平台</h1>
            <p className="text-slate-400 text-xs uppercase tracking-widest">Digital Fatigue Prevention Solution</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs text-slate-300">系统状态: 运行中</span>
          </div>
          <button 
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-colors px-4 py-2 rounded-md text-sm font-medium"
          >
            <Download size={16} /> 导出报表
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto w-full">
        
        {/* L1 & L2 Core Target Monitoring */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
              <TrendingDown size={20} className="text-indigo-600" />
              整体目标监控 (Target Monitoring)
            </h2>
            <div className="text-sm font-mono text-slate-500 flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-md border border-slate-200 shadow-inner">
              <Clock size={14} className="text-slate-400" />
              数据更新时间: <span className="text-indigo-600 font-bold">{formatDateTime(currentTime)}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_KPIS.map((kpi, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-slate-500 text-sm font-medium">{kpi.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    kpi.level === 'L1' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {kpi.level}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-slate-900">{kpi.value}</span>
                  <span className="text-slate-400 text-sm">{kpi.unit}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {kpi.change < 0 ? (
                    <span className="text-green-500 flex items-center">
                      <ArrowDownRight size={16} /> {Math.abs(kpi.change)}%
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <ArrowUpRight size={16} /> {kpi.change}%
                    </span>
                  )}
                  <span className="text-slate-400 font-light">较上周期</span>
                </div>
                <p className="mt-3 text-xs text-slate-400 border-t pt-3 line-clamp-1">{kpi.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mid Section: AI Insights & Trend Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trend Analysis */}
          <section className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Activity size={20} className="text-indigo-600" />
                疲劳防控趋势分析 (Trend Analysis)
              </h3>
              <div className="flex gap-2">
                <button className="text-xs bg-slate-100 px-3 py-1 rounded text-slate-600 font-medium">近7天</button>
                <button className="text-xs hover:bg-slate-50 px-3 py-1 rounded text-slate-400 font-medium">近30天</button>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_TREND}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  />
                  <Legend iconType="circle" />
                  <Line yAxisId="left" type="monotone" dataKey="accidentRate" name="事故率 (L1)" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  <Line yAxisId="right" type="monotone" dataKey="interventionRate" name="干预响应率 (L2)" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  <Line yAxisId="left" type="monotone" dataKey="fatigueBehavior" name="高危行为水平" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* AI Advisor */}
          <section className="bg-slate-900 text-white p-6 rounded-xl shadow-inner relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <BrainCircuit size={20} className="text-indigo-400" />
                  AI 智能安全顾问 (Insight)
                </h3>
                {loadingAI && <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>}
              </div>
              <div className="space-y-4">
                {insights.length > 0 ? insights.map((insight, idx) => (
                  <div key={idx} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      {insight.type === 'alert' && <AlertTriangle size={14} className="text-red-400" />}
                      {insight.type === 'positive' && <CheckCircle2 size={14} className="text-green-400" />}
                      {insight.type === 'suggestion' && <Activity size={14} className="text-blue-400" />}
                      <span className="text-xs font-bold text-slate-300">{insight.title}</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{insight.content}</p>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500 italic text-sm">
                    正在根据实时指标生成深度建议...
                  </div>
                )}
              </div>
            </div>
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 blur-3xl -ml-10 -mb-10"></div>
          </section>
        </div>

        {/* Bottom Section: Scenarios Monitoring & Detailed Data */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Business Scenario Monitoring */}
          <section className="xl:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <Filter size={20} className="text-indigo-600" />
                业务场景监控
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">事前: 预防性熔断达标</span>
                    <span className="font-bold">100%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[100%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">事中: 强制干预触发率</span>
                    <span className="font-bold">8.4%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-orange-400 h-full w-[8.4%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">事后: 复岗考核通过率</span>
                    <span className="font-bold">94.2%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[94.2%]"></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">风险城市排行榜</h4>
                <div className="space-y-3">
                  {['广州', '成都', '武汉', '无锡', '杭州'].map((city, i) => (
                    <div key={city} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400 w-4">{i+1}</span>
                        <span className="text-sm font-medium text-slate-700">{city}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${i < 2 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                        {95 - i*7}% 风险值
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Data Table */}
          <section className="xl:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Clock size={20} className="text-indigo-600" />
                实时预警明细 (Detailed Data)
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="搜索司机ID..." 
                    className="pl-8 pr-4 py-1.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <div className="absolute left-2.5 top-2.5 text-slate-400">
                    <Filter size={14} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                    <th className="px-6 py-4">司机ID</th>
                    <th className="px-6 py-4">所在城市</th>
                    <th className="px-6 py-4">风险指数</th>
                    <th className="px-6 py-4">连续驾驶时长 (H)</th>
                    <th className="px-6 py-4">干预状态</th>
                    <th className="px-6 py-4">触发时间</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_DETAILS.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-indigo-600 font-medium">{row.driverId}</td>
                      <td className="px-6 py-4 text-slate-600">{row.city}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${row.riskScore > 80 ? 'bg-red-500' : row.riskScore > 60 ? 'bg-orange-400' : 'bg-emerald-400'}`} 
                              style={{width: `${row.riskScore}%`}}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold">{row.riskScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{row.fatigueDuration}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          row.interventionStatus === '已干预' ? 'bg-emerald-100 text-emerald-700' : 
                          row.interventionStatus === '干预中' ? 'bg-orange-100 text-orange-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {row.interventionStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-mono">{row.timestamp}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs">查看详情</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>显示 1 到 {MOCK_DETAILS.length} 项，共 {MOCK_DETAILS.length} 项</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-50" disabled>上一页</button>
                <button className="px-3 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-50" disabled>下一页</button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Sticky Bottom Summary (Mobile/Persistent Info) */}
      <footer className="bg-white border-t border-slate-200 px-8 py-4 flex items-center justify-between text-sm sticky bottom-0 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-slate-600 font-medium">高风险预警: <span className="text-red-600">12</span> 位</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <span className="text-slate-600 font-medium">中风险观测: <span className="text-orange-600">45</span> 位</span>
          </div>
        </div>
        <div className="text-slate-400 text-xs italic">
          注: 本系统遵循《数字化解决方案》三层架构(L1结果层/L2过程层/L3基础层)设计。
        </div>
      </footer>
    </div>
  );
};

export default App;
