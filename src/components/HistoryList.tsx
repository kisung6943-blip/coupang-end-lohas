import React, { useState } from 'react';
import { CalculationRecord } from '../types';
import { formatWon, formatPercent } from '../utils/calculator';
import { Trash2, History, ArrowUpRight, Scale, CheckSquare, Square, Search, Plus, Package } from 'lucide-react';

interface HistoryListProps {
  records: CalculationRecord[];
  onSelect: (record: CalculationRecord) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  selectedForComparison: string[];
  onToggleCompare: (id: string) => void;
  onStartComparison: () => void;
  onAddNew?: () => void;
  activeId?: string;
  onExportBackup?: () => void;
  onImportBackup?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  records,
  onSelect,
  onDelete,
  onClearAll,
  selectedForComparison,
  onToggleCompare,
  onStartComparison,
  onAddNew,
  activeId,
  onExportBackup,
  onImportBackup,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter((rec) =>
    rec.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (records.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mx-auto mb-3">
          <Package className="w-5 h-5 text-blue-500" />
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">등록된 상품이 없습니다</p>
        <p className="text-xs text-slate-400 mt-1 mb-4 max-w-xs mx-auto leading-relaxed">
          좌측 비용 필드를 입력하고 <strong className="text-blue-500">"계산 및 상품 등록"</strong> 버튼을 누르면 상품이 안전하게 관리 목록에 추가됩니다.
        </p>
        {onImportBackup && (
          <label className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl cursor-pointer transition-colors font-medium flex items-center gap-2">
            <History className="w-4 h-4" />
            이전 백업 데이터 불러오기 (복구)
            <input type="file" accept=".json" className="hidden" onChange={onImportBackup} />
          </label>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/60 dark:bg-slate-900/40">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Package className="w-4 h-4 text-blue-500" />
          📦 등록 상품 목록 ({records.length}개)
        </h4>
        <div className="flex items-center gap-2">
          {onImportBackup && (
            <label className="text-[11px] bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded cursor-pointer transition-colors">
              복구
              <input type="file" accept=".json" className="hidden" onChange={onImportBackup} />
            </label>
          )}
          {onExportBackup && (
            <button
              onClick={onExportBackup}
              className="text-[11px] bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded cursor-pointer transition-colors"
            >
              백업
            </button>
          )}
          <button
            onClick={onClearAll}
            className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors cursor-pointer ml-1"
          >
            전체 삭제
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        
        {/* Search Bar & New Product Shortcut */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="상품명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400"
            />
          </div>
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="px-2.5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors border border-blue-100/30 dark:border-blue-900/10 cursor-pointer shrink-0"
              title="새 상품 추가"
            >
              <Plus className="w-3.5 h-3.5" />
              신규 등록
            </button>
          )}
        </div>

        {selectedForComparison.length >= 2 && (
          <button
            onClick={onStartComparison}
            className="w-full bg-[#0074e9] hover:bg-[#005cb8] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/10 active:scale-[0.98] cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            선택한 {selectedForComparison.length}개 상품 마진 비교하기
          </button>
        )}

        <div className="max-h-80 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
              검색 조건과 일치하는 상품이 없습니다.
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const isComparing = selectedForComparison.includes(rec.id);
              const isActive = activeId === rec.id;

              return (
                <div
                  key={rec.id}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-50/35 dark:bg-blue-950/15'
                      : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40'
                  }`}
                >
                  {/* Checkbox for comparison */}
                  <button
                    onClick={() => onToggleCompare(rec.id)}
                    className="text-slate-400 hover:text-blue-500 transition-colors shrink-0 cursor-pointer"
                    title="비교 목록에 추가"
                  >
                    {isComparing ? (
                      <CheckSquare className="w-4.5 h-4.5 text-blue-500 fill-blue-500/10" />
                    ) : (
                      <Square className="w-4.5 h-4.5" />
                    )}
                  </button>

                  {/* Info and load */}
                  <div 
                    onClick={() => onSelect(rec)}
                    className="flex-1 min-w-0 cursor-pointer text-left group"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-500 transition-colors">
                          {rec.title}
                        </span>
                        {isActive && (
                          <span className="bg-blue-500 text-white dark:bg-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0">
                            수정중
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400 shrink-0">
                        {new Date(rec.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>판매가: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{formatWon(rec.input.sellingPrice)}</strong></span>
                      <span>마진율: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{formatPercent(rec.result.marginRate)}</strong></span>
                      <span>END ROAS: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{rec.result.marginRate > 0 ? `${rec.result.endRoas}%` : 'N/A'}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => onSelect(rec)}
                      className="p-1 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer"
                      title="수정하기 (불러오기)"
                    >
                      <ArrowUpRight className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => onDelete(rec.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-1">
          💡 왼쪽 체크박스를 2개 이상 선택해 위 비교 버튼을 누르면 한눈에 다각도 상품 비교가 가능합니다.
        </p>
      </div>
    </div>
  );
};
