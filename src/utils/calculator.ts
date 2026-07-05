import { CalculationInput, CalculationResult, CostBreakdown } from '../types';

export function calculateLohas(input: CalculationInput): CalculationResult {
  const {
    sellingPrice,
    productCost,
    shippingFee,
    packagingFee,
    otherCost,
    platformFeeRate,
    dailyAdBudget,
    adRoas,
  } = input;

  // 1. 플랫폼 수수료 (원 단위 반올림)
  const platformFee = Math.round(sellingPrice * (platformFeeRate / 100));

  // 2. 세전 순익 (원 단위 반올림)
  // 세전순익 = 판매가 - 상품원가 - 배송비 - 포장비 - 기타비용 - 플랫폼수수료
  const preTaxProfit = Math.round(
    sellingPrice - productCost - shippingFee - packagingFee - otherCost - platformFee
  );

  // 3. 부가세 (세전순익 * 10%)
  // 세전순익이 음수인 경우 부가세는 0원으로 처리하는 것이 합리적입니다.
  const vat = preTaxProfit > 0 ? Math.round(preTaxProfit * 0.1) : 0;

  // 4. 종합소득세 ((세전순익 - 부가세) * 25%)
  // 세전순익 - 부가세 가 음수인 경우 종합소득세는 0원 처리
  const taxableIncome = preTaxProfit - vat;
  const incomeTax = taxableIncome > 0 ? Math.round(taxableIncome * 0.25) : 0;

  // 5. 순수익 = 세전순익 - 부가세 - 종합소득세
  const netProfit = preTaxProfit - vat - incomeTax;

  // 6. 마진율 = 순수익 / 판매가 (소수점 유지, UI에서 소수 둘째자리까지 표시)
  const marginRate = sellingPrice > 0 ? netProfit / sellingPrice : 0;

  // 7. END ROAS = (1 / 마진율) * 100 (정수 반올림)
  // 마진율이 0 이하인 경우 END ROAS는 정상 계산이 불가능하므로 99999나 0 등으로 처리하고 경고
  let endRoas = 0;
  if (marginRate > 0) {
    endRoas = Math.round((1 / marginRate) * 100);
  } else {
    endRoas = 0; // 마진이 음수이거나 0이면 END ROAS를 계산할 수 없음 (수익이 안 나므로 광고가 언제나 적자임)
  }

  // 8. 광고 판단
  let adDecision: CalculationResult['adDecision'] = 'UNKNOWN';
  if (adRoas !== null && adRoas > 0) {
    if (marginRate <= 0) {
      adDecision = 'LOSS';
    } else if (adRoas > endRoas) {
      adDecision = 'PROFITABLE';
    } else if (adRoas === endRoas) {
      adDecision = 'BREAK_EVEN';
    } else {
      adDecision = 'LOSS';
    }
  }

  // 9. 최대 광고 가능 금액 = 순수익 (최대 광고비 = 순수익)
  const maxAdSpend = netProfit > 0 ? netProfit : 0;

  // 10. 손익분기 판매수량 = 하루 광고비 / 순수익 (올림)
  let breakEvenSalesQty: number | 'UNAVAILABLE' = 'UNAVAILABLE';
  if (netProfit > 0) {
    breakEvenSalesQty = Math.ceil(dailyAdBudget / netProfit);
  }

  // 비용 분석 상세
  const totalCost = productCost + shippingFee + packagingFee + otherCost + platformFee + vat + incomeTax;

  const costBreakdown: CostBreakdown = {
    productCost,
    shippingFee,
    packagingFee,
    otherCost,
    platformFee,
    vat,
    incomeTax,
    totalCost,
  };

  return {
    platformFee,
    preTaxProfit,
    vat,
    incomeTax,
    netProfit,
    marginRate,
    endRoas,
    adDecision,
    maxAdSpend,
    breakEvenSalesQty,
    costBreakdown,
  };
}

// 화폐 포맷팅 (원)
export function formatWon(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value) + '원';
}

// 비율 포맷팅 (%)
export function formatPercent(value: number): string {
  return (value * 100).toFixed(2) + '%';
}

// 한국어 금액 읽기 포맷팅 (예: 25000 -> 2만 5,000원)
export function formatKoreanWordWon(num: number): string {
  if (!num || isNaN(num)) return '0원';
  if (num < 10000) {
    return num.toLocaleString('ko-KR') + '원';
  }
  const man = Math.floor(num / 10000);
  const remainder = num % 10000;
  if (remainder === 0) {
    return `${man}만원`;
  }
  return `${man}만 ${remainder.toLocaleString('ko-KR')}원`;
}
