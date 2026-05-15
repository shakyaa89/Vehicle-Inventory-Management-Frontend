import type { CustomerStats, UserLoginData } from "@/types/auth";
import type { AppointmentData } from "@/types/appointment";
import type { VehicleData } from "@/types/vehicle";
import type { PartData } from "@/types/part";
import type { PartRequestData } from "@/types/partRequest";
import type { VendorData } from "@/types/vendor";
import type { PurchaseInvoiceData } from "@/types/purchaseInvoice";
import type { SalesInvoiceData } from "@/types/salesInvoice";
import type { UserRegisterData } from "@/types/auth";
import type { ReviewData, ReviewUpdateData } from "@/types/review";
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
    getAllVehiclesApi: () => Api.get("/vehicles", { headers: getAuthHeader() }),
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
    completeAppointmentApi: (id: number) => Api.put(`/appointments/${id}/complete`, {}, { headers: getAuthHeader() }),
    cancelAppointmentApi: (id: number) => Api.put(`/appointments/${id}/cancel`, {}, { headers: getAuthHeader() }),
};

export const PartApi = {
    getAllPartsApi: () => Api.get("/parts", { headers: getAuthHeader() }),
    getPartByIdApi: (id: number) => Api.get(`/parts/${id}`, { headers: getAuthHeader() }),
    addPartApi: (partData: PartData) => Api.post("/parts", partData, { headers: getAuthHeader() }),
    updatePartApi: (id: number, partData: PartData) => Api.put(`/parts/${id}`, partData, { headers: getAuthHeader() }),
    deletePartApi: (id: number) => Api.delete(`/parts/${id}`, { headers: getAuthHeader() }),
};

export const PartRequestApi = {
    getAllPartRequestsApi: () => Api.get("/part-requests", { headers: getAuthHeader() }),
    getPartRequestsByCustomerApi: (customerId: number) =>
        Api.get(`/part-requests/customer/${customerId}`, { headers: getAuthHeader() }),
    getPartRequestByIdApi: (id: number) => Api.get(`/part-requests/${id}`, { headers: getAuthHeader() }),
    createPartRequestApi: (requestData: PartRequestData) =>
        Api.post("/part-requests", requestData, { headers: getAuthHeader() }),
    completePartRequestApi: (id: number) =>
        Api.put(`/part-requests/${id}/complete`, {}, { headers: getAuthHeader() }),
    rejectPartRequestApi: (id: number) =>
        Api.put(`/part-requests/${id}/reject`, {}, { headers: getAuthHeader() }),
    deletePartRequestApi: (id: number) =>
        Api.delete(`/part-requests/${id}/delete`, { headers: getAuthHeader() }),
};

export const VendorApi = {
    getAllVendorsApi: () => Api.get("/vendors", { headers: getAuthHeader() }),
    getVendorByIdApi: (id: number) => Api.get(`/vendors/${id}`, { headers: getAuthHeader() }),
    addVendorApi: (vendorData: VendorData) => Api.post("/vendors", vendorData, { headers: getAuthHeader() }),
    updateVendorApi: (id: number, vendorData: VendorData) => Api.put(`/vendors/${id}`, vendorData, { headers: getAuthHeader() }),
    deleteVendorApi: (id: number) => Api.delete(`/vendors/${id}`, { headers: getAuthHeader() }),
};

export const PurchaseInvoiceApi = {
    createPurchaseInvoiceApi: (invoiceData: PurchaseInvoiceData) =>
        Api.post("/purchase-invoices", invoiceData, { headers: getAuthHeader() }),
    getPurchaseInvoiceByIdApi: (id: number) =>
        Api.get(`/purchase-invoices/${id}`, { headers: getAuthHeader() }),
};

export const SalesInvoiceApi = {
    createSalesInvoiceApi: (invoiceData: SalesInvoiceData) =>
        Api.post("/sales-invoices", invoiceData, { headers: getAuthHeader() }),
    getSalesInvoiceByIdApi: (id: number) =>
        Api.get(`/sales-invoices/${id}`, { headers: getAuthHeader() }),
    getSalesInvoicesApi: () =>
        Api.get("/sales-invoices", { headers: getAuthHeader() }),
    getSalesInvoicesByCustomerApi: (customerId: number) =>
        Api.get(`/sales-invoices/customer/${customerId}`, { headers: getAuthHeader() }),
    sendSalesInvoiceEmailApi: (id: number) =>
        Api.post(`/sales-invoices/${id}/send-email`, {}, { headers: getAuthHeader() }),
};

export const ReviewApi = {
    createReviewApi: (reviewData: ReviewData) =>
        Api.post("/reviews/create", reviewData, { headers: getAuthHeader() }),
    getReviewsByCustomerApi: (customerId: number) =>
        Api.get(`/reviews/customer/${customerId}`, { headers: getAuthHeader() }),
    getAllReviewsApi: () =>
        Api.get("/reviews", { headers: getAuthHeader() }),
    getReviewByIdApi: (id: number) =>
        Api.get(`/reviews/${id}`, { headers: getAuthHeader() }),
    updateReviewApi: (id: number, reviewData: ReviewUpdateData) =>
        Api.put(`/reviews/${id}`, reviewData, { headers: getAuthHeader() }),
    deleteReviewApi: (id: number) =>
        Api.delete(`/reviews/${id}`, { headers: getAuthHeader() }),
};