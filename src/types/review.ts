export interface ReviewData {
  customerId: number;
  appointmentId: number;
  rating: number;
  comment: string;
}

export interface ReviewUpdateData {
  rating: number;
  comment: string;
}

export interface Review extends ReviewData {
  id: number;
}
