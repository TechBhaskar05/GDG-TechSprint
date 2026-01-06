// services/ward.service.js
import api from "./api";

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
