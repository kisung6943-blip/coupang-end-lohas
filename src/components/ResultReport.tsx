import React, { useRef, useState, useEffect } from 'react';
import { CalculationInput, CalculationResult } from '../types';
import { formatWon, formatPercent } from '../utils/calculator';
import { 
  TrendingUp, 
  Coins, 
  Percent, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Printer, 
  Download, 
  HelpCircle,
  Package,
  Sparkles,
  Info
} from 'lucide-react';

interface ResultReportProps {
  input: CalculationInput;
  result: CalculationResult;
  onCopyText: () => void;
  onExportExcel: () => void;
  record?: import('../types').CalculationRecord | null;
  onUpdateMemo?: (memo: string) => void;
}

export const ResultReport: React.FC<ResultReportProps> = ({
  input,
  result,
  onCopyText,
  onExportExcel,
  record,
  onUpdateMemo,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const [simQty, setSimQty] = useState<number>(10);

  // Sync simQty with breakEvenSalesQty when calculation result changes
  useEffect(() => {
    if (typeof result.breakEvenSalesQty === 'number' && result.breakEvenSalesQty > 0) {
      setSimQty(result.breakEvenSalesQty);
    } else {
      setSimQty(10);
    }
  }, [result.breakEvenSalesQty]);

  const {
    sellingPrice,
    productCost,
    shippingFee,
    packagingFee,
    otherCost,
    dailyAdBudget,
    adRoas,
  } = input;

  const {
    platformFee,
    vat,
    incomeTax,
    netProfit,
    marginRate,
    endRoas,
    adDecision,
    maxAdSpend,
    breakEvenSalesQty,
    costBreakdown,
  } = result;

  // Calculate percentages for the stacked bar
  const pctProduct = (productCost / sellingPrice) * 100;
  const pctShipping = (shippingFee / sellingPrice) * 100;
  const pctPackaging = (packagingFee / sellingPrice) * 100;
  const pctOther = (otherCost / sellingPrice) * 100;
  const pctPlatform = (platformFee / sellingPrice) * 100;
  const pctVat = (vat / sellingPrice) * 100;
  const pctIncomeTax = (incomeTax / sellingPrice) * 100;
  const pctNetProfit = (netProfit / sellingPrice) * 100;
  const pctTotalCosts = 100 - pctNetProfit;

  // Custom function to trigger printing of just the report card
  const handlePrint = () => {
    window.print();
  };

  // Safe formatting for display
  const displayMarginRate = formatPercent(marginRate);
  const displayEndRoas = marginRate > 0 ? `${endRoas}%` : 'N/A';

  return (
    <div ref={reportRef} id="result-report-card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white flex justify-between items-center print:bg-none print:text-black print:border-b print:border-slate-300">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            쿠팡 END LOHAS 계산 결과
          </h3>
          <p className="text-xs text-blue-100 mt-1 print:hidden">
            입력된 수치를 바탕으로 분석한 최종 마진 보고서입니다.
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={onCopyText}
            className="p-2 bg-blue-500/30 hover:bg-blue-500/50 rounded-lg text-white transition-colors duration-150 text-xs flex items-center gap-1.5 font-medium"
            title="결과 텍스트 복사"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">복사</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2 bg-blue-500/30 hover:bg-blue-500/50 rounded-lg text-white transition-colors duration-150 text-xs flex items-center gap-1.5 font-medium"
            title="PDF 인쇄 / 저장"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={onExportExcel}
            className="p-2 bg-blue-500/30 hover:bg-blue-500/50 rounded-lg text-white transition-colors duration-150 text-xs flex items-center gap-1.5 font-medium"
            title="엑셀 CSV 다운로드"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">엑셀</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 transition-all">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">판매가</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white block truncate">{formatWon(sellingPrice)}</span>
          </div>
          
          <div className="bg-blue-50/60 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100/50 dark:border-blue-900/30 transition-all">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mb-1">순수익</span>
            <span className="text-xl font-bold text-blue-700 dark:text-blue-300 block truncate">
              {netProfit > 0 ? `+${formatWon(netProfit)}` : formatWon(netProfit)}
            </span>
          </div>

          <div className="bg-teal-50/60 dark:bg-teal-950/20 p-4 rounded-xl border border-teal-100/50 dark:border-teal-900/30 transition-all">
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 block mb-1">마진율</span>
            <span className={`text-xl font-bold block truncate ${netProfit > 0 ? 'text-teal-700 dark:text-teal-300' : 'text-red-600 dark:text-red-400'}`}>
              {displayMarginRate}
            </span>
          </div>

          <div className="bg-indigo-50/60 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 transition-all">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">END ROAS</span>
            <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300 block truncate">{displayEndRoas}</span>
          </div>
        </div>

        {/* Ad Decision Callout */}
        <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            광고 타당성 및 권장 진단
          </h4>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              {adRoas !== null ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">입력된 광고 ROAS:</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{adRoas}%</span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">손익분기 END ROAS:</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{displayEndRoas}</span>
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">END ROAS ({displayEndRoas}) 이상</span>으로 광고가 운영되어야 제품 마진이 남습니다.
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-semibold">권장 목표 ROAS</span>
                <span className="text-xs text-slate-600 dark:text-slate-400">쿠팡 평균 안정권: <strong className="text-slate-800 dark:text-slate-200">550% ~ 700%</strong></span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="w-full md:w-auto flex justify-end">
              {adRoas !== null ? (
                adDecision === 'PROFITABLE' ? (
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 px-4 py-2 rounded-xl text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-600/10" />
                    <div className="text-left">
                      <span className="font-bold text-sm block">✅ 광고 가능 (수익 발생)</span>
                      <span className="text-[10px] opacity-80">ROAS가 END ROAS보다 높습니다.</span>
                    </div>
                  </div>
                ) : adDecision === 'BREAK_EVEN' ? (
                  <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 px-4 py-2 rounded-xl text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 fill-amber-600/10" />
                    <div className="text-left">
                      <span className="font-bold text-sm block">⚠️ 손익분기 (마진 제로)</span>
                      <span className="text-[10px] opacity-80">수익과 광고비 지출이 1:1 대칭입니다.</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 px-4 py-2 rounded-xl text-red-800 dark:text-red-300">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 fill-red-600/10" />
                    <div className="text-left">
                      <span className="font-bold text-sm block">❌ 광고 시 적자 (손실 발생)</span>
                      <span className="text-[10px] opacity-80">ROAS가 END ROAS보다 낮습니다.</span>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 px-4 py-2.5 rounded-xl text-blue-800 dark:text-blue-300 text-sm font-semibold">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ROAS 입력 시 판정 활성화
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profit Structure - Stacked Bar Chart */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Coins className="w-4 h-4 text-blue-500" />
            💵 수익 및 지출 구조 (판매가 대비 비중)
          </h4>
          
          <div className="space-y-4">
            {/* Horizontal Stacked Bar */}
            <div className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex text-[10px] font-bold text-white shadow-inner">
              {marginRate <= 0 ? (
                <div className="h-full bg-red-500 flex items-center justify-center w-full">
                  비용 초과 (적자 구조 {formatPercent(marginRate)})
                </div>
              ) : (
                <>
                  {pctProduct > 1 && (
                    <div 
                      style={{ width: `${pctProduct}%` }} 
                      className="bg-sky-500 h-full flex items-center justify-center truncate px-0.5 transition-all duration-500"
                      title={`상품원가: ${pctProduct.toFixed(1)}%`}
                    >
                      {pctProduct > 12 && '원가'}
                    </div>
                  )}
                  {pctPlatform > 1 && (
                    <div 
                      style={{ width: `${pctPlatform}%` }} 
                      className="bg-indigo-500 h-full flex items-center justify-center truncate px-0.5 transition-all duration-500"
                      title={`플랫폼수수료: ${pctPlatform.toFixed(1)}%`}
                    >
                      {pctPlatform > 12 && '수수료'}
                    </div>
                  )}
                  {(pctShipping + pctPackaging + pctOther) > 1 && (
                    <div 
                      style={{ width: `${pctShipping + pctPackaging + pctOther}%` }} 
                      className="bg-amber-500 h-full flex items-center justify-center truncate px-0.5 transition-all duration-500"
                      title={`기타비용/배송/포장: ${(pctShipping + pctPackaging + pctOther).toFixed(1)}%`}
                    >
                      {(pctShipping + pctPackaging + pctOther) > 12 && '기타/물류'}
                    </div>
                  )}
                  {(pctVat + pctIncomeTax) > 1 && (
                    <div 
                      style={{ width: `${pctVat + pctIncomeTax}%` }} 
                      className="bg-rose-400 h-full flex items-center justify-center truncate px-0.5 transition-all duration-500"
                      title={`세금(부가세+종소세): ${(pctVat + pctIncomeTax).toFixed(1)}%`}
                    >
                      {(pctVat + pctIncomeTax) > 12 && '세금'}
                    </div>
                  )}
                  {pctNetProfit > 1 && (
                    <div 
                      style={{ width: `${pctNetProfit}%` }} 
                      className="bg-emerald-500 h-full flex items-center justify-center truncate px-0.5 transition-all duration-500 animate-pulse"
                      title={`순수익: ${pctNetProfit.toFixed(1)}%`}
                    >
                      {pctNetProfit > 12 && `순수익 ${pctNetProfit.toFixed(1)}%`}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-sky-500 rounded-sm"></div>
                <span className="text-slate-600 dark:text-slate-400">상품원가 ({pctProduct.toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div>
                <span className="text-slate-600 dark:text-slate-400">플랫폼수수료 ({pctPlatform.toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-sm"></div>
                <span className="text-slate-600 dark:text-slate-400">물류/기타 ({(pctShipping + pctPackaging + pctOther).toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-rose-400 rounded-sm"></div>
                <span className="text-slate-600 dark:text-slate-400">세금 ({(pctVat + pctIncomeTax).toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">순수익 ({pctNetProfit.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Analysis Breakdown Table */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-500" />
            📋 세부 비용 분석
          </h4>
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800/80">
                <tr>
                  <th scope="col" className="px-4 py-3">비용 항목</th>
                  <th scope="col" className="px-4 py-3 text-right">금액</th>
                  <th scope="col" className="px-4 py-3 text-right">판매가 대비 비율</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>상품원가
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-900 dark:text-white">{formatWon(productCost)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{pctProduct.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>배송비
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-900 dark:text-white">{formatWon(shippingFee)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{pctShipping.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>포장비
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-900 dark:text-white">{formatWon(packagingFee)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{pctPackaging.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>기타비용
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-900 dark:text-white">{formatWon(otherCost)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{pctOther.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>플랫폼수수료
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-900 dark:text-white">{formatWon(platformFee)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{pctPlatform.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>부가세 (10%)
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-900 dark:text-white">{formatWon(vat)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{pctVat.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>종합소득세 (25%)
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-900 dark:text-white">{formatWon(incomeTax)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{pctIncomeTax.toFixed(2)}%</td>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-800/40 font-bold border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-3 text-slate-900 dark:text-white">총비용 (누적)</td>
                  <td className="px-4 py-3 text-right text-red-600 dark:text-red-400">{formatWon(costBreakdown.totalCost)}</td>
                  <td className="px-4 py-3 text-right text-slate-900 dark:text-white">{pctTotalCosts.toFixed(2)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Ad Feasibility Color Ranges Bar */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
            <Percent className="w-4 h-4 text-indigo-500" />
            📈 ROAS 성과 구간분석
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            광고수익률(ROAS) 구간에 따라 마진 생존여부를 색상으로 시각화한 지표입니다.
          </p>

          <div className="relative pt-6 pb-2 px-1">
            {/* Color Bar Track */}
            <div className="h-4 w-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 via-emerald-400 to-emerald-600 flex relative overflow-visible">
              {/* Markers & Labels */}
              <div className="absolute left-0 -top-6 text-[10px] font-semibold text-red-600 dark:text-red-400">0% (적자)</div>
              
              {marginRate > 0 && endRoas > 0 && (
                <div 
                  className="absolute -top-7 transform -translate-x-1/2 flex flex-col items-center group z-10"
                  style={{ left: `${Math.min(Math.max((endRoas / 1000) * 100, 15), 85)}%` }}
                >
                  <span className="text-[10px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded shadow">
                    손익분기 {endRoas}%
                  </span>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rotate-45 mt-0.5"></div>
                  <div className="w-0.5 h-4 bg-indigo-600 absolute top-5"></div>
                </div>
              )}

              <div className="absolute left-[55%] -top-6 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hidden sm:block">550% (안정)</div>
              <div className="absolute left-[70%] -top-6 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 hidden sm:block">700% (고수익)</div>
            </div>

            {/* Colored Zones explanation */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] sm:text-xs">
              <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 p-2 rounded border border-red-100 dark:border-red-900/30 text-center font-medium">
                <div>빨강 영역 (0 ~ {displayEndRoas})</div>
                <div className="opacity-80">광고 시 무조건 적자</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 p-2 rounded border border-amber-100 dark:border-amber-900/30 text-center font-medium">
                <div>노랑 영역 ({displayEndRoas} ~ 550%)</div>
                <div className="opacity-80">소폭 생존 및 손익분기</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 p-2 rounded border border-emerald-100 dark:border-emerald-900/30 text-center font-medium">
                <div>초록 영역 (550% ~ 700%+)</div>
                <div className="opacity-80">수익 안정권 및 광고 적극 가능</div>
              </div>
            </div>
          </div>
        </div>

        {/* Break-even Sales Quantity & Dynamic Profit Simulator */}
        <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-5 space-y-5">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Package className="w-4.5 h-4.5 text-blue-500" />
              📦 하루 단위 손익분기 및 수익 분석
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">설정된 하루 광고비</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{formatWon(dailyAdBudget)}</span>
              </div>
              <div className="flex justify-between items-center bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-100/50 dark:border-blue-900/20">
                <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">하루 최소 목표 판매량 (본전)</span>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {breakEvenSalesQty === 'UNAVAILABLE' ? (
                    <span className="text-red-500 text-xs font-bold">수익성 확보 후 산정 가능 (적자)</span>
                  ) : (
                    `${breakEvenSalesQty}개 (이상 판매)`
                  )}
                </span>
              </div>
            </div>
            {breakEvenSalesQty !== 'UNAVAILABLE' && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                💡 하루 광고비 <strong className="text-slate-700 dark:text-slate-300">{formatWon(dailyAdBudget)}</strong>를 회수하고 순익 분기점을 돌파하려면, 매일 최소 <strong className="text-blue-600 dark:text-blue-400">{breakEvenSalesQty}개</strong> 이상의 제품을 판매해야 합니다.
              </p>
            )}
          </div>

          {/* Interactive Sales Simulator */}
          <div className="border-t border-slate-200/60 dark:border-slate-800/80 pt-4">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              📈 하루 판매수량 시뮬레이터 (원하는 판매량 직접 입력)
            </h5>
            
            <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-150 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">하루 예상 판매수량 설정:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSimQty(q => Math.max(0, q - 10))}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    -10
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimQty(q => Math.max(0, q - 1))}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={simQty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                      setSimQty(isNaN(val) ? 0 : val);
                    }}
                    className="w-16 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-500 mr-2">개</span>
                  <button
                    type="button"
                    onClick={() => setSimQty(q => q + 1)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimQty(q => q + 10)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    +10
                  </button>
                </div>
              </div>

              {/* Slider selector */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max={Math.max(100, Math.ceil((breakEvenSalesQty === 'UNAVAILABLE' ? 10 : breakEvenSalesQty) * 2.5))}
                  value={simQty}
                  onChange={(e) => setSimQty(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>0개</span>
                  {typeof breakEvenSalesQty === 'number' && breakEvenSalesQty > 0 && (
                    <button 
                      type="button"
                      className="text-blue-500 font-bold hover:underline"
                      onClick={() => setSimQty(breakEvenSalesQty)}
                    >
                      본전 맞춤 ({breakEvenSalesQty}개)
                    </button>
                  )}
                  <span>{Math.max(100, Math.ceil((breakEvenSalesQty === 'UNAVAILABLE' ? 10 : breakEvenSalesQty) * 2.5))}개+</span>
                </div>
              </div>

              {/* Simulation Result Metrics */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">예상 매출액</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatWon(simQty * sellingPrice)}</span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-500 block font-medium">제품 순마진 총액</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+{formatWon(simQty * netProfit)}</span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">하루 광고비</span>
                  <span className="text-xs font-bold text-red-500">-{formatWon(dailyAdBudget)}</span>
                </div>
              </div>

              {/* Status Banner */}
              {(() => {
                const totalMargin = simQty * netProfit;
                const finalProfit = totalMargin - dailyAdBudget;
                const isProfitable = finalProfit > 0;
                const isBreakEven = finalProfit === 0;

                return (
                  <div className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                    isProfitable
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                      : isBreakEven
                      ? 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      : 'bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-300'
                  }`}>
                    {isProfitable ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          하루 순수익 <strong className="text-emerald-700 dark:text-emerald-300 font-extrabold">{formatWon(finalProfit)}</strong> 발생! (흑자 달성 🥳)
                        </span>
                      </>
                    ) : isBreakEven ? (
                      <>
                        <Info className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>딱 본전(손익 분기점)입니다. 남는 순수익은 0원입니다.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>
                          하루 순손실 <strong className="text-red-700 dark:text-red-400 font-extrabold">{formatWon(Math.abs(finalProfit))}</strong> 발생! (적자 위험 😢)
                        </span>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* 💡 Ad Operation Analysis recommendations */}
        <div className="border border-blue-100 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/10 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 border-b border-blue-100/60 dark:border-blue-950/40 pb-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            💡 스마트 광고 운영 종합 분석
          </h4>

          <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-3.5 list-none pl-0">
            {/* 1. 광고 가능 여부 */}
            <li className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">광고 실행 가능성</strong>
                {marginRate <= 0 ? (
                  <p className="text-red-600 dark:text-red-400">
                    현재 마진 구조가 적자입니다. 상품원가를 낮추거나 판매가를 인상하기 전까지는 절대 광고를 가동해선 안 됩니다.
                  </p>
                ) : endRoas > 600 ? (
                  <p>
                    END ROAS가 <span className="font-semibold text-red-600">{endRoas}%</span>로 매우 높은 편입니다. 마진율이 낮으므로 광고 가동 시 극도의 정교한 키워드 타겟팅이 필요합니다.
                  </p>
                ) : (
                  <p>
                    현재 마진 구조 상 <span className="font-semibold text-emerald-600 dark:text-emerald-400">{displayMarginRate}</span>의 수익이 확보되며, 광고수익률 <span className="font-semibold text-indigo-600 dark:text-indigo-400">{displayEndRoas}</span>을 초과하면 즉시 순수익 광고 가동이 가능합니다.
                  </p>
                )}
              </div>
            </li>

            {/* 2. 권장 ROAS */}
            <li className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">권장 운용 ROAS 범위</strong>
                <p>
                  손익분기를 초과하여 건전한 비즈니스 운영을 위한 최적의 목표 ROAS는{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {marginRate > 0 ? `${Math.max(endRoas + 100, 550)}% ~ ${Math.max(endRoas + 250, 700)}%` : '550% ~ 700%'}
                  </span>{' '}
                  구간입니다.
                </p>
              </div>
            </li>

            {/* 3. 공격적 운영 가능 여부 */}
            <li className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">공격적 광고 입찰 타당성</strong>
                {marginRate > 0.25 ? (
                  <p className="text-emerald-600 dark:text-emerald-400">
                    마진율이 <span className="font-bold">{displayMarginRate}</span>로 25%를 상회하므로 우수한 체력을 가지고 있습니다. 상위 노출 및 브랜드 인지도 선점을 위해 초기에 공격적인 입찰과 높은 일일 예산을 무리 없이 배정 가능합니다.
                  </p>
                ) : marginRate > 0.12 ? (
                  <p>
                    마진율이 보통 수준({displayMarginRate})입니다. 초반에는 타겟 세부 키워드 중심으로 촘촘하게 마케팅 성과를 검증하고 점진적으로 광고 범위를 확장하는 방어적-공격적 절충안이 권장됩니다.
                  </p>
                ) : (
                  <p className="text-red-500">
                    마진율이 <span className="font-bold">{displayMarginRate}</span>로 극도로 타이트합니다. 공격적 마케팅은 절대 불가하며 극소수의 최고효율 타겟 키워드만 초저단가로 입찰해야 파산을 면합니다.
                  </p>
                )}
              </div>
            </li>

            {/* 4. 줄이면 좋은 비용 */}
            <li className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                4
              </div>
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">최적의 비용 절감 스팟</strong>
                <p className="space-y-1">
                  {pctProduct > 40 && (
                    <span className="block text-amber-600 dark:text-amber-400">
                      ⚠️ 상품원가 비중이 <span className="font-semibold">{pctProduct.toFixed(1)}%</span>로 다소 과도합니다. 사입 단가 네고 및 제조공정 개선을 통해 마진을 넓혀야 생존성이 증가합니다.
                    </span>
                  )}
                  {pctShipping > 10 && (
                    <span className="block text-amber-600 dark:text-amber-400">
                      🚚 물류(배송비/포장비) 비용 비중이 <span className="font-semibold">{(pctShipping + pctPackaging).toFixed(1)}%</span>로 높은 편입니다. 쿠팡 제트배송 연계 및 3PL 계약 조건 단가 개선을 검토해보세요.
                    </span>
                  )}
                  {pctProduct <= 40 && pctShipping <= 10 && (
                    <span>비용 구조가 비교적 조화롭습니다. 예상치 못한 추가 원자재 인상이나 반품률(기타비용) 리스크에 유의하십시오.</span>
                  )}
                </p>
              </div>
            </li>

            {/* 5. 최대 광고 가능한 금액 */}
            <li className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                5
              </div>
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">1개당 최대 가용 광고비 (CPA 한계선)</strong>
                <p>
                  수익을 유지하면서 지출 가능한 단일 상품당 최대 가용 광고 한계 비용은{' '}
                  <span className="font-bold text-red-600 dark:text-red-400">{formatWon(maxAdSpend)}</span>입니다.{' '}
                  <span className="text-[11px] opacity-85">
                    (즉, 광고 획득당 비용(CPA)이 이 금액을 초과할 경우 마진이 적자로 돌아섭니다.)
                  </span>
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Memo Section */}
        {record && onUpdateMemo && (
          <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-5 mt-6">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <span className="text-lg">📝</span> 광고 운영 및 수정 메모
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              광고 예산을 변경하거나 키워드를 수정했을 때의 변경 사항과 성과를 기록해 보세요.
            </p>
            <textarea
              value={record.memo || ''}
              onChange={(e) => onUpdateMemo(e.target.value)}
              placeholder="예: 7/5 광고예산 2만원으로 증액, 핵심키워드 단가 500원 수정"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y transition-all"
            />
          </div>
        )}
      </div>
    </div>
  );
};
