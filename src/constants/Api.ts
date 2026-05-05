import type { CustomerStats, UserLoginData } from "@/types/auth";
import type { AppointmentData } from "@/types/appointment";
import type { VehicleData } from "@/types/vehicle";
import type { PartData } from "@/types/part";
import type { VendorData } from "@/types/vendor";
import type { UserRegisterData } from "@/types/auth";
import axios from "axios";

export const API_BASE_URL = "https://localhost:7124";
const baseURL = `${API_BASE_URL}/api`;

const Api = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

const getAuthHeader = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const AuthApi = {

    loginApi: async (loginData: UserLoginData) => Api.post("/auth/login", loginData),
    checkAuthApi: () => Api.get("/auth/me", { headers: getAuthHeader() }),
    getCustomersApi: (query?: string) => Api.get<CustomerStats[]>("/auth/customers", { params: {query: query}, headers: getAuthHeader() }),
    registerCustomerApi: async (registerData: UserRegisterData) => Api.post("/auth/register/customer", registerData),
    registerStaffApi: async (registerData: UserRegisterData) => Api.post("/auth/register/staff", registerData, { headers: getAuthHeader() }),

};

export const VehicleApi = {
    getVehiclesByCustomerApi: (customerId: number) => Api.get(`/vehicles/customer/${customerId}`, { headers: getAuthHeader() }),
    addVehicleApi: (vehicleData: VehicleData) => Api.post("/vehicles", vehicleData, { headers: getAuthHeader() }),
    updateVehicleApi: (id: number, vehicleData: VehicleData) => Api.put(`/vehicles/${id}`, vehicleData, { headers: getAuthHeader() }),
    deleteVehicleApi: (id: number) => Api.delete(`/vehicles/${id}`, { headers: getAuthHeader() }),
};

export const AppointmentApi = {
    getAppointmentsApi: () => Api.get("/appointments", { headers: getAuthHeader() }),
    getAppointmentsByCustomerApi: (customerId: number) => Api.get(`/appointments/customer/${customerId}`, { headers: getAuthHeader() }),
    addAppointmentApi: (appointmentData: AppointmentData) => Api.post("/appointments", appointmentData, { headers: getAuthHeader() }),
    updateAppointmentApi: (id: number, appointmentData: AppointmentData) => Api.put(`/appointments/${id}`, appointmentData, { headers: getAuthHeader() }),
    deleteAppointmentApi: (id: number) => Api.delete(`/appointments/${id}`, { headers: getAuthHeader() }),
};

export const PartApi = {
    getAllPartsApi: () => Api.get("/parts", { headers: getAuthHeader() }),
    getPartByIdApi: (id: number) => Api.get(`/parts/${id}`, { headers: getAuthHeader() }),
    addPartApi: (partData: PartData) => Api.post("/parts", partData, { headers: getAuthHeader() }),
    updatePartApi: (id: number, partData: PartData) => Api.put(`/parts/${id}`, partData, { headers: getAuthHeader() }),
    deletePartApi: (id: number) => Api.delete(`/parts/${id}`, { headers: getAuthHeader() }),
};

export const VendorApi = {
    getAllVendorsApi: () => Api.get("/vendors", { headers: getAuthHeader() }),
    getVendorByIdApi: (id: number) => Api.get(`/vendors/${id}`, { headers: getAuthHeader() }),
    addVendorApi: (vendorData: VendorData) => Api.post("/vendors", vendorData, { headers: getAuthHeader() }),
    updateVendorApi: (id: number, vendorData: VendorData) => Api.put(`/vendors/${id}`, vendorData, { headers: getAuthHeader() }),
    deleteVendorApi: (id: number) => Api.delete(`/vendors/${id}`, { headers: getAuthHeader() }),
};