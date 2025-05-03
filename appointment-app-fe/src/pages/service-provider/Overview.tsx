import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Users,
  BarChart,
  List,
  Clipboard,
  LogOut
} from 'lucide-react';
import { BaseURL } from '../../configs/api';

// Interface definitions based on API responses
interface DashboardOverview {
  total_appointments: number;
  pending_count: number;
  confirmed_count: number;
  completed_count: number;
  canceled_count: number;
  total_services: number;
  total_revenue: number;
  last_updated: string;
}

interface Appointment {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: string;
  service: { name: string; cost: number };
  provider: { name: string };
  customer: { name: string };
}

interface RevenueData {
  date: string;
  revenue: number;
  count: number;
  services: number;
}

interface RevenueSummary {
  data: RevenueData[];
  summary: {
    total_revenue: number;
    total_appointments: number;
    time_range: string;
    start_date: string;
    end_date: string;
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

interface QuickActionsResponse {
  quick_actions: QuickAction[];
  user_id: number;
  role: string;
}

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('week');

  // Fetch data from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch Overview
        const overviewResponse = await fetch(`${BaseURL}/provider/dashboard/overview`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
if (!overviewResponse.ok) throw new Error('Failed to fetch overview');
        const overviewData = await overviewResponse.json();
        setOverview(overviewData);

        // Fetch Recent Appointments
        const appointmentsResponse = await fetch(`${BaseURL}/provider/dashboard/recent-appointments?limit=5`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!appointmentsResponse.ok) throw new Error('Failed to fetch appointments');
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData);

        // Fetch Revenue Summary
        const revenueResponse = await fetch(`${BaseURL}/provider/dashboard/revenue?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!revenueResponse.ok) throw new Error('Failed to fetch revenue');
        const revenueData = await revenueResponse.json();
        setRevenueSummary(revenueData);

        // Fetch Quick Actions
        const actionsResponse = await fetch(`${BaseURL}/provider/dashboard/quick-actions`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!actionsResponse.ok) throw new Error('Failed to fetch quick actions');
        const actionsData = await actionsResponse.json();
        setQuickActions(actionsData.quick_actions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Get icon for quick action
  const getIcon = (icon: string) => {
    switch (icon) {
      case 'calendar': return <Calendar className="w-5 h-5 text-white" />;
      case 'add': return <Plus className="w-5 h-5 text-white" />;
      case 'users': return <Users className="w-5 h-5 text-white" />;
      case 'chart': return <BarChart className="w-5 h-5 text-white" />;
      case 'clock': return <Clock className="w-5 h-5 text-white" />;
      case 'list': return <List className="w-5 h-5 text-white" />;
      case 'plus': return <Plus className="w-5 h-5 text-white" />;
      case 'clipboard': return <Clipboard className="w-5 h-5 text-white" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/service-dashboard" className="flex items-center">
            <span className="text-3xl mr-2">✨</span>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
              AppointEase
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 space-y-6 mt-16">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {overview?.last_updated ? new Date(overview.last_updated).toLocaleString() : '-'}
          </div>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
            <dt>
              <div className="absolute rounded-md bg-gradient-to-r from-pink-400 to-purple-600 p-3">
                <Calendar className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">Total Appointments</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{overview?.total_appointments || 0}</p>
            </dd>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
            <dt>
              <div className="absolute rounded-md bg-gradient-to-r from-pink-400 to-purple-600 p-3">
                <Clock className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">Pending</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{overview?.pending_count || 0}</p>
            </dd>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
            <dt>
              <div className="absolute rounded-md bg-gradient-to-r from-pink-400 to-purple-600 p-3">
                <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">Confirmed</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{overview?.confirmed_count || 0}</p>
            </dd>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
            <dt>
              <div className="absolute rounded-md bg-gradient-to-r from-pink-400 to-purple-600 p-3">
                <DollarSign className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">Total Revenue</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">${(overview?.total_revenue || 0).toFixed(2)}</p>
            </dd>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
            <dt>
              <div className="absolute rounded-md bg-gradient-to-r from-pink-400 to-purple-600 p-3">
                <XCircle className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">Canceled</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{overview?.canceled_count || 0}</p>
            </dd>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(action.url)}
                className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-2">
                  <div className="rounded-md bg-gradient-to-r from-pink-400 to-purple-600 p-2">
                    {getIcon(action.icon)}
                  </div>
                  <h3 className="ml-2 font-medium text-gray-900">{action.title}</h3>
                </div>
                <p className="text-sm text-gray-500">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium leading-6 text-gray-900">Recent Appointments</h2>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-4 py-3 sm:px-6">Title</th>
                    <th className="px-4 py-3 sm:px-6">Customer</th>
                    <th className="px-4 py-3 sm:px-6">Service</th>
                    <th className="px-4 py-3 sm:px-6">Date</th>
                    <th className="px-4 py-3 sm:px-6">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt.id} className="border-t border-gray-200">
                      <td className="px-4 py-3 sm:px-6">{appt.title}</td>
                      <td className="px-4 py-3 sm:px-6">{appt.customer.name}</td>
                      <td className="px-4 py-3 sm:px-6">{appt.service.name}</td>
                      <td className="px-4 py-3 sm:px-6">{new Date(appt.start_time).toLocaleDateString()}</td>
                      <td className="px-4 py-3 sm:px-6">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            appt.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : appt.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : appt.status === 'canceled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link
                to="/service-dashboard/appointments"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all appointments
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h2 className="text-lg font-medium leading-6 text-gray-900">Revenue Summary</h2>
            <div className="flex space-x-2">
              {['day', 'week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-pink-400 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-200">
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-xl font-semibold text-gray-900">${revenueSummary?.summary.total_revenue.toFixed(2) || '0.00'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Appointments</p>
                <p className="text-xl font-semibold text-gray-900">{revenueSummary?.summary.total_appointments || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Time Period</p>
                <p className="text-xl font-semibold text-gray-900">
                  {revenueSummary?.summary.start_date} to {revenueSummary?.summary.end_date}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-4 py-3 sm:px-6">Date</th>
                    <th className="px-4 py-3 sm:px-6">Revenue</th>
                    <th className="px-4 py-3 sm:px-6">Appointments</th>
                    <th className="px-4 py-3 sm:px-6">Services</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueSummary?.data.map((item) => (
                    <tr key={item.date} className="border-t border-gray-200">
                      <td className="px-4 py-3 sm:px-6">{item.date}</td>
                      <td className="px-4 py-3 sm:px-6">${item.revenue.toFixed(2)}</td>
                      <td className="px-4 py-3 sm:px-6">{item.count}</td>
                      <td className="px-4 py-3 sm:px-6">{item.services}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;