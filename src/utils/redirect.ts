import { useAuthStore } from "@/store/authStore"
import { type NavigateFunction } from "react-router-dom"

export const redirectToDashboard = (navigate: NavigateFunction): void => {
  const user = useAuthStore.getState().user

  if (!user) {
    navigate('/login')
    return
  }

  switch (user.role) {
    case 'Admin':
      navigate('/admin/dashboard')
      break

    case 'Customer':
      navigate('/customer/dashboard')
      break

    case 'Staff':
      navigate('/staff/dashboard')
      break

    default:
      navigate('/')
  }
}