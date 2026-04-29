export interface VehicleData {
  customerId: number;
  make: string;
  model: string;
  year: number;
  vehicleNumber: string;
}

export interface Vehicle extends VehicleData {
  id: number;
}
