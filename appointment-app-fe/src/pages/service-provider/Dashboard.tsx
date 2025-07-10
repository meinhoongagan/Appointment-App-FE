import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  BarChart2, 
  // Calendar as CalendarIcon, // keep CalendarIcon for nav
  Briefcase, 
  User, 
  Menu, 
  X,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  FileText,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { BaseURL } from "../../configs/api";
import axios from "axios";

interface DashboardStats {
  total_appointments: number;
  pending_count: number;
  confirmed_count: number;
  completed_count: number;
  canceled_count: number;
  total_services: number;
  total_revenue: number;
  last_updated: string;
  total_appointments_previous?: number;
  total_revenue_previous?: number;
  total_services_previous?: number;
  pending_count_previous?: number;
}

interface RecentAppointment {
  ID: string;
  start_time: string;
  end_time: string;
  status: string;
  service: {
    name: string;
    cost: number;
  };
  customer: {
    name: string;
    email: string;
  };
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  color: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  count: number;
  services: number;
}

interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  cost: number;
  buffer_time: number;
}
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

const user = JSON.parse(localStorage.getItem("user") || '{}');
const isReceptionist = user?.role_id === 4;
const navigation = [
  { name: "Dashboard", href: "/service-dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/service-dashboard/appointments", icon: Clock },
  { name: "Services", href: "/service-dashboard/services", icon: Briefcase },
  // Receptionists and Profile only for non-receptionist
  ...(!isReceptionist ? [
    { name: "Receptionists", href: "/service-dashboard/receptionists", icon: Users },
    // { name: "Profile", href: "/service-dashboard/profile", icon: User },
  ] : [])
];

const ServiceProviderLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  // Remove calendarDate and calendarAppointments
  // const [calendarDate, setCalendarDate] = useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();

  // Service form and modal state (reused from Services.tsx)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceFormData, setServiceFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    duration: 30,
    cost: 0,
    buffer_time: 10,
  });
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const openServiceModal = () => {
    console.log(revenueData);
    setIsServiceModalOpen(true);
    setServiceError(null);
  };
  const closeServiceModal = () => {
    setIsServiceModalOpen(false);
    setServiceError(null);
    setServiceFormData({
      name: "",
      description: "",
      duration: 30,
      cost: 0,
      buffer_time: 10,
    });
  };
  const handleServiceInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setServiceFormData({
      ...serviceFormData,
      [name]: name === "cost" ? parseFloat(value) || 0 : 
              name === "duration" || name === "buffer_time" ? parseInt(value) || 0 : value,
    });
  };
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceSubmitting(true);
    setServiceError(null);
    if (!serviceFormData.name.trim()) {
      setServiceError("Service name is required");
      setServiceSubmitting(false);
      return;
    }
    if (serviceFormData.cost < 0) {
      setServiceError("Cost cannot be negative");
      setServiceSubmitting(false);
      return;
    }
    if (serviceFormData.duration <= 0) {
      setServiceError("Duration must be greater than 0");
      setServiceSubmitting(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found. Please log in.");
      const apiData = {
        ...serviceFormData,
        duration: serviceFormData.duration * 60 * 1000000000,
        buffer_time: serviceFormData.buffer_time * 60 * 1000000000,
      };
      await axios.post(`${BaseURL}/provider/services`, apiData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      addToast('success', 'Service added successfully!');
      closeServiceModal();
      fetchDashboardData(); // Refresh stats
    } catch (err: any) {
      setServiceError(err.response?.data?.error || err.message || "Failed to add service");
      addToast('error', err.response?.data?.error || err.message || "Failed to add service");
    } finally {
      setServiceSubmitting(false);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch all dashboard data in parallel
      const [statsRes, appointmentsRes, actionsRes, revenueRes] = await Promise.all([
        fetch(`${BaseURL}/provider/dashboard/overview`, { headers }),
        fetch(`${BaseURL}/provider/dashboard/recent-appointments?limit=5`, { headers }),
        fetch(`${BaseURL}/provider/dashboard/quick-actions`, { headers }),
        fetch(`${BaseURL}/provider/dashboard/revenue?range=week`, { headers })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setRecentAppointments(appointmentsData);
      }

      if (actionsRes.ok) {
        const actionsData = await actionsRes.json();
        setQuickActions(actionsData.quick_actions);
      }

      if (revenueRes.ok) {
        const revenueData = await revenueRes.json();
        setRevenueData(revenueData.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointments for calendar (all for the current month)
  useEffect(() => {
    fetchDashboardData();
    // Removed calendar effect
    // eslint-disable-next-line
  }, []);

  // Calculate percentage changes for stats
  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'canceled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Handle quick action click
  const handleQuickAction = (action: QuickAction) => {
    if (action.icon === 'calendar' || action.id === 'calendar' || action.title.toLowerCase().includes('calendar')) {
      navigate('/service-dashboard/calender');
    } else {
      navigate(action.url);
    }
  };

  // Responsive sidebar toggle
  const handleSidebarToggle = () => setSidebarOpen((open) => !open);

  // Dashboard content
  const DashboardContent = ({ openServiceModal }: { openServiceModal: () => void }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back! 👋</h1>
              <p className="text-indigo-100 mt-1">
                Here's what's happening with your business today
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-indigo-100 text-sm">Last updated</p>
                <p className="font-semibold">
                  {stats?.last_updated ? new Date(stats.last_updated).toLocaleTimeString() : 'Just now'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_appointments || 0}</p>
                <div className="flex items-center mt-2">
                  {(() => {
                    const change = getPercentageChange(stats?.total_appointments || 0, stats?.total_appointments_previous || 0);
                    if (change > 0) return <><TrendingUp className="h-4 w-4 text-green-500 mr-1" /><span className="text-sm text-green-600">+{change.toFixed(1)}% from last month</span></>;
                    if (change < 0) return <><TrendingDown className="h-4 w-4 text-red-500 mr-1" /><span className="text-sm text-red-600">{change.toFixed(1)}% from last month</span></>;
                    return <><span className="text-sm text-gray-500">No change</span></>;
                  })()}
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.total_revenue || 0)}</p>
                <div className="flex items-center mt-2">
                  {(() => {
                    const change = getPercentageChange(stats?.total_revenue || 0, stats?.total_revenue_previous || 0);
                    if (change > 0) return <><TrendingUp className="h-4 w-4 text-green-500 mr-1" /><span className="text-sm text-green-600">+{change.toFixed(1)}% from last month</span></>;
                    if (change < 0) return <><TrendingDown className="h-4 w-4 text-red-500 mr-1" /><span className="text-sm text-red-600">{change.toFixed(1)}% from last month</span></>;
                    return <><span className="text-sm text-gray-500">No change</span></>;
                  })()}
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Active Services */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Services</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_services || 0}</p>
                <div className="flex items-center mt-2">
                  {(() => {
                    const change = getPercentageChange(stats?.total_services || 0, stats?.total_services_previous || 0);
                    if (change > 0) return <><TrendingUp className="h-4 w-4 text-green-500 mr-1" /><span className="text-sm text-green-600">+{change.toFixed(1)}% from last month</span></>;
                    if (change < 0) return <><TrendingDown className="h-4 w-4 text-red-500 mr-1" /><span className="text-sm text-red-600">{change.toFixed(1)}% from last month</span></>;
                    return <><span className="text-sm text-gray-500">No change</span></>;
                  })()}
                </div>
                <button
                  onClick={openServiceModal}
                  className="mt-3 bg-gradient-to-r from-pink-400 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:shadow-lg transition-all duration-200 text-sm"
                >
                  <Plus size={16} className="mr-1" /> Add New Service
                </button>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pending_count || 0}</p>
                <div className="flex items-center mt-2">
                  {(() => {
                    const change = getPercentageChange(stats?.pending_count || 0, stats?.pending_count_previous || 0);
                    if (change > 0) return <><TrendingUp className="h-4 w-4 text-green-500 mr-1" /><span className="text-sm text-green-600">+{change.toFixed(1)}% from last month</span></>;
                    if (change < 0) return <><TrendingDown className="h-4 w-4 text-red-500 mr-1" /><span className="text-sm text-red-600">{change.toFixed(1)}% from last month</span></>;
                    return <><span className="text-sm text-gray-500">No change</span></>;
                  })()}
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Appointment Status</h3>
              <Link 
                to="/service-dashboard/appointments"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
              >
                View all
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                  <span className="font-medium text-gray-900">Pending</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{stats?.pending_count || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium text-gray-900">Confirmed</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{stats?.confirmed_count || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium text-gray-900">Completed</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats?.completed_count || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-3" />
                  <span className="font-medium text-gray-900">Canceled</span>
                </div>
                <span className="text-lg font-bold text-red-600">{stats?.canceled_count || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center p-3 text-left rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg mr-3 bg-${action.color}-100`}>
                    <div className={`h-5 w-5 text-${action.color}-600`}>
                      {action.icon === 'calendar' && <Clock className="h-5 w-5" />}
                      {action.icon === 'clock' && <Clock className="h-5 w-5" />}
                      {action.icon === 'list' && <FileText className="h-5 w-5" />}
                      {action.icon === 'plus' && <Plus className="h-5 w-5" />}
                      {action.icon === 'users' && <Users className="h-5 w-5" />}
                      {action.icon === 'chart' && <BarChart2 className="h-5 w-5" />}
                      {action.icon === 'add' && <Plus className="h-5 w-5" />}
                      {action.icon === 'clipboard' && <FileText className="h-5 w-5" />}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Appointments</h3>
            <Link 
              to="/service-dashboard/appointments"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
            >
              View all appointments
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          {recentAppointments.length > 0 ? (
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.ID} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.service.name}</p>
                      <p className="text-sm text-gray-500">
                        {appointment.customer.name} • {formatDate(appointment.start_time)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1">{appointment.status}</span>
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(appointment.service.cost)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent appointments</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any appointments yet. Start by creating a service.
              </p>
              <div className="mt-6">
                <Link
                  to="/service-dashboard/services"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Service
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg">Week</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Month</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Year</button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart2 className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Revenue chart will be displayed here</p>
              <p className="text-xs text-gray-400">Chart integration coming soon</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed z-40 inset-y-0 left-0 transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-64" : "w-16"} bg-white shadow-lg flex flex-col`}
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-200 px-4">
          <Link to="/" className="flex items-center">
            <span className="text-3xl mr-2">✨</span>
            {sidebarOpen && (
              <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
                AppointEase
              </span>
            )}
          </Link>
          <button
            className="md:block hidden p-2 ml-2"
            onClick={handleSidebarToggle}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <nav className="flex-1 px-2 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${isActive ? "bg-gradient-to-r from-pink-400 to-purple-600 text-white" : "text-gray-700 hover:bg-gray-100"}
                  ${sidebarOpen ? "justify-start" : "justify-center"}`}
                title={item.name}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {sidebarOpen && item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-600 flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
          {sidebarOpen && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Service Provider</p>
              <button className="text-xs text-gray-500 hover:text-gray-700">Logout</button>
            </div>
          )}
        </div>
      </div>
      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        <main className="py-8 px-4 max-w-7xl mx-auto">
          {location.pathname === "/service-dashboard" ? <DashboardContent openServiceModal={openServiceModal} /> : <Outlet />}
        </main>
      </div>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white shadow-md"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <Link to="/" className="flex items-center">
                  <span className="text-3xl mr-2">✨</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
                    AppointEase
                  </span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-pink-400 to-purple-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Add New Service</h3>
              <button onClick={closeServiceModal} className="text-gray-500 hover:text-gray-700 transition-colors" disabled={serviceSubmitting}>
                <X size={24} />
              </button>
            </div>
            {serviceError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p>{serviceError}</p>
              </div>
            )}
            <form onSubmit={handleServiceSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Service Name *</label>
                <input
                  type="text"
                  name="name"
                  value={serviceFormData.name}
                  onChange={handleServiceInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                  required
                  placeholder="e.g. Haircut, Consultation, Training Session"
                  disabled={serviceSubmitting}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  name="description"
                  value={serviceFormData.description}
                  onChange={handleServiceInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                  rows={4}
                  placeholder="Describe what this service includes, what clients can expect, and any important details..."
                  disabled={serviceSubmitting}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Duration *</label>
                  <select
                    name="duration"
                    value={serviceFormData.duration}
                    onChange={handleServiceInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                    disabled={serviceSubmitting}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                    <option value="180">3 hours</option>
                    <option value="240">4 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Buffer Time</label>
                  <select
                    name="buffer_time"
                    value={serviceFormData.buffer_time}
                    onChange={handleServiceInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                    disabled={serviceSubmitting}
                  >
                    <option value="0">No buffer</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Price ($) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="cost"
                    value={serviceFormData.cost}
                    onChange={handleServiceInputChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                    required
                    placeholder="0.00"
                    disabled={serviceSubmitting}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeServiceModal}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  disabled={serviceSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-pink-400 to-purple-600 text-white rounded-lg hover:shadow-md transition-all duration-200 flex items-center font-medium"
                  disabled={serviceSubmitting}
                >
                  {serviceSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Add Service
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
              toast.type === 'success' 
                ? 'bg-green-500 text-white' 
                : toast.type === 'error' 
                ? 'bg-red-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
            {toast.type === 'info' && <AlertCircle className="w-5 h-5 mr-2" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceProviderLayout; 