
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
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
  Filter, 
  SendHorizontal, 
  User, 
  Bot, 
  Navigation,
  XCircle,
  Map as MapIcon,
  ChevronLeft,
  Moon,
  Sun
} from 'lucide-react';

import { CORE_KPIS, MOCK_TREND, MOCK_DETAILS, CITY_MARKERS, CityData } from './constants';
import { AIInsight } from './types';
import { getAIInsights, getCustomResponse } from './services/geminiService';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface MapProps {
  selectedCityName: string | null;
  onSelectCity: (name: string | null) => void;
}

/**
 * Procedural City Heatmap View
 * Rendered when a specific city is selected.
 */
const CityHeatmap: React.FC<{ cityName: string; onBack: () => void }> = ({ cityName, onBack }) => {
  const [isNightMode, setIsNightMode] = useState(true);
  
  // Find city data to influence heatmap intensity
  const cityData = useMemo(() => CITY_MARKERS.find(c => c.name === cityName), [cityName]);
  
  // Procedurally generate some heat spots
  const heatSpots = useMemo(() => {
    const spots = [];
    const seed = cityName.length;
    for (let i = 0; i < 8; i++) {
      spots.push({
        x: 20 + ((seed * (i + 1) * 17) % 60),
        y: 20 + ((seed * (i + 1) * 31) % 60),
        size: 80 + ((seed * i) % 120),
        opacity: 0.3 + (cityData?.riskScore || 50) / 200
      });
    }
    return spots;
  }, [cityName, cityData]);

  return (
    <div className="relative w-full h-[650px] bg-[#0f172a] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* City Map Header */}
      <div className="absolute top-8 left-10 z-20">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-indigo-400 hover:text-white transition-colors mb-4 bg-slate-800/50 backdrop-blur px-4 py-2 rounded-xl border border-slate-700"
        >
          <ChevronLeft size={20} /> 返回全国地图
        </button>
        <div className="flex items-center gap-4">
          <h2 className="text-4xl font-black text-white tracking-tight">{cityName}风险分布热力图</h2>
          <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-sm font-bold animate-pulse">实时监测中</span>
        </div>
        <p className="text-slate-400 text-lg mt-2 flex items-center gap-2">
          {isNightMode ? '夜间 (22:00-6:00) 疲劳干预覆盖率分析' : '日间 (6:00-22:00) 运营安全分布'}
        </p>
      </div>

      {/* Mode Toggle Overlay */}
      <div className="absolute top-8 right-10 z-20 flex bg-slate-800/80 backdrop-blur-md p-1 rounded-2xl border border-slate-700">
        <button 
          onClick={() => setIsNightMode(false)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${!isNightMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Sun size={20} /> 日间
        </button>
        <button 
          onClick={() => setIsNightMode(true)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${isNightMode ? 'bg-indigo-900 text-indigo-100 shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Moon size={20} /> 夜间
        </button>
      </div>

      {/* Stylized Urban Map Background */}
      <div className="absolute inset-0 flex items-center justify-center p-12 select-none">
        <svg viewBox="0 0 1000 700" className="w-full h-full">
          <defs>
            {/* Urban Grid Pattern */}
            <pattern id="urbanGrid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="none" stroke="rgba(79, 70, 229, 0.08)" strokeWidth="1" />
              <rect x="10" y="10" width="80" height="80" rx="4" fill="rgba(30, 41, 59, 0.2)" />
            </pattern>
            {/* Heat Spot Radial Gradient */}
            <radialGradient id="heatGradient">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#ef4444" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Map Base Layer */}
          <rect width="1000" height="700" fill="url(#urbanGrid)" />
          
          {/* Main Arterial Roads */}
          <g stroke="rgba(79, 70, 229, 0.15)" strokeWidth="6" fill="none">
            <path d="M0,350 L1000,350" />
            <path d="M500,0 L500,700" />
            <circle cx="500" cy="350" r="150" strokeWidth="4" />
            <circle cx="500" cy="350" r="280" strokeWidth="3" />
            <path d="M150,150 L850,550" strokeWidth="2" strokeDasharray="10,10" />
            <path d="M150,550 L850,150" strokeWidth="2" strokeDasharray="10,10" />
          </g>

          {/* Risk Heat Spots */}
          <g>
            {heatSpots.map((spot, i) => (
              <circle 
                key={i} 
                cx={spot.x + '%'} 
                cy={spot.y + '%'} 
                r={spot.size} 
                fill="url(#heatGradient)"
                opacity={spot.opacity}
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.4}s` }}
              />
            ))}
          </g>

          {/* Night Mode Shadow Mask (Only visible in night mode) */}
          {isNightMode && (
            <rect 
              width="1000" height="700" 
              fill="#020617" 
              fillOpacity="0.65" 
              className="transition-opacity duration-1000"
            />
          )}

          {/* Night/Day Indicator Icon (following the drawing) */}
          <g transform="translate(850, 80)">
             <rect width="100" height="100" rx="20" fill={isNightMode ? "#1e293b" : "#fcd34d"} fillOpacity="0.9" />
             {isNightMode ? (
               <path d="M50,20 A30,30 0 1,0 80,50 A20,20 0 1,1 50,20" fill="#cbd5e1" transform="translate(10,10) scale(0.8)" />
             ) : (
               <circle cx="50" cy="50" r="25" fill="#f59e0b" />
             )}
          </g>
        </svg>
      </div>

      {/* Legend for City View */}
      <div className="absolute bottom-10 right-10 bg-slate-800/80 backdrop-blur-xl px-8 py-5 rounded-3xl border border-slate-700 shadow-2xl flex flex-col gap-4">
        <h4 className="text-white font-bold uppercase tracking-wider text-sm border-b border-slate-700 pb-2">图例说明</h4>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
          <span className="text-slate-300 text-sm font-bold">高疲劳风险聚集区</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-500/50"></div>
          <span className="text-slate-300 text-sm font-bold">常规干预覆盖区</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-700">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>数据置信度</span>
            <span className="text-emerald-400">98.2%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChinaMap: React.FC<MapProps> = ({ selectedCityName, onSelectCity }) => {
  const [hoveredCity, setHoveredCity] = useState<CityData | null>(null);

  const handleMapBackgroundClick = () => {
    onSelectCity(null);
  };

  const getTooltipStyle = (city: CityData) => {
    let translateX = '-50%';
    if (city.x < 25) translateX = '0%';
    if (city.x > 75) translateX = '-100%';

    const isTop = city.y < 40;
    const translateY = isTop ? '20px' : 'calc(-100% - 20px)';

    return {
      left: `${city.x}%`,
      top: `${city.y}%`,
      transform: `translate(${translateX}, ${translateY})`,
      position: 'absolute' as const,
    };
  };

  return (
    <div 
      className="relative w-full h-[650px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group cursor-default"
      onClick={handleMapBackgroundClick}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
      
      <div className="absolute top-8 left-10 z-10 pointer-events-none">
        <div className="flex items-center gap-3 mb-1">
          <Navigation className="text-indigo-400 animate-pulse" size={24} />
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">National Service Coverage & Risk Map</h2>
        </div>
      </div>

      <div className="absolute top-8 right-10 z-10 flex gap-6 pointer-events-none">
        <div className="bg-slate-800/80 backdrop-blur-md px-6 py-3 rounded-xl border border-slate-700 shadow-xl">
          <div className="text-sm text-slate-400 uppercase font-black mb-1 tracking-wider">活跃城市</div>
          <div className="text-4xl font-black text-white tracking-tighter">24 <span className="text-xl text-indigo-400">个</span></div>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-md px-6 py-3 rounded-xl border border-slate-700 shadow-xl">
          <div className="text-sm text-slate-400 uppercase font-black mb-1 tracking-wider">总运力规模</div>
          <div className="text-4xl font-black text-white tracking-tighter">42,850 <span className="text-xl text-emerald-400">人</span></div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-16">
        <div className="relative w-full h-full max-w-5xl">
          <svg viewBox="0 0 1000 700" className="w-full h-full drop-shadow-[0_0_60px_rgba(79,70,229,0.25)]">
            <path 
              d="M875,70 L910,120 L890,160 L920,240 L930,300 L950,420 L940,480 L910,540 L880,590 L850,620 L780,660 L730,680 L650,670 L550,680 L450,650 L350,600 L250,560 L180,520 L140,450 L100,350 L80,280 L120,220 L200,160 L300,120 L450,100 L550,90 L650,110 L750,120 L800,100 L840,70 Z" 
              fill="rgba(30, 41, 59, 0.85)" 
              stroke="rgba(79, 70, 229, 0.4)" 
              strokeWidth="2.5"
            />
            <ellipse cx="730" cy="690" rx="22" ry="12" fill="rgba(30, 41, 59, 0.85)" stroke="rgba(79, 70, 229, 0.4)" strokeWidth="1" />
            
            {CITY_MARKERS.map((city) => {
              const markerX = city.x * 10;
              const markerY = city.y * 7;
              const isSelected = selectedCityName === city.name;
              const isDanger = city.status === 'danger';
              const isWarning = city.status === 'warning';
              const themeColor = isDanger ? '#ef4444' : isWarning ? '#fb923c' : '#6366f1';
              
              const offX = city.labelOffset?.x ?? 20;
              const offY = city.labelOffset?.y ?? -20;

              return (
                <g 
                  key={city.name} 
                  className={`cursor-pointer group/marker transition-opacity duration-300 ${selectedCityName && !isSelected ? 'opacity-30' : 'opacity-100'}`}
                  onMouseEnter={() => setHoveredCity(city)}
                  onMouseLeave={() => setHoveredCity(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCity(city.name);
                  }}
                >
                  <circle cx={markerX} cy={markerY} r="15" className="animate-ping opacity-20" fill={themeColor} />
                  <circle cx={markerX} cy={markerY} r={isSelected ? 10 : 7} fill={themeColor} stroke={isSelected ? '#fff' : 'none'} strokeWidth={isSelected ? 2 : 0} className="transition-all duration-300 group-hover/marker:r-9" style={{ filter: `drop-shadow(0 0 12px ${themeColor}cc)` }} />
                  
                  <g transform={`translate(${markerX + offX}, ${markerY + offY})`}>
                    <rect x="-8" y="-12" width="130" height="75" rx="10" fill="rgba(15, 23, 42, 0.9)" className={`transition-all duration-300 backdrop-blur-md border ${isSelected ? 'opacity-100 border-indigo-400' : 'opacity-0 group-hover/marker:opacity-100 border-slate-700'}`} />
                    <text x="0" y="8" className="fill-slate-100 text-[18px] font-black pointer-events-none select-none">{city.name}</text>
                    <g transform="translate(0, 24)">
                      <rect x="0" y="0" width="80" height="8" rx="4" fill="rgba(71, 85, 105, 0.5)" />
                      <rect x="0" y="0" width={(city.riskScore / 100) * 80} height="8" rx="4" fill={themeColor} className="transition-all duration-700 ease-out" />
                      <text x="86" y="8" className="fill-slate-300 text-[15px] font-black font-mono pointer-events-none">{city.riskScore}%</text>
                      <text x="0" y="22" className="fill-slate-500 text-[10px] font-bold uppercase tracking-tight">疲劳风险指数 (RISK)</text>
                    </g>
                    <text x="0" y="58" className={`fill-slate-400 text-[13px] font-black transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover/marker:opacity-100'}`}>活跃司机: {city.driverCount}</text>
                  </g>
                </g>
              );
            })}
          </svg>

          {hoveredCity && !selectedCityName && (
            <div className="z-20 pointer-events-none transition-all duration-200" style={getTooltipStyle(hoveredCity)}>
              <div className="bg-white p-6 rounded-2xl shadow-2xl border-2 border-indigo-100 min-w-[280px]">
                <div className={`absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-white rotate-45 border-indigo-100 ${hoveredCity.y < 40 ? '-top-3 border-t-2 border-l-2' : '-bottom-3 border-r-2 border-b-2'}`} />
                <div className="relative flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-slate-900">{hoveredCity.name}</span>
                  <span className={`px-3 py-1 rounded-full text-[12px] font-black uppercase tracking-widest ${hoveredCity.status === 'danger' ? 'bg-red-100 text-red-600' : hoveredCity.status === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>{hoveredCity.status}</span>
                </div>
                <div className="relative space-y-4">
                  <div className="flex justify-between items-center"><span className="text-lg text-slate-500 font-bold">疲劳风险指数</span><span className={`text-2xl font-black ${hoveredCity.riskScore > 80 ? 'text-red-500' : 'text-slate-900'}`}>{hoveredCity.riskScore}%</span></div>
                  <div className="flex justify-between items-center"><span className="text-lg text-slate-500 font-bold">活跃司机规模</span><span className="text-2xl font-black text-slate-900">{hoveredCity.driverCount.toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-8 left-8 flex items-center gap-10 bg-slate-800/80 backdrop-blur-xl px-8 py-4 rounded-full border border-slate-600 shadow-2xl pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
          <span className="text-sm text-slate-100 uppercase tracking-widest font-black">高风险区</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.8)]"></div>
          <span className="text-sm text-slate-100 uppercase tracking-widest font-black">观测预警</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.8)]"></div>
          <span className="text-sm text-slate-100 uppercase tracking-widest font-black">运营平稳</span>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCityName, setSelectedCityName] = useState<string | null>(null);
  
  const [userQuery, setUserQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [queryLoading, setQueryLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingAI(true);
      const data = await getAIInsights(CORE_KPIS, MOCK_TREND);
      setInsights(data);
      setLoadingAI(false);
    };
    fetchInsights();
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, queryLoading]);

  const formatDateTime = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}`;
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || queryLoading) return;
    const currentQuery = userQuery;
    setUserQuery('');
    setChatHistory(prev => [...prev, { role: 'user', content: currentQuery }]);
    setQueryLoading(true);
    const response = await getCustomResponse(currentQuery, CORE_KPIS, MOCK_TREND);
    setChatHistory(prev => [...prev, { role: 'assistant', content: response || '无法获取回答' }]);
    setQueryLoading(false);
  };

  const downloadCSV = () => {
    const headers = "ID,Driver,City,RiskScore,FatigueHours,Status,Time\n";
    const dataToExport = selectedCityName 
      ? MOCK_DETAILS.filter(d => d.city === selectedCityName)
      : MOCK_DETAILS;
    const rows = dataToExport.map(d => `${d.id},${d.driverId},${d.city},${d.riskScore},${d.fatigueDuration},${d.interventionStatus},${d.timestamp}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `fatigue_safety_report_${selectedCityName || 'all'}.csv`;
    link.click();
  };

  const filteredDetails = selectedCityName ? MOCK_DETAILS.filter(d => d.city === selectedCityName) : MOCK_DETAILS;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg"><ShieldAlert size={24} /></div>
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
          <button onClick={downloadCSV} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-colors px-4 py-2 rounded-md text-sm font-medium"><Download size={16} /> 导出报表</button>
        </div>
      </header>

      <main className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto w-full">
        {/* Conditional Map View: Switch between National and City */}
        {selectedCityName ? (
          <CityHeatmap cityName={selectedCityName} onBack={() => setSelectedCityName(null)} />
        ) : (
          <ChinaMap selectedCityName={selectedCityName} onSelectCity={setSelectedCityName} />
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800"><TrendingDown size={20} className="text-indigo-600" />整体目标监控 (Target Monitoring)</h2>
            <div className="text-sm font-mono text-slate-500 flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-md border border-slate-200 shadow-inner"><Clock size={14} className="text-slate-400" />数据更新时间: <span className="text-indigo-600 font-bold">{formatDateTime(currentTime)}</span></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_KPIS.map((kpi, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2"><span className="text-slate-500 text-sm font-medium">{kpi.title}</span><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${kpi.level === 'L1' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{kpi.level}</span></div>
                <div className="flex items-baseline gap-2 mb-4"><span className="text-3xl font-bold text-slate-900">{kpi.value}</span><span className="text-slate-400 text-sm">{kpi.unit}</span></div>
                <div className="flex items-center gap-2 text-sm">{kpi.change < 0 ? (<span className="text-green-500 flex items-center"><ArrowDownRight size={16} /> {Math.abs(kpi.change)}%</span>) : (<span className="text-red-500 flex items-center"><ArrowUpRight size={16} /> {kpi.change}%</span>)}<span className="text-slate-400 font-light">较上周期</span></div>
                <p className="mt-3 text-xs text-slate-400 border-t pt-3 line-clamp-1">{kpi.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6"><h3 className="font-semibold flex items-center gap-2"><Activity size={20} className="text-indigo-600" />疲劳防控趋势分析 (Trend Analysis)</h3></div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_TREND}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend iconType="circle" />
                  <Line yAxisId="left" type="monotone" dataKey="accidentRate" name="事故率 (L1)" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  <Line yAxisId="right" type="monotone" dataKey="interventionRate" name="干预响应率 (L2)" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  <Line yAxisId="left" type="monotone" dataKey="fatigueBehavior" name="高危行为水平" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-slate-900 text-white rounded-xl shadow-inner relative overflow-hidden flex flex-col h-[520px]">
            <div className="p-6 pb-2 relative z-10 border-b border-slate-800"><div className="flex items-center justify-between"><h3 className="font-semibold flex items-center gap-2"><BrainCircuit size={20} className="text-indigo-400" />AI 智能安全顾问 (Insight)</h3>{loadingAI && <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>}</div></div>
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth custom-scrollbar">
              <div className="space-y-4">
                {insights.length > 0 ? insights.map((insight, idx) => (
                  <div key={idx} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"><div className="flex items-center gap-2 mb-2">{insight.type === 'alert' && <AlertTriangle size={14} className="text-red-400" />}{insight.type === 'positive' && <CheckCircle2 size={14} className="text-green-400" />}{insight.type === 'suggestion' && <Activity size={14} className="text-blue-400" />}<span className="text-xs font-bold text-slate-300">{insight.title}</span></div><p className="text-sm text-slate-400 leading-relaxed">{insight.content}</p></div>
                )) : !loadingAI && (<div className="flex flex-col items-center justify-center py-12 text-slate-500 italic text-sm">正在分析最新指标...</div>)}
              </div>
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={`flex gap-3 ${chat.role === 'user' ? 'flex-row-reverse' : ''}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${chat.role === 'user' ? 'bg-indigo-600' : 'bg-slate-700'}`}>{chat.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-indigo-400" />}</div><div className={`p-3 rounded-lg text-sm max-w-[85%] ${chat.role === 'user' ? 'bg-indigo-600/20 text-indigo-100' : 'bg-slate-800 text-slate-300'}`}>{chat.content}</div></div>
              ))}
              {queryLoading && (<div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><Bot size={14} className="text-indigo-400" /></div><div className="bg-slate-800 p-3 rounded-lg flex items-center gap-2"><span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100"></span><span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200"></span></div></div>)}
            </div>
            <div className="p-4 bg-slate-900 border-t border-slate-800"><form onSubmit={handleQuerySubmit} className="relative flex items-center gap-2"><input type="text" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="向AI询问更多关于运营数据的细节..." className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 rounded-full pl-5 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder:text-slate-500" /><button type="submit" disabled={queryLoading || !userQuery.trim()} className="absolute right-1.5 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors rounded-full"><SendHorizontal size={16} /></button></form></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl -mr-10 -mt-10"></div><div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 blur-3xl -ml-10 -mb-10"></div>
          </section>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <section className="xl:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2"><Filter size={20} className="text-indigo-600" />业务场景监控</h3><div className="space-y-6"><div><div className="flex justify-between text-sm mb-2"><span className="text-slate-500">事前: 预防性熔断达标</span><span className="font-bold">100%</span></div><div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-indigo-500 h-full w-[100%]"></div></div></div><div><div className="flex justify-between text-sm mb-2"><span className="text-slate-500">事中: 强制干预触发率</span><span className="font-bold">8.4%</span></div><div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-orange-400 h-full w-[8.4%]"></div></div></div><div><div className="flex justify-between text-sm mb-2"><span className="text-slate-500">事后: 复岗考核通过率</span><span className="font-bold">94.2%</span></div><div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full w-[94.2%]"></div></div></div></div><div className="mt-8 pt-6 border-t"><h4 className="text-xs font-bold text-slate-400 uppercase mb-4">风险城市排行榜</h4><div className="space-y-3">{CITY_MARKERS.sort((a, b) => b.riskScore - a.riskScore).slice(0, 5).map((city, i) => (<div key={city.name} className={`flex items-center justify-between cursor-pointer p-1 rounded-md transition-colors ${selectedCityName === city.name ? 'bg-indigo-50' : 'hover:bg-slate-50'}`} onClick={() => setSelectedCityName(selectedCityName === city.name ? null : city.name)}><div className="flex items-center gap-3"><span className="text-xs font-mono text-slate-400 w-4">{i+1}</span><span className="text-sm font-medium text-slate-700">{city.name}</span></div><span className={`text-xs px-2 py-0.5 rounded-full ${city.status === 'danger' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>{city.riskScore}% 风险值</span></div>))}</div></div></div>
          </section>

          <section className="xl:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50/50"><div className="flex items-center gap-3"><h3 className="font-semibold text-slate-800 flex items-center gap-2"><Clock size={20} className="text-indigo-600" />实时预警明细 (Detailed Data)</h3>{selectedCityName && (<span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">当前筛选: {selectedCityName}<button onClick={() => setSelectedCityName(null)}><XCircle size={14} className="hover:text-indigo-900" /></button></span>)}</div></div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead><tr className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100"><th className="px-6 py-4">司机ID</th><th className="px-6 py-4">所在城市</th><th className="px-6 py-4">风险指数</th><th className="px-6 py-4">连续驾驶时长 (H)</th><th className="px-6 py-4">干预状态</th><th className="px-6 py-4">触发时间</th><th className="px-6 py-4 text-right">操作</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{filteredDetails.length > 0 ? filteredDetails.map((row) => (<tr key={row.id} className="hover:bg-slate-50 transition-colors"><td className="px-6 py-4 font-mono text-indigo-600 font-medium">{row.driverId}</td><td className="px-6 py-4 text-slate-600">{row.city}</td><td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className={`h-full ${row.riskScore > 80 ? 'bg-red-500' : row.riskScore > 60 ? 'bg-orange-400' : 'bg-emerald-400'}`} style={{width: `${row.riskScore}%`}}></div></div><span className="text-xs font-semibold">{row.riskScore}</span></div></td><td className="px-6 py-4 text-slate-600">{row.fatigueDuration}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${row.interventionStatus === '已干预' ? 'bg-emerald-100 text-emerald-700' : row.interventionStatus === '干预中' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{row.interventionStatus}</span></td><td className="px-6 py-4 text-slate-500 text-xs font-mono">{row.timestamp}</td><td className="px-6 py-4 text-right"><button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs">查看详情</button></td></tr>)) : (<tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">该区域暂无活跃预警信息</td></tr>)}</tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 px-8 py-4 flex items-center justify-between text-sm sticky bottom-0 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex gap-8"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-slate-600 font-medium">高风险预警: <span className="text-red-600">12</span> 位</span></div><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-400"></span><span className="text-slate-600 font-medium">中风险观测: <span className="text-orange-600">45</span> 位</span></div></div>
        <div className="text-slate-400 text-xs italic">注: 本系统遵循《数字化解决方案》三层架构(L1结果层/L2过程层/L3基础层)设计。</div>
      </footer>
    </div>
  );
};

export default App;
