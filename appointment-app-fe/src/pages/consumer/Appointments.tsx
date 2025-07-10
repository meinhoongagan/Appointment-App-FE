import { useState, useEffect } from "react";
import { Calendar, Clock, X, Repeat, User, MapPin, Phone, Mail, AlertCircle, CheckCircle, Clock as ClockIcon, CalendarDays } from "lucide-react";
  import { format, differenceInMinutes } from "date-fns";
  import { BaseURL } from "../../configs/api";

interface Appointment {
  ID: string; // Changed from 'id' to 'ID' to match backend gorm.Model
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
  };
}

const ConsumerAppointments = () => {
  const [view, setView] = useState<"upcoming" | "past">("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  // Fetch appointments based on view
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${BaseURL}/consumer/upcomping-appointments?status=${view}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch appointments");
      }

      const data = await response.json();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [view]);

  // Handle appointment cancellation
  const handleCancel = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setCancelingId(appointmentId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BaseURL}/consumer/cancel-appointment/${appointmentId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel appointment");
      }

      setSuccess("Appointment cancelled successfully");
      fetchAppointments(); // Refresh the list
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setCancelingId(null);
    }
  };

  // Format recurrence details
  const formatRecurrence = (recurPattern: any) => {
    if (!recurPattern || !recurPattern.frequency) return "";
    const frequency = recurPattern.frequency.charAt(0).toUpperCase() + recurPattern.frequency.slice(1);
    const occurrences = recurPattern.end_after > 0 ? `${recurPattern.end_after} occurrences left` : "indefinite";
    return `Repeats ${frequency.toLowerCase()}, ${occurrences}`;
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "confirmed":
        return { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Confirmed" };
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", icon: ClockIcon, label: "Pending" };
      case "completed":
        return { color: "bg-blue-100 text-blue-800", icon: CheckCircle, label: "Completed" };
      case "canceled":
        return { color: "bg-red-100 text-red-800", icon: X, label: "Cancelled" };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: AlertCircle, label: status };
    }
  };

  // Calculate time until appointment
  const getTimeUntil = (startTime: string) => {
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
  };

  const StatusIcon = getStatusInfo(selectedAppointment?.status || "").icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage and track your scheduled appointments
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setView("upcoming")}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  view === "upcoming"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <CalendarDays className="inline-block w-5 h-5 mr-2" />
                Upcoming
              </button>
              <button
                onClick={() => setView("past")}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  view === "past"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Clock className="inline-block w-5 h-5 mr-2" />
                Past
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Appointments Grid */}
        {!loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {appointments.length === 0 ? (
              <div className="col-span-full">
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No {view} appointments</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {view === "upcoming" 
                      ? "You don't have any upcoming appointments scheduled."
                      : "You don't have any past appointments."
                    }
                  </p>
                </div>
              </div>
            ) : (
              appointments.map((appointment) => {
                const statusInfo = getStatusInfo(appointment.status);
                const StatusIconComponent = statusInfo.icon;
                
                return (
                  <div
                    key={appointment.ID}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {appointment.service.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            with {appointment.provider.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              <StatusIconComponent className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </span>
                            {appointment.is_recurring && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Repeat className="w-3 h-3 mr-1" />
                                Recurring
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600">
                            ${appointment.service.price || 0}
                          </div>
                          <div className="text-sm text-gray-500">
                            {differenceInMinutes(
                              new Date(appointment.end_time),
                              new Date(appointment.start_time)
                            )} mins
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-6">
                      <div className="space-y-4">
                        {/* Date & Time */}
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {format(new Date(appointment.start_time), "EEEE, MMMM d, yyyy")}
                            </div>
                            <div className="text-gray-500">
                              {format(new Date(appointment.start_time), "h:mm a")} - {format(new Date(appointment.end_time), "h:mm a")}
                            </div>
                            {view === "upcoming" && (
                              <div className="text-indigo-600 font-medium mt-1">
                                {getTimeUntil(appointment.start_time)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Provider Info */}
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="w-4 h-4 mr-3 text-gray-400" />
                          <div>
                            <div className="font-medium">{appointment.provider.name}</div>
                            {appointment.provider.phone && (
                              <div className="text-gray-500 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {appointment.provider.phone}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Location */}
                        {appointment.provider.address && (
                          <div className="flex items-start text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-3 mt-0.5 text-gray-400" />
                            <div className="text-gray-500">{appointment.provider.address}</div>
                          </div>
                        )}

                        {/* Recurrence Info */}
                        {appointment.is_recurring && appointment.recur_pattern && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Repeat className="w-4 h-4 mr-3 text-gray-400" />
                            <div className="text-gray-500">
                              {formatRecurrence(appointment.recur_pattern)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowDetailsModal(true);
                            }}
                            className="flex-1 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                          >
                            View Details
                          </button>
                          {appointment.status === "pending" && view === "upcoming" && (
                            <button
                              onClick={() => handleCancel(appointment.ID)}
                              disabled={cancelingId === appointment.ID}
                              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
                            >
                              {cancelingId === appointment.ID ? "Cancelling..." : "Cancel"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Service & Provider */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedAppointment.service.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {selectedAppointment.service.description || "No description available"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">{selectedAppointment.provider.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">
                      ${selectedAppointment.service.price || 0}
                    </div>
                    <div className="text-sm text-gray-500">
                      {differenceInMinutes(
                        new Date(selectedAppointment.end_time),
                        new Date(selectedAppointment.start_time)
                      )} minutes
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Date</h4>
                  </div>
                  <p className="text-blue-800">
                    {format(new Date(selectedAppointment.start_time), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 mr-2 text-green-600" />
                    <h4 className="font-semibold text-green-900">Time</h4>
                  </div>
                  <p className="text-green-800">
                    {format(new Date(selectedAppointment.start_time), "h:mm a")} - {format(new Date(selectedAppointment.end_time), "h:mm a")}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <StatusIcon className="w-5 h-5 mr-2 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">Status</h4>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedAppointment.status).color}`}>
                    {getStatusInfo(selectedAppointment.status).label}
                  </span>
                </div>
              </div>

              {/* Provider Contact */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Provider Contact</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-700">{selectedAppointment.provider.name}</span>
                  </div>
                  {selectedAppointment.provider.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-gray-700">{selectedAppointment.provider.email}</span>
                    </div>
                  )}
                  {selectedAppointment.provider.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-gray-700">{selectedAppointment.provider.phone}</span>
                    </div>
                  )}
                  {selectedAppointment.provider.address && (
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-3 mt-0.5 text-gray-400" />
                      <span className="text-gray-700">{selectedAppointment.provider.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recurrence Info */}
              {selectedAppointment.is_recurring && selectedAppointment.recur_pattern && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Repeat className="w-5 h-5 mr-2 text-purple-600" />
                    <h4 className="font-semibold text-purple-900">Recurrence</h4>
                  </div>
                  <p className="text-purple-800">
                    {formatRecurrence(selectedAppointment.recur_pattern)}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Close
                </button>
                {selectedAppointment.status === "pending" && view === "upcoming" && (
                  <button
                    onClick={() => {
                      handleCancel(selectedAppointment.ID);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-200"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumerAppointments;