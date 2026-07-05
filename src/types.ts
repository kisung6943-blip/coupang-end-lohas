export interface CalculationInput {
  sellingPrice: number;       // 판매가
  productCost: number;        // 상품원가
  shippingFee: number;        // 배송비 (기본 1,900)
  packagingFee: number;       // 포장비 (기본 500)
  otherCost: number;          // 기타비용 (기본 0)
  platformFeeRate: number;    // 플랫폼 수수료율 (기본 11.88)
  dailyAdBudget: number;      // 하루 광고비 (기본 10,000)
  adRoas: number | null;      // 광고 ROAS (선택)
}

export interface CostBreakdown {
  productCost: number;
  shippingFee: number;
  packagingFee: number;
  otherCost: number;
  platformFee: number;
  vat: number;
  incomeTax: number;
  totalCost: number;
}

export interface CalculationResult {
  platformFee: number;
  preTaxProfit: number;
  vat: number;
  incomeTax: number;
  netProfit: number;
  marginRate: number; // 소수점 (예: 0.2183)
  endRoas: number;    // 정수 (예: 458)
  adDecision: 'PROFITABLE' | 'BREAK_EVEN' | 'LOSS' | 'UNKNOWN';
  maxAdSpend: number;
  breakEvenSalesQty: number | 'UNAVAILABLE';
  costBreakdown: CostBreakdown;
}

export interface DailySaleRecord {
  id: string;
  date: string;
  qty: number;
}

export interface CalculationRecord {
  id: string;
  title: string;
  input: CalculationInput;
  result: CalculationResult;
  createdAt: string;
  memo?: string;
  dailySales?: DailySaleRecord[];
}
