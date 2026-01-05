import { create } from 'zustand';
import { loginUser,logoutUser } from '../services/auth.service.js';

export const useAuthStore = create((set) => ({
  // Auth state
  userRole: null, // 'citizen' | 'authority' | null
  isAuthenticated: false,

  // login: async ({ email, password }) => {
  //   // const res = await loginUser({ email, password });
  //   // console.log("jhflwiuf",res);
  //   // const { user, accessToken, refreshToken } = res.data;

  //   // // Store token
  //   // localStorage.setItem("accessToken", accessToken);
  //   // localStorage.setItem("refreshToken", refreshToken);

  //   // Decode role (simple way)
  //   // const payload = JSON.parse(atob(accessToken.split(".")[1]));

  //   set({
  //     userRole: payload.role,
  //     isAuthenticated: true
  //   });

  //   return{
  //     role: payload.role,
  //     message: res.data.message
  //   }
  // },

   login: (role) => {
    set({
      userRole: role,
      isAuthenticated: true,
    });

    return{
      role: role,
      message: "res.data.message"
    }
  },

  logout: async () => {
  // try {
    // const refreshToken = localStorage.getItem("refreshToken");

  //   if (refreshToken) {
  //     // await logoutUser(refreshToken);
  //     console.log("✅ Backend logout successful");
  //   }
  // } catch (error) {
  //   console.error("⚠️ Logout API failed:", error?.response?.data?.message);
  // } finally {
    // Always clear local state
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    
    set({
      userRole: null,
      isAuthenticated: false
    });
  // }
}
}));
