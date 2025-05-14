import { useState, useEffect } from "react";
import { Calendar, Clock, X, Repeat } from "lucide-react";
import { format, isBefore, differenceInMinutes } from "date-fns";
import { BaseURL } from "../../configs/api";

const ConsumerAppointments = () => {
  const [view, setView] = useState("upcoming");
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  // Fetch appointments on mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token"); // Adjust based on your auth setup
        const response = await fetch(`${BaseURL}/appointments`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        setAppointments(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchAppointments();
  }, []);

  // Handle appointment cancellation
  const handleCancel = async (appointmentId : string) => {
    try {
      const token = localStorage.getItem("token"); // Adjust based on your auth setup
      const response = await fetch(`${BaseURL}/appointments/${appointmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      // Remove the canceled appointment from state
      setAppointments(
        appointments.filter((appointment: any) => appointment.id !== appointmentId)
      );
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter appointments based on view
  const now = new Date();
  const filteredAppointments = appointments.filter((appointment: any) => {
    const startTime = new Date(appointment.start_time);
    return view === "upcoming" ? !isBefore(startTime, now) : isBefore(startTime, now);
  });

  // Format recurrence details
  const formatRecurrence = (recurPattern: any) => {
    if (!recurPattern || !recurPattern.frequency) return "";
    const frequency = recurPattern.frequency.charAt(0).toUpperCase() + recurPattern.frequency.slice(1);
    const occurrences = recurPattern.end_after > 0 ? `${recurPattern.end_after} occurrences left` : "indefinite";
    return `Repeats ${frequency.toLowerCase()}, ${occurrences}`;
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

      {/* Error Message */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Appointments List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {view === "upcoming" ? "Upcoming Appointments" : "Past Appointments"}
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {filteredAppointments.length === 0 ? (
              <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
                No {view} appointments found.
              </li>
            ) : (
              filteredAppointments.map((appointment : any) => (
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
                        {appointment.is_recurring && (
                          <div className="text-xs text-gray-400 flex items-center">
                            <Repeat className="h-3 w-3 mr-1" />
                            {formatRecurrence(appointment.recur_pattern)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(
                            new Date(appointment.start_time),
                            "yyyy-MM-dd"
                          )}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {format(
                            new Date(appointment.start_time),
                            "h:mm a"
                          )}{" "}
                          ({differenceInMinutes(
                            new Date(appointment.end_time),
                            new Date(appointment.start_time)
                          )} mins)
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {appointment.status === "pending" && (
                          <button
                            onClick={() => handleCancel(appointment.id)}
                            className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                            title="Cancel Appointment"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            appointment.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : appointment.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConsumerAppointments;