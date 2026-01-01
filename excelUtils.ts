
import * as XLSX from 'xlsx';
import { Session, Bet, Source } from './types';

export const exportSessionToExcel = (session: Session, source?: Source) => {
  const data = session.history.map((bet: Bet) => ({
    'Дата и время': new Date(bet.timestamp).toLocaleString('ru-RU'),
    'Тип': bet.type === 'adjustment' ? 'Правка' : 'Ставка',
    'Стратегия': session.strategyType,
    'Источник': source?.name || 'Без источника',
    'Шаг': bet.step,
    'Сумма': bet.amount,
    'Коэффициент': bet.odds,
    'Результат': bet.outcome === 'win' ? 'Выигрыш' : 'Проигрыш',
    'Профит': bet.type === 'adjustment' ? bet.potentialProfit : (bet.outcome === 'win' ? bet.potentialProfit : -bet.amount),
    'Банк после': bet.bankAfter,
    'Заметки': bet.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'История');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${session.name}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
