
import { KPI, TrendData, ScenarioDetail } from './types';

export const CORE_KPIS: KPI[] = [
  {
    title: '事故发生率 (L1)',
    value: 0.85,
    change: -22.5,
    unit: '件/百万订单',
    level: 'L1',
    description: '因疲劳驾驶导致的事故发生数量'
  },
  {
    title: '高风险行为水平 (L1)',
    value: 12.4,
    change: -15.2,
    unit: '%',
    level: 'L1',
    description: '处于疲劳状态的运营时长占比'
  },
  {
    title: '干预执行完成率 (L2)',
    value: 98.2,
    change: 4.5,
    unit: '%',
    level: 'L2',
    description: '接收预警后实际停止接单或休息比例'
  },
  {
    title: '识别准确率 (L2)',
    value: 92.8,
    change: 2.1,
    unit: '%',
    level: 'L2',
    description: 'DMS系统识别出的疲劳状态真实度'
  }
];

export const MOCK_TREND: TrendData[] = [
  { date: '05-01', accidentRate: 1.2, fatigueBehavior: 15.5, interventionRate: 85 },
  { date: '05-05', accidentRate: 1.1, fatigueBehavior: 14.8, interventionRate: 88 },
  { date: '05-10', accidentRate: 0.95, fatigueBehavior: 13.2, interventionRate: 92 },
  { date: '05-15', accidentRate: 1.05, fatigueBehavior: 14.0, interventionRate: 90 },
  { date: '05-20', accidentRate: 0.88, fatigueBehavior: 12.5, interventionRate: 95 },
  { date: '05-25', accidentRate: 0.85, fatigueBehavior: 12.4, interventionRate: 98 },
];

export const MOCK_DETAILS: ScenarioDetail[] = [
  { id: '1', driverId: 'D-9527', city: '广州', riskScore: 88, fatigueDuration: 4.5, interventionStatus: '已干预', timestamp: '2024-05-25 14:20' },
  { id: '2', driverId: 'D-1024', city: '成都', riskScore: 92, fatigueDuration: 5.1, interventionStatus: '干预中', timestamp: '2024-05-25 15:05' },
  { id: '3', driverId: 'D-8848', city: '无锡', riskScore: 75, fatigueDuration: 3.8, interventionStatus: '已干预', timestamp: '2024-05-25 15:15' },
  { id: '4', driverId: 'D-2048', city: '杭州', riskScore: 45, fatigueDuration: 2.5, interventionStatus: '未干预', timestamp: '2024-05-25 16:30' },
  { id: '5', driverId: 'D-5566', city: '深圳', riskScore: 82, fatigueDuration: 4.2, interventionStatus: '已干预', timestamp: '2024-05-25 16:45' },
];
