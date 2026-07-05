import React, { useState, useEffect, useRef } from 'react';
import { calculateLohas, formatWon, formatPercent, formatKoreanWordWon } from './utils/calculator';
import { CalculationInput, CalculationResult, CalculationRecord } from './types';
import { ResultReport } from './components/ResultReport';
import { HistoryList } from './components/HistoryList';
import { ComparisonMatrix } from './components/ComparisonMatrix';
import { 
  Calculator, 
  HelpCircle, 
  History, 
  Moon, 
  Sun, 
  RefreshCw, 
  ChevronDown, 
  ExternalLink,
  Share2, 
  Copy,
  Info,
  CheckCircle2,
  Plus
} from 'lucide-react';

// Initial default inputs
const DEFAULT_INPUTS: CalculationInput = {
  sellingPrice: 25000,
  productCost: 8000,
  shippingFee: 1900,
  packagingFee: 500,
  otherCost: 0,
  platformFeeRate: 11.88,
  dailyAdBudget: 10000,
  adRoas: null,
};

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Inputs state
  const [inputs, setInputs] = useState<CalculationInput>(DEFAULT_INPUTS);
  const [productTitle, setProductTitle] = useState<string>('쿠팡 상품 A');
  const [rawAdRoas, setRawAdRoas] = useState<string>(''); // For raw typing
  const [rawPlatformFeeRate, setRawPlatformFeeRate] = useState<string>(DEFAULT_INPUTS.platformFeeRate.toString());

  // Validation errors
  const [errors, setErrors] = useState<{ sellingPrice?: string; productCost?: string }>({});

  // Calculation outputs
  const [activeResult, setActiveResult] = useState<CalculationResult | null>(null);
  const [activeRecord, setActiveRecord] = useState<CalculationRecord | null>(null);

  // History list
  const [records, setRecords] = useState<CalculationRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lohas_records');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Multi-item comparison selection
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Quick toast messages
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Scroll ref for smooth scroll
  const resultsRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  // Initialize theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Save records to localStorage
  useEffect(() => {
    localStorage.setItem('lohas_records', JSON.stringify(records));
  }, [records]);

  // Show toast utility
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Form input change handlers
  const handleNumberChange = (field: keyof CalculationInput, valueStr: string) => {
    const cleaned = valueStr.replace(/[^0-9]/g, '');
    const numValue = cleaned === '' ? 0 : parseInt(cleaned, 10);
    
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }));

    // Clear validation error if any
    if (field === 'sellingPrice' && numValue > 0) {
      setErrors(prev => ({ ...prev, sellingPrice: undefined }));
    }
    if (field === 'productCost' && numValue > 0) {
      setErrors(prev => ({ ...prev, productCost: undefined }));
    }
  };

  const handleFloatChange = (field: 'platformFeeRate', valueStr: string) => {
    // Allow digits and a single decimal point
    const val = valueStr.replace(/[^0-9.]/g, '');
    // Prevent multiple dots
    const parts = val.split('.');
    const cleaned = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
    
    setRawPlatformFeeRate(cleaned);
    
    const numValue = cleaned === '' || cleaned === '.' ? 0 : parseFloat(cleaned);
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  // Calculate & Save record
  const handleCalculate = (e?: React.FormEvent, mode: 'create' | 'update' = 'create') => {
    if (e) e.preventDefault();

    // Validations
    const newErrors: { sellingPrice?: string; productCost?: string } = {};
    if (!inputs.sellingPrice || inputs.sellingPrice <= 0) {
      newErrors.sellingPrice = '판매가를 입력해 주세요.';
    }
    if (!inputs.productCost || inputs.productCost <= 0) {
      newErrors.productCost = '상품원가를 입력해 주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('필수 항목을 정확히 입력해 주세요.', 'info');
      return;
    }

    // Process ad ROAS from raw typing
    const adRoasVal = rawAdRoas.trim() === '' ? null : parseInt(rawAdRoas.replace(/[^0-9]/g, ''), 10);
    const finalInputs = { ...inputs, adRoas: adRoasVal };

    const result = calculateLohas(finalInputs);
    setActiveResult(result);

    const titleText = productTitle.trim() || `상품 #${records.length + 1}`;

    if (mode === 'update' && activeRecord) {
      const updatedRecord: CalculationRecord = {
        ...activeRecord,
        title: titleText,
        input: finalInputs,
        result: result,
        createdAt: new Date().toISOString(),
      };

      setRecords(prev => prev.map(r => r.id === activeRecord.id ? updatedRecord : r));
      setActiveRecord(updatedRecord);
      showToast(`'${titleText}' 상품 정보가 성공적으로 업데이트되었습니다.`);
    } else {
      const newRecord: CalculationRecord = {
        id: Date.now().toString(),
        title: titleText,
        input: finalInputs,
        result: result,
        createdAt: new Date().toISOString(),
      };

      setRecords(prev => [newRecord, ...prev].slice(0, 100)); // Limit to 100 records
      setActiveRecord(newRecord);
      showToast(`'${titleText}' 상품이 새롭게 등록되었습니다.`);
    }

    // Smooth scroll down to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancelEdit = () => {
    setActiveRecord(null);
    setProductTitle('쿠팡 상품 A');
    showToast('수정 모드가 해제되었습니다.', 'info');
  };

  const handleUpdateMemo = (memo: string) => {
    if (!activeRecord) return;
    const updatedRecord = { ...activeRecord, memo };
    setActiveRecord(updatedRecord);
    setRecords(prev => prev.map(r => r.id === activeRecord.id ? updatedRecord : r));
  };

  const handleUpdateDailySales = (dailySales: import('./types').DailySaleRecord[]) => {
    if (!activeRecord) return;
    const updatedRecord = { ...activeRecord, dailySales };
    setActiveRecord(updatedRecord);
    setRecords(prev => prev.map(r => r.id === activeRecord.id ? updatedRecord : r));
  };

  // Load a record from history
  const handleSelectRecord = (record: CalculationRecord) => {
    setInputs(record.input);
    setProductTitle(record.title);
    setRawAdRoas(record.input.adRoas !== null ? record.input.adRoas.toString() : '');
    setRawPlatformFeeRate(record.input.platformFeeRate.toString());
    setActiveResult(record.result);
    setActiveRecord(record);
    showToast(`'${record.title}' 상품 정보를 불러왔습니다. 수정이 가능합니다.`, 'info');
    
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // Delete individual record
  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    setSelectedForComparison(prev => prev.filter(item => item !== id));
    showToast('기록이 삭제되었습니다.', 'info');
  };

  // Clear all records
  const handleClearAllRecords = () => {
    if (window.confirm('정말 모든 계산 기록을 삭제하시겠습니까?')) {
      setRecords([]);
      setSelectedForComparison([]);
      setShowComparison(false);
      showToast('모든 기록이 초기화되었습니다.', 'info');
    }
  };

  // Backup all records to JSON
  const handleExportBackup = () => {
    if (records.length === 0) {
      showToast('백업할 데이터가 없습니다.', 'info');
      return;
    }
    const dataStr = JSON.stringify(records, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lohas_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('전체 데이터 백업이 완료되었습니다.');
  };

  // Import records from JSON
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedData)) {
          setRecords(importedData);
          showToast('데이터가 성공적으로 복구되었습니다.');
        } else {
          showToast('잘못된 백업 파일입니다.', 'info');
        }
      } catch (err) {
        showToast('파일을 읽는 중 오류가 발생했습니다.', 'info');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Comparison toggle
  const handleToggleCompare = (id: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleStartComparison = () => {
    setShowComparison(true);
    setTimeout(() => {
      comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Reset inputs to default values
  const handleResetForm = () => {
    setInputs(DEFAULT_INPUTS);
    setProductTitle('쿠팡 상품 A');
    setRawAdRoas('');
    setRawPlatformFeeRate(DEFAULT_INPUTS.platformFeeRate.toString());
    setActiveResult(null);
    setActiveRecord(null);
    setErrors({});
    showToast('입력 필드가 초기화되었습니다.', 'info');
  };

  // Excel CSV exporter
  const handleExportExcel = (recordToExport: CalculationRecord | null) => {
    const target = recordToExport || activeRecord;
    if (!target) return;

    const { input, result, title } = target;
    const csvRows = [
      '\uFEFF' + '항목,수치,설명',
      `상품명 / 계산 별칭,${title},`,
      `판매가,${input.sellingPrice}원,`,
      `상품원가,${input.productCost}원,`,
      `배송비,${input.shippingFee}원,기본 1900원`,
      `포장비,${input.packagingFee}원,기본 500원`,
      `기타비용,${input.otherCost}원,`,
      `플랫폼 수수료율,${input.platformFeeRate}%,`,
      `플랫폼 수수료,${result.platformFee}원,판매가 * 수수료율`,
      `세전 순익,${result.preTaxProfit}원,`,
      `부가세 (10%),${result.vat}원,세전순익 * 10% (역산 안함)`,
      `종합소득세 (25%),${result.incomeTax}원,(세전순익 - 부가세) * 25%`,
      `최종 순수익,${result.netProfit}원,세전순익 - 부가세 - 종소세`,
      `최종 마진율,${(result.marginRate * 100).toFixed(2)}%,순수익 / 판매가`,
      `손익분기 END ROAS,${result.marginRate > 0 ? result.endRoas + '%' : 'N/A'},(1 / 마진율) * 100`,
      `하루 광고비,${input.dailyAdBudget}원,`,
      `손익분기 판매수량,${result.breakEvenSalesQty === 'UNAVAILABLE' ? '불가능' : result.breakEvenSalesQty + '개'},하루 광고비 / 순수익 (올림)`,
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `쿠팡_LOHAS_계산_${title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('엑셀 CSV 다운로드가 완료되었습니다!');
  };

  // Result Clipboard copy
  const handleCopyText = (recordToCopy: CalculationRecord | null) => {
    const target = recordToCopy || activeRecord;
    if (!target) return;

    const { input, result, title } = target;
    const text = `
━━━━━━━━━━━━━━━━━━━━━━
📊 쿠팡 END LOHAS 계산 결과: [${title}]
━━━━━━━━━━━━━━━━━━━━━━
• 판매가: ${input.sellingPrice.toLocaleString()}원
• 상품원가: ${input.productCost.toLocaleString()}원
• 배송비: ${input.shippingFee.toLocaleString()}원
• 포장비: ${input.packagingFee.toLocaleString()}원
• 기타비용: ${input.otherCost.toLocaleString()}원
• 플랫폼 수수료: ${result.platformFee.toLocaleString()}원 (${input.platformFeeRate}%)
──────────────────────
• 세전 순익: ${result.preTaxProfit.toLocaleString()}원
• 부가세: ${result.vat.toLocaleString()}원
• 종합소득세: ${result.incomeTax.toLocaleString()}원
• 최종 순수익: ${result.netProfit.toLocaleString()}원
• 최종 마진율: ${(result.marginRate * 100).toFixed(2)}%
• END ROAS: ${result.marginRate > 0 ? result.endRoas + '%' : 'N/A'}
──────────────────────
• 광고 판단: ${
      input.adRoas !== null 
        ? result.adDecision === 'PROFITABLE' 
          ? '✅ 광고 가능 (수익 발생)' 
          : result.adDecision === 'BREAK_EVEN' 
            ? '⚠️ 손익분기 (마진 제로)' 
            : '❌ 광고 시 적자 (손실 발생)'
        : 'END ROAS 이상이면 손익분기'
    }
• 하루 광고비: ${input.dailyAdBudget.toLocaleString()}원
• 손익분기 판매량: ${result.breakEvenSalesQty === 'UNAVAILABLE' ? '불가능 (적자)' : result.breakEvenSalesQty + '개'}
• 최대 광고 가능 금액: ${result.maxAdSpend.toLocaleString()}원
━━━━━━━━━━━━━━━━━━━━━━
쿠팡 END LOHAS 계산기 제공
    `.trim();
    
    navigator.clipboard.writeText(text);
    showToast('결과 정보가 클립보드에 복사되었습니다!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-4 py-3 rounded-xl shadow-lg border border-slate-800 dark:border-slate-200 text-xs font-semibold animate-fade-in transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-6 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/90 dark:bg-slate-900/90 transition-colors">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                쿠팡 END LOHAS 계산기
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">3초 만에 검증하는 광고 마진 타당성</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-100 dark:border-slate-700 cursor-pointer"
              title="다크 모드 설정"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        
        {/* Title Card (Mobile Friendly Banner) */}
        <div className="no-print bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-y-1/3 translate-x-1/4 opacity-10 pointer-events-none">
            <Calculator className="w-80 h-80" />
          </div>
          <div className="relative z-10 max-w-xl space-y-2">
            <span className="bg-blue-500/30 text-blue-100 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Coupang Seller Tool
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              📊 쿠팡 END LOHAS 계산기
            </h2>
            <p className="text-sm sm:text-base text-blue-100 font-medium leading-relaxed">
              "광고를 돌려도 남는 상품인지 3초 만에 확인"
            </p>
            <p className="text-xs text-blue-200/90 pt-1 leading-relaxed">
              쿠팡 판매가와 원가, 부대 비용을 입력하여 순수익, 마진율, 손익분기 광고 성과 지표(END ROAS) 및 최적의 마케팅 방향을 진단해 드립니다.
            </p>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Inputs Form) - Occupies 5 columns on desktop */}
          <section id="input-panel" className="no-print lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 transition-all">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm sm:text-base">
                  <Calculator className="w-4 h-4 text-blue-500" />
                  비용 및 광고 설정 입력
                </h3>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-slate-400 hover:text-blue-500 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  초기화
                </button>
              </div>

              <form onSubmit={handleCalculate} className="space-y-4">
                
                {/* 0. 상품 관리 상태 표시 (신규 등록 vs 수정 모드) */}
                {activeRecord ? (
                  <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-800/40 rounded-xl p-3.5 flex justify-between items-center transition-all animate-fade-in">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 relative shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
                        📝 '{activeRecord.title}' 수정 중
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2 py-1 rounded transition-colors cursor-pointer"
                    >
                      수정 취소
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-800/40 rounded-xl p-3 flex items-center gap-2 transition-all">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      ✨ 새 상품 추가 모드 (계산 시 목록에 새 등록)
                    </span>
                  </div>
                )}

                {/* 1. 상품명 별칭 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    상품명 / 계산 별칭
                  </label>
                  <input
                    type="text"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    placeholder="예: 물티슈 세트, 계절 선풍기 등"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* 2. 판매가 (필수) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      판매가 (필수) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={inputs.sellingPrice === 0 ? '' : inputs.sellingPrice.toLocaleString('ko-KR')}
                      onChange={(e) => handleNumberChange('sellingPrice', e.target.value)}
                      placeholder="0"
                      className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.sellingPrice ? 'border-red-500 dark:border-red-500/80' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium block mt-1 min-h-[14px]">
                      {inputs.sellingPrice > 0 && formatKoreanWordWon(inputs.sellingPrice)}
                    </span>
                    {errors.sellingPrice && (
                      <p className="text-[10px] text-red-500 mt-0.5">{errors.sellingPrice}</p>
                    )}
                  </div>

                  {/* 3. 상품원가 (필수) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      상품원가 (필수) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={inputs.productCost === 0 ? '' : inputs.productCost.toLocaleString('ko-KR')}
                      onChange={(e) => handleNumberChange('productCost', e.target.value)}
                      placeholder="0"
                      className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.productCost ? 'border-red-500 dark:border-red-500/80' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium block mt-1 min-h-[14px]">
                      {inputs.productCost > 0 && formatKoreanWordWon(inputs.productCost)}
                    </span>
                    {errors.productCost && (
                      <p className="text-[10px] text-red-500 mt-0.5">{errors.productCost}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* 4. 배송비 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      배송비
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={inputs.shippingFee.toLocaleString('ko-KR')}
                      onChange={(e) => handleNumberChange('shippingFee', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5">기본 1,900원</span>
                  </div>

                  {/* 5. 포장비 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      포장비
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={inputs.packagingFee.toLocaleString('ko-KR')}
                      onChange={(e) => handleNumberChange('packagingFee', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5">기본 500원</span>
                  </div>

                  {/* 6. 기타비용 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      기타비용
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={inputs.otherCost.toLocaleString('ko-KR')}
                      onChange={(e) => handleNumberChange('otherCost', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5">기본 0원</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* 7. 플랫폼 수수료율 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      쿠팡 카테고리 수수료율 (%)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={rawPlatformFeeRate}
                        onChange={(e) => handleFloatChange('platformFeeRate', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">%</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-1">쿠팡 기본 평균: 11.88%</span>
                  </div>

                  {/* 8. 하루 광고비 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      하루 설정 광고비
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={inputs.dailyAdBudget.toLocaleString('ko-KR')}
                      onChange={(e) => handleNumberChange('dailyAdBudget', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                    />
                    <span className="text-[9px] text-blue-600 dark:text-blue-400 font-medium block mt-1">
                      {inputs.dailyAdBudget > 0 && formatKoreanWordWon(inputs.dailyAdBudget)}
                    </span>
                  </div>
                </div>

                {/* 9. 광고 ROAS (선택) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      현재 / 예상 광고 ROAS (선택)
                    </label>
                    <span className="text-[10px] text-slate-400">입력 시 광고타당성 자동 판정</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={rawAdRoas}
                      onChange={(e) => setRawAdRoas(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="예: 450"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">%</span>
                  </div>
                </div>

                {/* Submit Action Buttons */}
                {activeRecord ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleCalculate(undefined, 'update')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      정보 업데이트
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCalculate(undefined, 'create')}
                      className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold py-3.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      새 상품으로 저장
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-[#0074e9] hover:bg-[#005cb8] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] mt-2 cursor-pointer"
                  >
                    <Calculator className="w-4 h-4" />
                    계산 및 상품 등록
                  </button>
                )}
              </form>
            </div>

            {/* History List Module */}
            <div id="history-panel">
              <HistoryList
                records={records}
                onSelect={handleSelectRecord}
                onDelete={handleDeleteRecord}
                onClearAll={handleClearAllRecords}
                selectedForComparison={selectedForComparison}
                onToggleCompare={handleToggleCompare}
                onStartComparison={handleStartComparison}
                onAddNew={handleResetForm}
                activeId={activeRecord?.id}
                onExportBackup={handleExportBackup}
                onImportBackup={handleImportBackup}
              />
            </div>
          </section>

          {/* Right Column (Results & Report) - Occupies 7 columns on desktop */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* Show dynamic guide when no result is generated yet */}
            {!activeResult ? (
              <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 animate-pulse">
                  <Calculator className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">계산 대기 중</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-6">
                  좌측에 상품 판매가와 원가를 입력하고 <strong className="text-blue-600 dark:text-blue-400">"계산하기"</strong> 버튼을 클릭하시면 쿠팡 광고 성과 보고서가 즉시 생성됩니다.
                </p>
                <div className="flex gap-4 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1"><Info className="w-4 h-4 text-slate-300" /> 세전 순익 & 세금 분석</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Info className="w-4 h-4 text-slate-300" /> 손익분기 END ROAS 산출</span>
                </div>
              </div>
            ) : (
              // Results Display Area
              <div ref={resultsRef} className="space-y-6">
                <ResultReport
                  input={activeRecord ? activeRecord.input : inputs}
                  result={activeResult}
                  onCopyText={() => handleCopyText(activeRecord)}
                  onExportExcel={() => handleExportExcel(activeRecord)}
                  record={activeRecord}
                  onUpdateMemo={handleUpdateMemo}
                  onUpdateDailySales={handleUpdateDailySales}
                />
              </div>
            )}

            {/* Side-by-side Multi-product Comparison Table */}
            {showComparison && selectedForComparison.length > 0 && (
              <div ref={comparisonRef} id="comparison-panel" className="no-print pt-2">
                <ComparisonMatrix
                  compareIds={selectedForComparison}
                  records={records}
                  onRemoveCompareId={handleToggleCompare}
                  onClearComparison={() => {
                    setSelectedForComparison([]);
                    setShowComparison(false);
                    showToast('비교표가 초기화되었습니다.', 'info');
                  }}
                  onSelectRecord={handleSelectRecord}
                />
              </div>
            )}
          </section>

        </div>

      </main>

      {/* Footer */}
      <footer className="no-print bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-12 text-center text-xs text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-500 dark:text-slate-400">쿠팡 END LOHAS 계산기</p>
          <p className="max-w-md mx-auto text-[11px] leading-relaxed">
            이 계산기는 쿠팡 판매 및 광고 시뮬레이션을 위한 보조 도구입니다. 실제 수수료율과 종합소득세율은 사업자 성격(개인/법인) 및 매출 구간에 따라 차이가 있을 수 있으므로 참고용으로만 이용해 주시기 바랍니다.
          </p>
          <p className="pt-2 text-[10px]">© 2026 Coupang END LOHAS Calculator. All Rights Reserved.</p>
        </div>
      </footer>

    </div>
  );
}
