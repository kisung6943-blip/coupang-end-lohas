import React from 'react';
import { CalculationRecord } from '../types';
import { formatWon, formatPercent } from '../utils/calculator';
import { Scale, X, Sparkles, AlertCircle, Trash } from 'lucide-react';

interface ComparisonMatrixProps {
  compareIds: string[];
  records: CalculationRecord[];
  onRemoveCompareId: (id: string) => void;
  onClearComparison: () => void;
  onSelectRecord: (record: CalculationRecord) => void;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  compareIds,
  records,
  onRemoveCompareId,
  onClearComparison,
  onSelectRecord,
}) => {
  // Filter selected records
  const selectedRecords = records.filter((r) => compareIds.includes(r.id));

  if (selectedRecords.length === 0) {
    return null;
  }

  // Find best performer based on Margin Rate
  let bestMarginRecordId = '';
  let highestMargin = -999;
  selectedRecords.forEach((rec) => {
    if (rec.result.marginRate > highestMargin) {
      highestMargin = rec.result.marginRate;
      bestMarginRecordId = rec.id;
    }
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-blue-50/20 dark:bg-slate-900/40">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-blue-500 animate-bounce" />
          여러 상품 마진/광고 효율 비교표 ({selectedRecords.length}개 상품)
        </h4>
        <button
          onClick={onClearComparison}
          className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1"
        >
          비교 비우기
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-5 overflow-x-auto">
        {selectedRecords.length < 2 ? (
          <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            비교를 시작하려면 최소 2개 이상의 상품을 선택해 주세요.
          </div>
        ) : (
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-400 border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="p-3 font-semibold text-slate-700 dark:text-slate-300 min-w-[120px]">비교 항목</th>
                {selectedRecords.map((rec) => {
                  const isBest = rec.id === bestMarginRecordId;
                  return (
                    <th 
                      key={rec.id} 
                      className={`p-3 font-bold text-center relative min-w-[160px] ${
                        isBest ? 'bg-amber-500/5 text-slate-900 dark:text-amber-300' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {isBest && (
                          <span className="flex items-center gap-0.5 text-[9px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded-full shadow">
                            <Sparkles className="w-2.5 h-2.5 fill-white" />
                            최고 마진
                          </span>
                        )}
                        <span className="truncate max-w-[150px] block">{rec.title}</span>
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => onSelectRecord(rec)}
                            className="text-[9px] font-medium text-blue-600 hover:underline cursor-pointer"
                          >
                            입력값 로드
                          </button>
                          <span className="text-[9px] text-slate-300 dark:text-slate-700">|</span>
                          <button
                            onClick={() => onRemoveCompareId(rec.id)}
                            className="text-[9px] font-medium text-red-500 hover:underline cursor-pointer"
                          >
                            제외
                          </button>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {/* 판매가 */}
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white bg-slate-50/40 dark:bg-slate-900/40">판매가</td>
                {selectedRecords.map((rec) => (
                  <td key={rec.id} className="p-3 text-center font-semibold text-slate-900 dark:text-white">
                    {formatWon(rec.input.sellingPrice)}
                  </td>
                ))}
              </tr>
              {/* 상품원가 */}
              <tr>
                <td className="p-3 text-slate-500">상품원가 (원가비중)</td>
                {selectedRecords.map((rec) => {
                  const pct = (rec.input.productCost / rec.input.sellingPrice) * 100;
                  return (
                    <td key={rec.id} className="p-3 text-center">
                      {formatWon(rec.input.productCost)} ({pct.toFixed(1)}%)
                    </td>
                  );
                })}
              </tr>
              {/* 물류비 */}
              <tr>
                <td className="p-3 text-slate-500">배송 및 포장비</td>
                {selectedRecords.map((rec) => {
                  const logistic = rec.input.shippingFee + rec.input.packagingFee;
                  return (
                    <td key={rec.id} className="p-3 text-center">
                      {formatWon(logistic)}
                    </td>
                  );
                })}
              </tr>
              {/* 플랫폼 수수료 */}
              <tr>
                <td className="p-3 text-slate-500">플랫폼 수수료 ({selectedRecords[0]?.input.platformFeeRate}%)</td>
                {selectedRecords.map((rec) => (
                  <td key={rec.id} className="p-3 text-center">
                    {formatWon(rec.result.platformFee)}
                  </td>
                ))}
              </tr>
              {/* 세금 */}
              <tr>
                <td className="p-3 text-slate-500">지출 세금 (부가세+종소세)</td>
                {selectedRecords.map((rec) => {
                  const tax = rec.result.vat + rec.result.incomeTax;
                  return (
                    <td key={rec.id} className="p-3 text-center">
                      {formatWon(tax)}
                    </td>
                  );
                })}
              </tr>
              {/* 순수익 */}
              <tr className="bg-blue-50/10 dark:bg-blue-950/5">
                <td className="p-3 font-semibold text-blue-700 dark:text-blue-400">순수익 (1개당)</td>
                {selectedRecords.map((rec) => (
                  <td key={rec.id} className="p-3 text-center font-bold text-blue-700 dark:text-blue-300">
                    {formatWon(rec.result.netProfit)}
                  </td>
                ))}
              </tr>
              {/* 마진율 */}
              <tr className="bg-teal-50/10 dark:bg-teal-950/5">
                <td className="p-3 font-semibold text-teal-700 dark:text-teal-400">최종 마진율</td>
                {selectedRecords.map((rec) => {
                  const isBest = rec.id === bestMarginRecordId;
                  return (
                    <td 
                      key={rec.id} 
                      className={`p-3 text-center font-extrabold text-sm ${
                        isBest ? 'text-teal-600 dark:text-teal-300 bg-amber-500/5' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {formatPercent(rec.result.marginRate)}
                    </td>
                  );
                })}
              </tr>
              {/* END ROAS */}
              <tr className="bg-indigo-50/10 dark:bg-indigo-950/5">
                <td className="p-3 font-semibold text-indigo-700 dark:text-indigo-400">손익분기 END ROAS</td>
                {selectedRecords.map((rec) => (
                  <td key={rec.id} className="p-3 text-center font-bold text-indigo-700 dark:text-indigo-300 text-sm">
                    {rec.result.marginRate > 0 ? `${rec.result.endRoas}%` : 'N/A'}
                  </td>
                ))}
              </tr>
              {/* 하루 광고비 */}
              <tr>
                <td className="p-3 text-slate-500">하루 설정 광고비</td>
                {selectedRecords.map((rec) => (
                  <td key={rec.id} className="p-3 text-center">
                    {formatWon(rec.input.dailyAdBudget)}
                  </td>
                ))}
              </tr>
              {/* 손익분기 판매수량 */}
              <tr>
                <td className="p-3 text-slate-500">하루 손익분기 판매량</td>
                {selectedRecords.map((rec) => (
                  <td key={rec.id} className="p-3 text-center font-semibold">
                    {rec.result.breakEvenSalesQty === 'UNAVAILABLE' ? (
                      <span className="text-red-500">불가능 (적자)</span>
                    ) : (
                      `${rec.result.breakEvenSalesQty}개`
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
