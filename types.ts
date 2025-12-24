
export interface KPI {
  title: string;
  value: string | number;
  change: number;
  unit: string;
  level: 'L1' | 'L2' | 'L3';
  description: string;
}

export interface TrendData {
  date: string;
  accidentRate: number;
  fatigueBehavior: number;
  interventionRate: number;
}

export interface ScenarioDetail {
  id: string;
  driverId: string;
  city: string;
  riskScore: number;
  fatigueDuration: number;
  interventionStatus: '已干预' | '干预中' | '未干预';
  timestamp: string;
}

export interface AIInsight {
  title: string;
  content: string;
  type: 'alert' | 'suggestion' | 'positive';
}
