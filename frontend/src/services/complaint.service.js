import api from "./api";

// Fetch ward complaints for authority
export const fetchWardComplaints = async (params = {}) => {
  const res = await api.get("/complaint/ward", {
    params,
  });
  return res.data;
};

// Update complaint status (authority)
export const updateComplaintStatus = async (complaintId, data) => {
  const res = await api.patch(
    `/complaint/${complaintId}/status`,
    data
  );
  return res.data;
};
