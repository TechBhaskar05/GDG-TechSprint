import api from "./api";

export const fetchAuthorityAnalytics = () =>
  api.get("/authority/analytics");
