/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Participant {
  id: string;
  fullName: string;
  role: string;
  hasPaid: boolean;
  createdAt: string;
}

export interface Statistics {
  totalCount: number;
  confirmedCount: number;
  refusedCount: number;
  pdfGeneratedCount: number;
}

export interface AdminSettings {
  adminUser: string;
  adminCodeSecret: string;
}

export interface Translation {
  welcomeTitle: string;
  welcomeDesc: string;
  btnNext: string;
  btnDiscover: string;
  btnParticipate: string;
  btnBackHome: string;
  btnConfirmReg: string;
  btnDownloadPdf: string;
  
  invitationTitle: string;
  invitationDesc: string;
  
  detailsTitle: string;
  detailsVenueLabel: string;
  detailsVenueVal: string;
  detailsTimeLabel: string;
  detailsTimeVal: string;
  detailsFeeLabel: string;
  detailsFeeVal: string;
  detailsDesc: string;
  
  confirmTitle: string;
  confirmLabelName: string;
  confirmLabelRole: string;
  confirmCheckboxText: string;
  confirmValidationErr: string;
  
  successTitle: string;
  successDesc: string;
  successCountdownPrefix: string;
  
  dayStr: string;
  hourStr: string;
  minuteStr: string;
  secondStr: string;
  
  loginTitle: string;
  loginUserLabel: string;
  loginCodeLabel: string;
  loginBtn: string;
  loginError: string;
  
  adminTitle: string;
  adminStatsTotal: string;
  adminStatsConfirmed: string;
  adminStatsRefused: string;
  adminStatsPdf: string;
  adminTableSearchPlaceholder: string;
  adminTableColName: string;
  adminTableColRole: string;
  adminTableColPaid: string;
  adminTableColDate: string;
  adminTableColActions: string;
  adminBtnDelete: string;
  adminBtnExportExcel: string;
  adminBtnExportPdf: string;
  adminBtnPrint: string;
  adminNoData: string;
}

export type Language = 'fr' | 'en';
