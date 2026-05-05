export interface UserLoginData {
  username: string;
  password: string;
}

export interface UserRegisterData {
  userName: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface CustomerStats {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}