export enum DarajaTransactionType {
  STK_PUSH = 'STK_PUSH',
  C2B_PAYBILL = 'C2B_PAYBILL'
}

export enum DarajaTransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface DarajaTransaction {
  id: string;
  type: DarajaTransactionType;
  status: DarajaTransactionStatus;
  checkoutRequestId?: string;
  mpesaReceiptNumber?: string;
  amount: number;
  phoneNumber: string;
  accountReference?: string;
  resultDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedTransactions {
  data: DarajaTransaction[];
  total: number;
}
