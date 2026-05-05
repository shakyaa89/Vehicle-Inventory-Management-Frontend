export interface PartData {
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
}

export interface Part extends PartData {
  id: number;
}
