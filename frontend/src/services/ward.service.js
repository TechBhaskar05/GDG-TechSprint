import api from "./api";

// Authority dashboard data
export const fetchAuthorityDashboard = async () => {
  const res = await api.get("/authority/dashboard");
  return res.data;
}
// services/ward.service.js


/**
 * Fetch wards for a given city
 * @param {string} city
 */
export const fetchWards = (city) => {
  return api.get("/wards", {
    params: { city }
  });
};

export const fetchCities = () => {
  return api.get("/wards/cities");
};
