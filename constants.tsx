
import { StrategyType, StrategyDefinition } from './types';

export const STRATEGIES: Record<StrategyType, StrategyDefinition> = {
  [StrategyType.OrdinaryFlat]: {
    id: StrategyType.OrdinaryFlat,
    name: 'OrdinaryFlat (Умный Ординар)',
    shortDescription: 'Ставки фиксированным процентом от текущего банка. Безопасный рост без азарта.',
    fullDescription: 'Классический банк-менеджмент. Размер каждой ставки пересчитывается в зависимости от текущего состояния банка. Идеально для долгосрочной игры на дистанции.',
    parameters: {
      defaultPercentage: 5,
    },
    rules: [
      { step: 1, action: "Определить процент от банка (обычно 2-5%)." },
      { step: 2, action: "Ставить фиксированный процент от текущего баланса на каждое событие." },
      { step: 3, action: "При росте банка сумма ставки растет, при просадке — уменьшается, защищая капитал." }
    ]
  },
  [StrategyType.SafeLadder5]: {
    id: StrategyType.SafeLadder5,
    name: 'SafeLadder5 (Лесенка 3 шага)',
    shortDescription: 'Короткая лесенка из 3-х ступеней. Реинвестирование прибыли внутри цикла.',
    fullDescription: 'Безопасный формат разгона. Мы делаем всего 3 шага. В случае успеха мы забираем чистую прибыль x2-x3 от начальной ставки и фиксируемся.',
    parameters: {
      bankPercentage: 0.05,
      ladderLength: 3,
      avgOdds: 1.35
    },
    rules: [
      { step: 1, action: "Начать с 5% от текущего банка." },
      { step: 2, action: "При победе: ставить (Ставка + Прибыль) на следующий шаг." },
      { step: 3, action: "После 3-го шага цикл завершается. Прибыль в банк, новый цикл с шага 1." }
    ]
  },
  [StrategyType.SplitScale7]: {
    id: StrategyType.SplitScale7,
    name: 'SplitScale7 (Лесенка до x6 умножение)',
    shortDescription: 'Разделение банка на 6 слотов. Глубокая лесенка до достижения цели x6.',
    fullDescription: 'Агрессивная, но системная стратегия. Мы делим банк на 6 частей и ведем каждую до тех пор, пока она не вырастет в 6 раз.',
    parameters: {
      numParts: 6,
      targetMultiplier: 6.0,
      scaleThreshold: 2.0
    },
    rules: [
      { step: 1, action: "Разделить банк на 6 Unit-ов." },
      { step: 2, action: "Вести лесенку до достижения суммы Unit x 6." },
      { step: 3, action: "При достижении цели цикл закрывается. При проигрыше — берем новый Unit." }
    ]
  }
};
