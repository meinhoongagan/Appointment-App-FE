import { BaseURL } from "../configs/api";

// Types
export interface Appointment {
  id: string;
  title?: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: string;
  is_recurring: boolean;
  recur_pattern?: {
    frequency: string;
    end_after: number;
  };
  service: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    duration: number;
  };
  provider: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  canceled: number;
  today: number;
  tomorrow: number;
}

export interface AppointmentHistoryResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  range: string;
  status: string;
}

export interface UpcomingAppointmentsResponse {
  appointments: Appointment[];
  count: number;
  filter: string;
  start_date: string;
  end_date: string;
}

export interface CreateAppointmentRequest {
  service_id: number;
  provider_id: number;
  customer_id: number;
  start_time: string;
  is_recurring?: boolean;
  recur_pattern?: {
    frequency: string;
    end_after: number;
  };
}

export interface UpdateAppointmentStatusRequest {
  status: string;
}

export interface RescheduleAppointmentRequest {
  start_time: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication required");
  }
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Consumer Appointment Services
export const consumerAppointmentService = {
  // Get all appointments for consumer
  getAllAppointments: async (): Promise<Appointment[]> => {
    const response = await fetch(`${BaseURL}/appointments`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get upcoming or past appointments for consumer
  getAppointmentsByStatus: async (status: "upcoming" | "past"): Promise<Appointment[]> => {
    const response = await fetch(`${BaseURL}/consumer/upcomping-appointments?status=${status}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get specific appointment details
  getAppointment: async (id: string): Promise<Appointment> => {
    const response = await fetch(`${BaseURL}/appointments/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create new appointment
  createAppointment: async (appointmentData: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await fetch(`${BaseURL}/appointments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(appointmentData),
    });
    return handleResponse(response);
  },

  // Update appointment
  updateAppointment: async (id: string, appointmentData: Partial<Appointment>): Promise<Appointment> => {
    const response = await fetch(`${BaseURL}/appointments/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(appointmentData),
    });
    return handleResponse(response);
  },

  // Cancel appointment
  cancelAppointment: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${BaseURL}/consumer/cancel-appointment/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Delete appointment
  deleteAppointment: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${BaseURL}/appointments/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Provider Appointment Services
export const providerAppointmentService = {
  // Get all appointments for provider
  getAllAppointments: async (status?: string): Promise<Appointment[]> => {
    const url = status 
      ? `${BaseURL}/provider/appointments?status=${status}`
      : `${BaseURL}/provider/appointments`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get upcoming appointments for provider
  getUpcomingAppointments: async (filter: string = "month", limit: number = 10): Promise<UpcomingAppointmentsResponse> => {
    const response = await fetch(`${BaseURL}/provider/appointments/upcoming?filter=${filter}&limit=${limit}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get appointment history for provider
  getAppointmentHistory: async (
    page: number = 1,
    limit: number = 10,
    status: string = "",
    range: string = "month"
  ): Promise<AppointmentHistoryResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      range,
    });
    
    if (status) {
      params.append("status", status);
    }

    const response = await fetch(`${BaseURL}/provider/appointments/history?${params}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get specific appointment details
  getAppointmentDetails: async (id: string): Promise<Appointment> => {
    const response = await fetch(`${BaseURL}/provider/appointments/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update appointment status
  updateAppointmentStatus: async (id: string, status: string): Promise<{ message: string; appointment: Appointment }> => {
    const response = await fetch(`${BaseURL}/provider/appointments/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  // Reschedule appointment
  rescheduleAppointment: async (id: string, startTime: string): Promise<{ message: string; appointment: Appointment }> => {
    const response = await fetch(`${BaseURL}/provider/appointments/${id}/reschedule`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ start_time: startTime }),
    });
    return handleResponse(response);
  },
};

// Provider Services
export const providerService = {
  // Get all providers
  getAllProviders: async (page: number = 1, limit: number = 10): Promise<{
    providers: any[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> => {
    const response = await fetch(`${BaseURL}/providers?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get provider details
  getProviderDetails: async (id: string): Promise<any> => {
    const response = await fetch(`${BaseURL}/providers/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get provider services
  getProviderServices: async (id: string): Promise<any[]> => {
    const response = await fetch(`${BaseURL}/providers/${id}/services`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Search providers
  searchProviders: async (query: string): Promise<any[]> => {
    const response = await fetch(`${BaseURL}/providers/search/service?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get available time slots
  getAvailableSlots: async (providerId: string, date: string, serviceId: string): Promise<{
    slots: string[];
    provider_id: string;
    date: string;
    service_id: string;
  }> => {
    const response = await fetch(
      `${BaseURL}/providers/available-time-slots/${providerId}?date=${date}&service_id=${serviceId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

// Service Services
export const serviceService = {
  // Get service details
  getServiceDetails: async (id: string): Promise<any> => {
    const response = await fetch(`${BaseURL}/appointments/service/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get all services for provider
  getProviderServices: async (): Promise<any[]> => {
    const response = await fetch(`${BaseURL}/provider/services/get-provider/service`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Utility functions
export const appointmentUtils = {
  // Calculate duration between two times
  calculateDuration: (startTime: string, endTime: string): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} mins`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
  },

  // Get status information
  getStatusInfo: (status: string) => {
    switch (status) {
      case "confirmed":
        return { color: "bg-green-100 text-green-800", label: "Confirmed" };
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", label: "Pending" };
      case "completed":
        return { color: "bg-blue-100 text-blue-800", label: "Completed" };
      case "canceled":
        return { color: "bg-red-100 text-red-800", label: "Cancelled" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: status };
    }
  },

  // Format recurrence details
  formatRecurrence: (recurPattern: any): string => {
    if (!recurPattern || !recurPattern.frequency) return "";
    const frequency = recurPattern.frequency.charAt(0).toUpperCase() + recurPattern.frequency.slice(1);
    const occurrences = recurPattern.end_after > 0 ? `${recurPattern.end_after} occurrences left` : "indefinite";
    return `Repeats ${frequency.toLowerCase()}, ${occurrences}`;
  },

  // Calculate time until appointment
  getTimeUntil: (startTime: string): string => {
    const now = new Date();
    const appointmentTime = new Date(startTime);
    const diffMs = appointmentTime.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} away`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} away`;
    } else if (diffMs > 0) {
      return "Today";
    } else {
      return "Past";
    }
  },
};

export default {
  consumerAppointmentService,
  providerAppointmentService,
  providerService,
  serviceService,
  appointmentUtils,
};