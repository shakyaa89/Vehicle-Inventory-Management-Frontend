export interface PartRequestData {
  customerId: number;
  partName: string;
  quantity: number;
}

export interface PartRequest extends PartRequestData {
  id: number;
  status: string;
  requestedDate: string;
}
