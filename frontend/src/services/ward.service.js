import api from "./api";

// Authority dashboard data
export const fetchAuthorityDashboard = async () => {
  const res = await api.get("/authority/dashboard");
  return res.data;
};
