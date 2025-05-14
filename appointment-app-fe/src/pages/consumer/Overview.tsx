import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Star, Users } from "lucide-react";
import axios from "axios";
import { BaseURL } from "../../configs/api";

// Define interfaces for the data structures
interface Appointment {
  id: number;
  provider: {
    name: string;
  };
  service: {
    name: string;
  };
  start_time: string;
  status: string;
}

interface ReviewStats {
  total_reviews: number;
  average_rating: number;
}

interface Stat {
  name: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  change: string;
  changeType: "increase" | "decrease";
}

const Overview = () => {
  // State for stats and appointments
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assume token is stored in localStorage or a context
  const token = localStorage.getItem("token") || ""; // Adjust based on your auth setup

  // Fetch data when component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all appointments for the user
        const appointmentsResponse = await axios.get(`${BaseURL}/appointments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const appointments: Appointment[] = appointmentsResponse.data;

        // Filter upcoming appointments (start_time > now)
        const now = new Date();
        const upcomingAppointments = appointments.filter((appt) => new Date(appt.start_time) > now);
        const totalBookings = appointments.length;
        const upcomingCount = upcomingAppointments.length;

        // Fetch review stats (using a placeholder provider ID; adjust as needed)
        const reviewStatsResponse = await axios.get(`${BaseURL}/providers/1/review-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const reviewStats: ReviewStats = reviewStatsResponse.data;

        // Mock favorite providers count (replace with actual API call if available)
        const favoriteProvidersCount = 5; // Replace with /providers/favorites endpoint if available

        // Update stats
        setStats([
          {
            name: "Upcoming Appointments",
            value: upcomingCount.toString(),
            icon: Calendar,
            change: `+${upcomingCount}`,
            changeType: "increase",
          },
          {
            name: "Total Bookings",
            value: totalBookings.toString(),
            icon: Clock,
            change: `+${totalBookings}`,
            changeType: "increase",
          },
          {
            name: "Average Rating",
            value: reviewStats.average_rating.toFixed(1),
            icon: Star,
            change: `+${(reviewStats.average_rating || 0).toFixed(1)}`,
            changeType: "increase",
          },
          {
            name: "Favorite Providers",
            value: favoriteProvidersCount.toString(),
            icon: Users,
            change: `+${favoriteProvidersCount}`,
            changeType: "increase",
          },
        ]);

        // Set recent appointments (limit to 3, keep as Appointment type)
        setRecentAppointments(appointments.slice(0, 3));

      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your appointments.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
          >
            <dt>
              <div className="absolute rounded-md bg-gradient-to-r from-pink-400 to-purple-600 p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === "increase"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Recent Appointments
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {recentAppointments.map((appointment) => (
              <li key={appointment.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-600 flex items-center justify-center text-white">
                        {appointment.provider.name.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.provider.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.service.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      <div>{new Date(appointment.start_time).toLocaleDateString()}</div>
                      <div>
                        {new Date(appointment.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        appointment.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link
              to="/consumer-dashboard/appointments"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all appointments
              <span aria-hidden="true"> →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;