import { useState } from "react";
import { Calendar, Clock, X } from "lucide-react";

// Dummy data for appointments
const appointments = [
  {
    id: 1,
    providerName: "John's Salon",
    service: "Haircut",
    date: "2024-03-20",
    time: "10:00 AM",
    status: "Confirmed",
    duration: "30 mins",
  },
  {
    id: 2,
    providerName: "Beauty Spa",
    service: "Facial",
    date: "2024-03-21",
    time: "2:00 PM",
    status: "Pending",
    duration: "45 mins",
  },
  {
    id: 3,
    providerName: "Massage Center",
    service: "Full Body Massage",
    date: "2024-03-22",
    time: "11:00 AM",
    status: "Confirmed",
    duration: "60 mins",
  },
];

const ConsumerAppointments = () => {
  const [view, setView] = useState<"upcoming" | "past">("upcoming");

  const handleCancel = (appointmentId: number) => {
    // TODO: Implement cancel appointment logic
    console.log(`Canceling appointment ${appointmentId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your appointments
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
            onClick={() => setView("past")}
            className={`px-4 py-2 rounded-md ${
              view === "past"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {view === "upcoming" ? "Upcoming Appointments" : "Past Appointments"}
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
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
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {appointment.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {appointment.time} ({appointment.duration})
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {appointment.status === "Pending" && (
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
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
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConsumerAppointments; 