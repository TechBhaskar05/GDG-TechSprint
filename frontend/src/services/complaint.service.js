import api from "./api";

/**
 * COMPLAINT SERVICE
 * Handles all communication with /api/complaint endpoints.
 */
export const complaintService = {
  /**
   * Sends a new complaint (image + description + coordinates)
   * Method: POST /api/complaint/
   */
  createComplaint: async (formData) => {
    const response = await api.post("/complaint", formData);
    return response.data;
  },

  /**
   * Fetches all complaints for the Map View.
   * Method: GET /api/complaint/allComplaints
   */
  getAllComplaints: async () => {
    const response = await api.get("/complaint/allComplaints");
    return response.data;
  },

  /**
   * Fetches the logged-in citizen's reports for their Dashboard.
   * Method: GET /api/complaint/my-reports
   */
  getMyComplaints: async () => {
    const response = await api.get("/complaint/my-reports");
    return response.data;
  },

  /**
   * Fetches complaints for the Authority's assigned Ward.
   * Method: GET /api/complaint/ward
   */
  getWardComplaints: async () => {
    const response = await api.get("/complaint/ward");
    return response.data;
  },

  /**
   * Updates complaint status (Used by Authority/Officer)
   * Method: PUT /api/complaint/:id
   */
  updateStatus: async (complaintId, statusData) => {
    const response = await api.put(`/complaint/${complaintId}`, statusData);
    return response.data;
  },

  /**
   * Updates complaint details (Used by Citizen to Edit)
   * Method: PATCH /api/complaint/:id
   * Typically uses PATCH to update specific fields like description.
   */
  updateComplaint: async (complaintId, updateData) => {
    const response = await api.patch(`/complaint/${complaintId}`, updateData);
    return response.data;
  },

  /**
   * Deletes a complaint
   * Method: DELETE /api/complaint/:id
   */
  deleteComplaint: async (complaintId) => {
    const response = await api.delete(`/complaint/${complaintId}`);
    return response.data;
  },

  /**
   * Fetches a single complaint by ID for the Detail View.
   * Method: GET /api/complaint/:id
   */
  getComplaintById: async (complaintId) => {
    const response = await api.get(`/complaint/${complaintId}`);
    return response.data;
  },
};
