import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../configs/api";
import { Calendar, Clock, CheckCircle, AlertCircle, Users, RefreshCw } from "lucide-react";
import { LucideIcon } from "lucide-react";

// Types
interface Stat {
  total_appointments: number;
  pending_count: number;
  confirmed_count: number;
  completed_count: number;
}

interface Service {
  ID: number;
  name: string;
  description: string;
  duration?: number;
  cost?: number;
}

interface Customer {
  name: string;
}

interface Appointment {
  ID: number;
  service?: Service;
  customer?: Customer;
  start_time?: string;
  end_time?: string;
  status?: string;
}

const navItems = [
  { name: "Dashboard", key: "dashboard" },
  { name: "Appointments", key: "appointments" },
  { name: "Services", key: "services" },
];

const statCard = (label: string, value: number, color: string, Icon: LucideIcon) => (
  <div className={`bg-white rounded-lg shadow-md p-6 flex items-center space-x-4 border-l-4 ${color} transition-all hover:shadow-lg`}>
    <Icon className="w-8 h-8 text-gray-500" />
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{label}</p>
    </div>
  </div>
);

const statusBadge = (status: string = "") => {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmed: "bg-blue-100 text-blue-800 border-blue-300",
    completed: "bg-green-100 text-green-800 border-green-300",
    canceled: "bg-red-100 text-red-800 border-red-300",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${map[status] || "bg-gray-100 text-gray-700 border-gray-300"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ReceptionistDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [stats, setStats] = useState<Stat | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchStats();
    // eslint-disable-next-line
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, appointmentsRes, pendingRes, servicesRes] = await Promise.all([
        axios.get(`${BaseURL}/provider/dashboard/overview`, { headers }),
        axios.get(`${BaseURL}/provider/appointments/upcoming?limit=10`, { headers }),
        axios.get(`${BaseURL}/provider/appointments?status=pending&limit=20`, { headers }),
        axios.get(`${BaseURL}/provider/services/get-provider/service`, { headers }),
      ]);
      setStats(statsRes.data as Stat);
      setAppointments((appointmentsRes.data.appointments || []) as Appointment[]);
      setPendingAppointments((pendingRes.data || []) as Appointment[]);
      setServices((servicesRes.data || []) as Service[]);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || "Failed to load dashboard");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(
        `${BaseURL}/provider/appointments/${appointmentId}/status`,
        { status: newStatus },
        { headers }
      );
      fetchStats();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.error || err.message || "Failed to update status");
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to update status");
      }
    }
  };

  const handleReschedule = async (appointmentId: number) => {
    const newStart = prompt("Enter new start time (YYYY-MM-DDTHH:mm:ssZ, RFC3339):");
    if (!newStart) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(
        `${BaseURL}/provider/appointments/${appointmentId}/reschedule`,
        { start_time: newStart },
        { headers }
      );
      fetchStats();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.error || err.message || "Failed to reschedule");
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to reschedule");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex space-x-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                  activeTab === item.key
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-700"
                }`}
                onClick={() => setActiveTab(item.key)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="animate-spin w-10 h-10 text-indigo-600" />
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center font-medium">
            {error}
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCard("Total Appointments", stats.total_appointments, "border-indigo-600", Calendar)}
                {statCard("Pending", stats.pending_count, "border-yellow-400", Clock)}
                {statCard("Confirmed", stats.confirmed_count, "border-blue-500", CheckCircle)}
                {statCard("Completed", stats.completed_count, "border-green-500", AlertCircle)}
              </div>
            )}
            {activeTab === "appointments" && (
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <Clock className="w-6 h-6 mr-2 text-yellow-500" /> Pending Approvals
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">End</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pendingAppointments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                              No pending appointments.
                            </td>
                          </tr>
                        ) : (
                          pendingAppointments.map((apt) => (
                            <tr key={apt.ID} className="hover:bg-gray-50 transition">
                              <td className="px-6 py-4 text-gray-900 font-medium">{apt.service?.name}</td>
                              <td className="px-6 py-4 text-gray-700">{apt.customer?.name}</td>
                              <td className="px-6 py-4">{apt.start_time?.slice(0, 16).replace("T", " ")}</td>
                              <td className="px-6 py-4">{apt.end_time?.slice(0, 16).replace("T", " ")}</td>
                              <td className="px-6 py-4 space-x-2">
                                <button
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 font-medium transition"
                                  onClick={() => handleStatusChange(apt.ID, "confirmed")}
                                >
                                  Approve
                                </button>
                                <button
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-medium transition"
                                  onClick={() => handleStatusChange(apt.ID, "canceled")}
                                >
                                  Reject
                                </button>
                                <button
                                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 font-medium transition"
                                  onClick={() => handleReschedule(apt.ID)}
                                >
                                  Reschedule
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <CheckCircle className="w-6 h-6 mr-2 text-blue-500" /> Upcoming & Confirmed Appointments
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">End</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {appointments.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                              No upcoming appointments.
                            </td>
                          </tr>
                        ) : (
                          appointments.map((apt) => (
                            <tr key={apt.ID} className="hover:bg-gray-50 transition">
                              <td className="px-6 py-4 text-gray-900 font-medium">{apt.service?.name}</td>
                              <td className="px-6 py-4 text-gray-700">{apt.customer?.name}</td>
                              <td className="px-6 py-4">{apt.start_time?.slice(0, 16).replace("T", " ")}</td>
                              <td className="px-6 py-4">{apt.end_time?.slice(0, 16).replace("T", " ")}</td>
                              <td className="px-6 py-4">{statusBadge(apt.status)}</td>
                              <td className="px-6 py-4 space-x-2">
                                {apt.status === "confirmed" && (
                                  <button
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 font-medium transition"
                                    onClick={() => handleStatusChange(apt.ID, "completed")}
                                  >
                                    Mark Complete
                                  </button>
                                )}
                                <button
                                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 font-medium transition"
                                  onClick={() => handleReschedule(apt.ID)}
                                >
                                  Reschedule
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "services" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-indigo-500" /> Services (View Only)
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration (min)</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {services.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                            No services found.
                          </td>
                        </tr>
                      ) : (
                        services.map((svc: Service) => (
                          <tr key={svc.ID} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-gray-900 font-medium">{svc.name}</td>
                            <td className="px-6 py-4 text-gray-700">{svc.description}</td>
                            <td className="px-6 py-4">{Math.round(((svc.duration ?? 0) / 60000000000))}</td>
                            <td className="px-6 py-4">${svc.cost !== undefined ? svc.cost.toFixed(2) : "0.00"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReceptionistDashboard;