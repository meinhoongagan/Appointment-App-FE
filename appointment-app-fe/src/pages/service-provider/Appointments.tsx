import { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Check, 
  X, 
  RefreshCw, 
  Pencil, 
  User, 
  Phone, 
  Mail, 
  AlertCircle, 
  CheckCircle, 
  Clock as ClockIcon, 
  CalendarDays,
  Filter,
  Search,
  Eye,
  Users,
} from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
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
    phone?: string;
  };
}

interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  canceled: number;
  today: number;
  tomorrow: number;
}

const ServiceAppointments = () => {
  const [view, setView] = useState<"upcoming" | "history" | "approvals">("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    canceled: 0,
    today: 0,
    tomorrow: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState(false);

  // const user = JSON.parse(localStorage.getItem("user") || '{}');
  // const isReceptionist = user?.role_id === 4;

  setLimit(10);

  // Fetch pending appointments for approval
  const fetchPendingAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${BaseURL}/provider/appointments?status=pending&limit=${limit}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch pending appointments");
      }
      
      const data = await response.json();
      setAppointments(data);
      
      // Calculate stats for pending appointments
      setStats({
        total: data.length,
        pending: data.length,
        confirmed: 0,
        completed: 0,
        canceled: 0,
        today: data.filter((apt: Appointment) => 
          isToday(new Date(apt.start_time))
        ).length,
        tomorrow: data.filter((apt: Appointment) => 
          isTomorrow(new Date(apt.start_time))
        ).length
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch upcoming appointments
  const fetchUpcomingAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${BaseURL}/provider/appointments/upcoming?filter=${dateFilter}&limit=${limit}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch appointments");
      }
      
      const data = await response.json();
      setAppointments(data.appointments);
      
      // Calculate stats
      // const today = new Date();
      // const tomorrow = addDays(today, 1);
      const todayCount = data.appointments.filter((apt: Appointment) => 
        isToday(new Date(apt.start_time))
      ).length;
      const tomorrowCount = data.appointments.filter((apt: Appointment) => 
        isTomorrow(new Date(apt.start_time))
      ).length;
      
      setStats({
        total: data.appointments.length,
        pending: data.appointments.filter((apt: Appointment) => apt.status === "pending").length,
        confirmed: data.appointments.filter((apt: Appointment) => apt.status === "confirmed").length,
        completed: 0,
        canceled: 0,
        today: todayCount,
        tomorrow: tomorrowCount
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointment history
  const fetchAppointmentHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${BaseURL}/provider/appointments/history?page=${page}&limit=${limit}&status=${statusFilter}&range=${dateFilter}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch appointment history");
      }
      
      const data = await response.json();
      setAppointments(data.appointments);
      setPagination({
        total: data.total,
        pages: data.pages
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    setUpdatingStatus(appointmentId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BaseURL}/provider/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update status: ${response.statusText}`);
      }
      
      setSuccess(`Appointment ${newStatus} successfully`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh appointments
      if (view === "upcoming") {
        fetchUpcomingAppointments();
      } else if (view === "approvals") {
        fetchPendingAppointments();
      } else {
        fetchAppointmentHistory();
      }
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handle reschedule
  const handleReschedule = async (appointmentId: string) => {
    setRescheduling(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BaseURL}/provider/appointments/${appointmentId}/reschedule`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          start_time: newSchedule.startTime
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to reschedule: ${response.statusText}`);
      }
      
      setSuccess("Appointment rescheduled successfully");
      setTimeout(() => setSuccess(null), 3000);
      
      // Close modal and refresh appointments
      setShowRescheduleModal(false);
      if (view === "upcoming") {
        fetchUpcomingAppointments();
      } else if (view === "approvals") {
        fetchPendingAppointments();
      } else {
        fetchAppointmentHistory();
      }
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setRescheduling(false);
    }
  };

  // Handle showing reschedule modal
  const openRescheduleModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    // Format dates for the form inputs
    const startTime = new Date(appointment.start_time);
    
    setNewSchedule({
      startTime: startTime.toISOString().slice(0, 16),
      endTime: new Date(appointment.end_time).toISOString().slice(0, 16)
    });
    
    setShowRescheduleModal(true);
  };

  // Effect to fetch appointments on component mount and when filters change
  useEffect(() => {
    if (view === "upcoming") {
      fetchUpcomingAppointments();
    } else if (view === "history") {
      fetchAppointmentHistory();
    } else if (view === "approvals") {
      fetchPendingAppointments();
    }
  }, [view, dateFilter, statusFilter, page, limit]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };

  // Calculate duration
  const calculateDuration = (startTime: string, endTime: string) => {
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

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.customer.name.toLowerCase().includes(searchLower) ||
      appointment.service.name.toLowerCase().includes(searchLower) ||
      appointment.customer.email?.toLowerCase().includes(searchLower)
    );
  });

  // const StatusIcon = getStatusInfo(selectedAppointment?.status || "").icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage your appointments and schedule
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
                onClick={() => setView("history")}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  view === "history"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Clock className="inline-block w-5 h-5 mr-2" />
                History
              </button>
              <button
                onClick={() => setView("approvals")}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  view === "approvals"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Users className="inline-block w-5 h-5 mr-2" />
                Approvals
              </button>
            </div>
          </div>
        </div>

        {/* Approval Workflow Header - Only for approvals view */}
        {view === "approvals" && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">
                  Appointment Approval Required
                </h3>
                <p className="text-orange-800 mb-3">
                  These appointments are waiting for your approval. Please review each request and either approve or reject them based on your availability and schedule.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-orange-800">Approve: Confirm the appointment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-orange-800">Reject: Decline the appointment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-orange-800">Reschedule: Change the time if needed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - Only show for upcoming and approvals view */}
        {(view === "upcoming" || view === "approvals") && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`p-2 ${view === "approvals" ? "bg-orange-100" : "bg-blue-100"} rounded-lg`}>
                  <Users className={`w-6 h-6 ${view === "approvals" ? "text-orange-600" : "text-blue-600"}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {view === "approvals" ? "Pending Approval" : "Total"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {view === "approvals" ? "Needs Action" : "Pending"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {view === "approvals" ? "Today" : "Today"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {view === "approvals" ? "Tomorrow" : "Tomorrow"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.tomorrow}</p>
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Filters and Search */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Filter className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
                  <p className="text-sm text-gray-600">Refine your appointment list</p>
                </div>
              </div>
              <button
                onClick={view === "upcoming" ? fetchUpcomingAppointments : view === "approvals" ? fetchPendingAppointments : fetchAppointmentHistory}
                className="flex items-center px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium border border-indigo-200 shadow-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Date Range Filter */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <label htmlFor="dateFilter" className="text-sm font-semibold text-gray-900">
                    Date Range
                  </label>
                </div>
                <div className="relative">
                  <select
                    id="dateFilter"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="appearance-none block w-full pl-4 pr-10 py-3 rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white text-sm font-medium text-gray-900 transition-all duration-200 hover:border-indigo-300 focus:shadow-lg cursor-pointer"
                  >
                    {view === "upcoming" ? (
                      <>
                        <option value="today" className="py-2">📅 Today</option>
                        <option value="tomorrow" className="py-2">📅 Tomorrow</option>
                        <option value="week" className="py-2">📅 This Week</option>
                        <option value="month" className="py-2">📅 This Month</option>
                      </>
                    ) : (
                      <>
                        <option value="week" className="py-2">📅 Last Week</option>
                        <option value="month" className="py-2">📅 Last Month</option>
                        <option value="year" className="py-2">📅 Last Year</option>
                        <option value="all" className="py-2">📅 All Time</option>
                      </>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="text-xs text-gray-500 px-1">
                  {view === "upcoming" ? "Filter upcoming appointments" : "Filter appointment history"}
                </div>
              </div>

              {/* Status Filter - Only for History */}
              {view === "history" && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <label htmlFor="statusFilter" className="text-sm font-semibold text-gray-900">
                      Status
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      id="statusFilter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none block w-full pl-4 pr-10 py-3 rounded-xl border-2 border-gray-200 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white text-sm font-medium text-gray-900 transition-all duration-200 hover:border-green-300 focus:shadow-lg cursor-pointer"
                    >
                      <option value="" className="py-2">✅ All Statuses</option>
                      <option value="completed" className="py-2">✅ Completed</option>
                      <option value="canceled" className="py-2">❌ Canceled</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 px-1">
                    Filter by appointment status
                  </div>
                </div>
              )}

              {/* Search Input */}
              <div className={`space-y-3 ${view === "history" ? "md:col-span-1" : "md:col-span-2"}`}>
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Search className="w-4 h-4 text-purple-600" />
                  </div>
                  <label htmlFor="search" className="text-sm font-semibold text-gray-900">
                    Search
                  </label>
                </div>
                <div className="relative group">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by customer name, service, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-10 py-3 rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white text-sm font-medium text-gray-900 transition-all duration-200 hover:border-purple-300 placeholder-gray-400 focus:shadow-lg group-hover:border-purple-300"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500" />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                      title="Clear search"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500 px-1">
                  Search appointments by customer or service details
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(dateFilter !== "month" || statusFilter || searchTerm) && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700 mr-2">Active Filters:</span>
                  {dateFilter !== "month" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      <Calendar className="w-3 h-3 mr-1" />
                      Date: {dateFilter}
                      <button
                        onClick={() => setDateFilter("month")}
                        className="ml-2 hover:text-blue-600 transition-colors duration-200"
                        title="Remove date filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {statusFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Status: {statusFilter}
                      <button
                        onClick={() => setStatusFilter("")}
                        className="ml-2 hover:text-green-600 transition-colors duration-200"
                        title="Remove status filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      <Search className="w-3 h-3 mr-1" />
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm("")}
                        className="ml-2 hover:text-purple-600 transition-colors duration-200"
                        title="Clear search"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setDateFilter("month");
                      setStatusFilter("");
                      setSearchTerm("");
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors duration-200"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Appointments List */}
        {!loading && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {view === "upcoming" ? "Upcoming Appointments" : view === "approvals" ? "Pending Appointments for Approval" : "Appointment History"}
                {filteredAppointments.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({filteredAppointments.length} {filteredAppointments.length === 1 ? 'appointment' : 'appointments'})
                  </span>
                )}
              </h3>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {view === "approvals" ? "No pending approvals" : "No appointments found"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {view === "approvals" 
                    ? "All appointments have been reviewed. Check back later for new requests."
                    : searchTerm 
                      ? "Try adjusting your search criteria." 
                      : "No appointments match your current filters."
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => {
                  const statusInfo = getStatusInfo(appointment.status);
                  const StatusIconComponent = statusInfo.icon;
                  
                  return (
                    <div key={appointment.ID} className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${view === "approvals" ? "border-l-4 border-orange-400 bg-orange-50/30" : ""}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className={`h-12 w-12 rounded-full ${view === "approvals" ? "bg-gradient-to-r from-orange-400 to-red-500" : "bg-gradient-to-r from-indigo-400 to-purple-600"} flex items-center justify-center text-white font-semibold`}>
                              {appointment.customer.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {appointment.customer.name}
                              </h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                <StatusIconComponent className="w-3 h-3 mr-1" />
                                {statusInfo.label}
                              </span>
                              {/* Urgency indicator for approvals */}
                              {view === "approvals" && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Needs Approval
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {appointment.service.name} • ${appointment.service.price || 0}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(appointment.start_time)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTime(appointment.start_time)} ({calculateDuration(appointment.start_time, appointment.end_time)})
                              </div>
                              {/* Time until appointment for approvals */}
                              {view === "approvals" && (
                                <div className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1 text-orange-500" />
                                  <span className="text-orange-600 font-medium">
                                    {getTimeUntil(appointment.start_time)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* View Details */}
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowRescheduleModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Approval Actions - Only for approvals view */}
                          {view === "approvals" && appointment.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(appointment.ID, "confirmed")}
                                disabled={updatingStatus === appointment.ID}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center space-x-1"
                                title="Approve Appointment"
                              >
                                <Check className="h-4 w-4" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleStatusChange(appointment.ID, "canceled")}
                                disabled={updatingStatus === appointment.ID}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center space-x-1"
                                title="Reject Appointment"
                              >
                                <X className="h-4 w-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {/* Status Actions - For upcoming view */}
                          {view === "upcoming" && appointment.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(appointment.ID, "confirmed")}
                                disabled={updatingStatus === appointment.ID}
                                className="p-2 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Confirm"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(appointment.ID, "canceled")}
                                disabled={updatingStatus === appointment.ID}
                                className="p-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {/* Reschedule */}
                          {(appointment.status === "pending" || appointment.status === "confirmed") && (
                            <button
                              onClick={() => openRescheduleModal(appointment)}
                              className="p-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                              title="Reschedule"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}

                          {/* Mark as Completed */}
                          {appointment.status === "confirmed" && (
                            <button
                              onClick={() => handleStatusChange(appointment.ID, "completed")}
                              disabled={updatingStatus === appointment.ID}
                              className="p-2 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                              title="Mark as Completed"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {view === "history" && pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  page === 1
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  page === pagination.pages
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
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
                <nav className="inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-lg border ${
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
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-lg border ${
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

      {/* Appointment Details/Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer & Service Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {selectedAppointment.customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedAppointment.customer.name}
                    </h3>
                    <p className="text-gray-600">{selectedAppointment.service.name}</p>
                    <p className="text-sm text-gray-500">${selectedAppointment.service.price || 0}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedAppointment.status).color}`}>
                    {getStatusInfo(selectedAppointment.status).label}
                  </span>
                </div>
              </div>

              {/* Current Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Current Date</h4>
                  </div>
                  <p className="text-blue-800">
                    {format(new Date(selectedAppointment.start_time), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 mr-2 text-green-600" />
                    <h4 className="font-semibold text-green-900">Current Time</h4>
                  </div>
                  <p className="text-green-800">
                    {format(new Date(selectedAppointment.start_time), "h:mm a")} - {format(new Date(selectedAppointment.end_time), "h:mm a")}
                  </p>
                </div>
              </div>

              {/* Reschedule Form */}
              {(selectedAppointment.status === "pending" || selectedAppointment.status === "confirmed") && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-3">Reschedule Appointment</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Start Time
                      </label>
                      <input
                        type="datetime-local"
                        value={newSchedule.startTime}
                        onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowRescheduleModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReschedule(selectedAppointment.ID)}
                        disabled={rescheduling}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
                      >
                        {rescheduling ? "Rescheduling..." : "Reschedule"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Contact */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Customer Contact</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-700">{selectedAppointment.customer.name}</span>
                  </div>
                  {selectedAppointment.customer.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-gray-700">{selectedAppointment.customer.email}</span>
                    </div>
                  )}
                  {selectedAppointment.customer.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-gray-700">{selectedAppointment.customer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceAppointments;