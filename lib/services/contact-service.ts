import httpClient, { API_ENDPOINTS } from "@/lib/api";

export type ContactFormData = {
  name: string;
  email: string;
  userType: string;
  subject: string;
  message: string;
};

export async function submitContactForm(data: ContactFormData) {
  try {
    const response = await httpClient.post(API_ENDPOINTS.CONTACTS, data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      switch (status) {
        case 400:
          throw new Error(errorData.message || "Invalid form data. Please check your inputs.");
        case 500:
          throw new Error("Server error. Please try again later.");
        case 503:
          throw new Error("Service temporarily unavailable. Please try again later.");
        default:
          throw new Error(errorData.message || "An error occurred while submitting your message.");
      }
    } else if (error.request) {
      throw new Error("Unable to connect to the server. Please check your internet connection.");
    } else {
      throw new Error(error.message || "An unexpected error occurred.");
    }
  }
}
