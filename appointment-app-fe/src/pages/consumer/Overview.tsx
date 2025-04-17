import { Link } from "react-router-dom";
import { Calendar, Clock, Star, Users } from "lucide-react";

// Dummy data for statistics
const stats = [
  {
    name: "Upcoming Appointments",
    value: "3",
    icon: Calendar,
    change: "+1",
    changeType: "increase",
  },
  {
    name: "Total Bookings",
    value: "12",
    icon: Clock,
    change: "+4",
    changeType: "increase",
  },
  {
    name: "Average Rating",
    value: "4.5",
    icon: Star,
    change: "+0.3",
    changeType: "increase",
  },
  {
    name: "Favorite Providers",
    value: "5",
    icon: Users,
    change: "+2",
    changeType: "increase",
  },
];

// Dummy data for recent appointments
const recentAppointments = [
  {
    id: 1,
    providerName: "John's Salon",
    service: "Haircut",
    date: "2024-03-20",
    time: "10:00 AM",
    status: "Confirmed",
  },
  {
    id: 2,
    providerName: "Beauty Spa",
    service: "Facial",
    date: "2024-03-21",
    time: "2:00 PM",
    status: "Pending",
  },
  {
    id: 3,
    providerName: "Massage Center",
    service: "Full Body Massage",
    date: "2024-03-22",
    time: "11:00 AM",
    status: "Confirmed",
  },
];

const Overview = () => {
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
                        {appointment.providerName.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.providerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.service}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      <div>{appointment.date}</div>
                      <div>{appointment.time}</div>
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
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 