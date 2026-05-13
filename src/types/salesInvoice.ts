export interface SalesInvoiceItemData {
  id?: number;
  partId: number;
  unitPrice: number;
  partQuantity: number;
  subTotal?: number;
  createdAt?: string;
}

export interface SalesInvoiceData {
  id?: number;
  customerId: number;
  staffId?: number;
  totalAmount?: number;
  loyaltyApplied?: boolean;
  isCredit?: boolean;
  dueAmount?: number;
  creditDueDate?: string | null;
  createdAt?: string;
  items: SalesInvoiceItemData[];
}
