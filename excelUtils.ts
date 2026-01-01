
import * as XLSX from 'xlsx';
import { Session, Bet, Source } from './types';

export const exportSessionToExcel = (session: Session, source?: Source) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  let cumulativeProfit = 0;
  
  // Сортируем историю по времени (от старых к новым) для расчета накопительного профита
  const sortedHistory = [...session.history].sort((a, b) => a.timestamp - b.timestamp);

  const data = sortedHistory.map((bet: Bet) => {
    const betProfit = bet.type === 'adjustment' ? bet.potentialProfit : (bet.outcome === 'win' ? bet.potentialProfit : -bet.amount);
    cumulativeProfit += betProfit;
    
    const isToday = bet.timestamp >= startOfDay;

    return {
      'Дата и время': new Date(bet.timestamp).toLocaleString('ru-RU'),
      'Тип': bet.type === 'adjustment' ? 'Правка' : 'Ставка',
      'Стратегия': session.strategyType,
      'Источник': source?.name || 'Без источника',
      'Шаг': bet.step,
      'Сумма': bet.amount,
      'Коэффициент': bet.odds,
      'Результат': bet.outcome === 'win' ? 'Выигрыш' : 'Проигрыш',
      'Профит': betProfit,
      'Накопительный профит': cumulativeProfit,
      'Банк после': bet.bankAfter,
      'Заметки': bet.notes || ''
    };
  });

  // Добавляем итоговую строку
  const totalProfit = session.bank - session.initialBank;
  const todayProfit = session.history
    .filter(bet => bet.timestamp >= startOfDay)
    .reduce((acc, bet) => {
      const p = bet.type === 'adjustment' ? bet.potentialProfit : (bet.outcome === 'win' ? bet.potentialProfit : -bet.amount);
      return acc + p;
    }, 0);

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Добавляем суммарную информацию в конец или отдельными ячейками
  XLSX.utils.sheet_add_aoa(worksheet, [
    [],
    ['ИТОГО:'],
    ['Общий профит', totalProfit],
    ['Профит за сегодня', todayProfit]
  ], { origin: -1 });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'История');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${session.name}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
