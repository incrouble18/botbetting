
export enum StrategyType {
  OrdinaryFlat = 'OrdinaryFlat',
  SafeLadder5 = 'SafeLadder5',
  SplitScale7 = 'SplitScale7'
}

export interface Source {
  id: string;
  name: string;
}

export interface Bet {
  id: string;
  type?: 'bet' | 'adjustment'; 
  amount: number;
  odds: number;
  potentialProfit: number;
  outcome: 'win' | 'loss';
  matchInfo?: string;
  notes?: string;
  timestamp: number;
  strategy: StrategyType;
  sourceId: string;
  step: number; 
  bankAfter: number; 
  isSequenceEnd?: boolean; 
}

export interface Session {
  id: string;
  name: string;
  bank: number;
  initialBank: number;
  strategyType: StrategyType;
  sourceId: string;
  currentLadderStep: number;
  history: Bet[];
  lastScalingBank?: number;
  flatPercentage?: number; // Настройка для стратегии OrdinaryFlat
  safeLadderInitialType?: 'percent' | 'fixed';
  safeLadderInitialValue?: number;
}

export interface StrategyDefinition {
  id: StrategyType;
  name: string;
  shortDescription: string;
  fullDescription: string;
  rules: { step: number; action: string }[];
  parameters: Record<string, number>;
}

export interface AppState {
  sessions: Session[];
  sources: Source[];
}
