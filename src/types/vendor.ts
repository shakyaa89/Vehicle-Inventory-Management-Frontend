export interface VendorData {
  name: string;
  contact: string;
  address: string;
  email: string;
}

export interface Vendor extends VendorData {
  id: number;
}
