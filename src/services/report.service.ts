// services/report.service.ts
import api from '../api/axios';

export interface GeneralReportResponse {
  sales: {
    total_sales: number;
    total_amount: number;
  };
  completed_orders: {
    total_orders: number;
    total_amount: number;
  };
  pending_advances: {
    total_orders: number;
    total_advance: number;
  };
  total_general: number;
}

export interface DailyIncomeItem {
  day: string;
  amount: number;
  percentage: number;
}

export const ReportService = {
  getGeneralReport(start: string, end: string, branchId?: number): Promise<GeneralReportResponse> {
    const params: any = { start, end };
    if (branchId) {
      params.branchId = branchId;
    }
    
    return api.get('/reports/general', { params }).then(r => r.data);
  },

  getDailyIncomeReport(start: string, end: string, branchId?: number): Promise<DailyIncomeItem[]> {
    const params: any = { start, end };
    if (branchId) {
      params.branchId = branchId;
    }
    
    return api.get('/reports/daily-income', { params }).then(r => r.data);
  }
};