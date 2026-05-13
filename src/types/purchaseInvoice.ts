export interface PurchaseInvoiceItemData {
  id?: number;
  partId: number;
  unitPrice: number;
  partQuantity: number;
  subTotal?: number;
  createdAt?: string;
}

export interface PurchaseInvoiceData {
  id?: number;
  vendorId: number;
  userId?: number;
  totalAmount?: number;
  createdAt?: string;
  items: PurchaseInvoiceItemData[];
}
