import { useState, useEffect } from "react";
import { Calendar, Clock, Check, X, RefreshCw, Pencil } from "lucide-react";
import { BaseURL } from "../../configs/api"; // Adjust path based on your file structure

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  customer?: {
    name?: string;
  };
  service?: {
    name?: string;
  };
}

const ServiceAppointments = () => {
  const [view, setView] = useState("list");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState("month");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0
  });
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    startTime: "",
    endTime: ""
  });


  // Fetch upcoming appointments
  const fetchUpcomingAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BaseURL}/provider/appointments/upcoming?filter=${dateFilter}&limit=${limit}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      
      const data = await response.json();
      setAppointments(data.appointments);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  // Fetch appointment history
  const fetchAppointmentHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BaseURL}/provider/appointments/history?page=${page}&limit=${limit}&status=${statusFilter}&range=${dateFilter}`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch appointment history");
      }
      
      const data = await response.json();
      setAppointments(data.appointments);
      setPagination({
        total: data.total,
        pages: data.pages
      });
      setLoading(false);
    } catch (err:any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`${BaseURL}/provider/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }
      
      // Refresh appointments
      if (view === "upcoming") {
        fetchUpcomingAppointments();
      } else {
        fetchAppointmentHistory();
      }
    } catch (err :any) {
      setError(err.message);
    }
  };

  // Handle reschedule
  const handleReschedule = async (appointmentId : string) => {
    try {
      const response = await fetch(`${BaseURL}/provider/appointments/${appointmentId}/reschedule`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          start_time: newSchedule.startTime,
          end_time: newSchedule.endTime
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reschedule: ${response.statusText}`);
      }
      
      // Close modal and refresh appointments
      setShowRescheduleModal(false);
      if (view === "upcoming") {
        fetchUpcomingAppointments();
      } else {
        fetchAppointmentHistory();
      }
    } catch (err : any) {
      setError(err.message);
    }
  };

  // Handle showing reschedule modal
  const openRescheduleModal = (appointment : any) => {
    setSelectedAppointment(appointment);
    // Format dates for the form inputs
    const startTime = new Date(appointment.start_time);
    const endTime = new Date(appointment.end_time);
    
    setNewSchedule({
      startTime: startTime.toISOString().slice(0, 16),
      endTime: endTime.toISOString().slice(0, 16)
    });
    
    setShowRescheduleModal(true);
  };

  // Effect to fetch appointments on component mount and when filters change
  useEffect(() => {
    if (view === "upcoming") {
      fetchUpcomingAppointments();
    } else if (view === "history") {
      fetchAppointmentHistory();
    }
  }, [view, dateFilter, statusFilter, page, limit]);

  // Format date for display
  const formatDate = (dateString : string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Format time for display
  const formatTime = (dateString : string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate duration
  const calculateDuration = (startTime : string, endTime: string) => {
    const start: any = new Date(startTime);
    const end: any = new Date(endTime);
    const diffMs = end - start;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} mins`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your appointments and schedule
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setView("upcoming")}
            className={`px-4 py-2 rounded-md ${
              view === "upcoming"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setView("history")}
            className={`px-4 py-2 rounded-md ${
              view === "history"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700">
              Date Range
            </label>
            <select
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {view === "upcoming" ? (
                <>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </>
              ) : (
                <>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                  <option value="all">All Time</option>
                </>
              )}
            </select>
          </div>

          {view === "history" && (
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={view === "upcoming" ? fetchUpcomingAppointments : fetchAppointmentHistory}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {view === "upcoming" ? "Upcoming Appointments" : "Appointment History"}
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-600">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="text-center p-8 text-gray-500">No appointments found</div>
        ) : (
          <div className="border-t border-gray-200">
            <ul role="list" className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <li key={appointment.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-600 flex items-center justify-center text-white">
                          {appointment.customer?.name?.charAt(0) || "C"}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.customer?.name || "Unknown Client"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.service?.name || "Unknown Service"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(appointment.start_time)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(appointment.start_time)} ({calculateDuration(appointment.start_time, appointment.end_time)})
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {appointment.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusChange(appointment.id, "confirmed")
                              }
                              className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                              title="Confirm"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(appointment.id, "canceled")
                              }
                              className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {(appointment.status === "pending" || appointment.status === "confirmed") && (
                          <button
                            onClick={() => openRescheduleModal(appointment)}
                            className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                            title="Reschedule"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {appointment.status === "confirmed" && (
                          <button
                            onClick={() =>
                              handleStatusChange(appointment.id, "completed")
                            }
                            className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                            title="Mark as Completed"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            appointment.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "canceled"
                              ? "bg-red-100 text-red-800"
                              : appointment.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pagination */}
        {view === "history" && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  page === 1
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  page === pagination.pages
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(page * limit, pagination.total)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                      page === 1
                        ? "bg-gray-100 text-gray-400 border-gray-300"
                        : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    &larr;
                  </button>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        page === i + 1
                          ? "bg-indigo-50 border-indigo-500 text-indigo-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                    disabled={page === pagination.pages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                      page === pagination.pages
                        ? "bg-gray-100 text-gray-400 border-gray-300"
                        : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    &rarr;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Reschedule Appointment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={newSchedule.endTime}
                  onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReschedule(selectedAppointment.id)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceAppointments;