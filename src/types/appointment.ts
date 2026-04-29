export interface AppointmentData {
  customerId: number;
  scheduledAt: string;
  status: string;
  vehicleId: number;
}

export interface Appointment extends AppointmentData {
  id: number;
}