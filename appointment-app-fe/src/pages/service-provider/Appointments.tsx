import { useState } from "react";
import { Calendar, Clock, Check, X } from "lucide-react";

// Dummy data for appointments
const appointments = [
  {
    id: 1,
    clientName: "John Doe",
    service: "Haircut",
    date: "2024-03-20",
    time: "10:00 AM",
    status: "Confirmed",
    duration: "30 mins",
  },
  {
    id: 2,
    clientName: "Jane Smith",
    service: "Manicure",
    date: "2024-03-20",
    time: "11:30 AM",
    status: "Pending",
    duration: "45 mins",
  },
  {
    id: 3,
    clientName: "Mike Johnson",
    service: "Massage",
    date: "2024-03-20",
    time: "2:00 PM",
    status: "Confirmed",
    duration: "60 mins",
  },
  {
    id: 4,
    clientName: "Sarah Wilson",
    service: "Facial",
    date: "2024-03-21",
    time: "9:00 AM",
    status: "Pending",
    duration: "45 mins",
  },
];

const ServiceAppointments = () => {
  // const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const handleStatusChange = (appointmentId: number, newStatus: string) => {
    // TODO: Implement status change logic
    console.log(`Changing status for appointment ${appointmentId} to ${newStatus}`);
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
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded-md ${
              view === "calendar"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-md ${
              view === "list"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {view === "calendar" && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-7 gap-4">
            {/* Calendar header */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
            {/* Calendar days */}
            {Array.from({ length: 35 }).map((_, index) => (
              <div
                key={index}
                className="h-24 border rounded-lg p-2 hover:bg-gray-50 cursor-pointer"
              >
                <div className="text-sm font-medium text-gray-900">
                  {index + 1}
                </div>
                {/* Appointment indicators */}
                {appointments
                  .filter(
                    (appointment) =>
                      new Date(appointment.date).getDate() === index + 1
                  )
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="mt-1 text-xs p-1 rounded bg-indigo-100 text-indigo-700 truncate"
                    >
                      {appointment.time} - {appointment.clientName}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Upcoming Appointments
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
                          {appointment.clientName.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.clientName}
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
                          <>
                            <button
                              onClick={() =>
                                handleStatusChange(appointment.id, "Confirmed")
                              }
                              className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(appointment.id, "Cancelled")
                              }
                              className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            appointment.status === "Confirmed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
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
      )}
    </div>
  );
};

export default ServiceAppointments; 