import type { UserLoginData } from "@/types/auth";
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

    loginApi: (loginData: UserLoginData) => Api.post("/auth/login", loginData),
    checkAuthApi: () => Api.get("/auth/me", { headers: getAuthHeader() }),

};