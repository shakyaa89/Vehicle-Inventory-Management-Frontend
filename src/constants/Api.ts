import type { UserLoginData } from "@/types/auth";
import type { AppointmentData } from "@/types/appointment";
import type { VehicleData } from "@/types/vehicle";
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