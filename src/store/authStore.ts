import { create } from "zustand";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { AuthApi } from "@/constants/Api.ts";

interface AuthState {
  user: any | null;
  loading: boolean;
  checking: boolean;
  login: (email: string, password: string) => Promise<any>;
  checkAuth: () => Promise<void>;
  setUser: (user: any | null) => void;
}


export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  checking: true,

  setUser: (user) => set({ user }),

  login: async (username, password) => {
    set({ loading: true });
    try {
      const res = await AuthApi.loginApi({ username, password });
      localStorage.setItem("jwtToken", res?.data?.data?.jwtToken?.result);
      set({ user: res.data.data.user });
      toast.success(res?.data?.message);
      return res.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.request) {
          toast.error("Unable to reach server. Please try again later.");
        } else {
          toast.error(error.message || "Login failed");
        }
      } else {
        console.error("Login failed:", error);
        toast.error("Login failed");
      }
      set({ user: null });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  checkAuth: async () => {
    set({ checking: true });
    try {
      const res = await AuthApi.checkAuthApi();
      set({ user: res.data });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data?.message || error.message);
      } else {
        console.log(error);
      }
      set({ user: null });
    } finally {
      set({ checking: false });
    }
  },

}));