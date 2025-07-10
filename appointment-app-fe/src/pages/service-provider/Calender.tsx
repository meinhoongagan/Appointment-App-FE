import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { BaseURL } from '../../configs/api';

interface Appointment {
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

const CalenderPage = () => {
  const [date, setDate] = useState<Date | null>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch appointments for the current month
  useEffect(() => {
    if (!date) return;
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const res = await fetch(`${BaseURL}/provider/appointments?month=${month}&year=${year}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch appointments');
        const data = await res.json();
        setAppointments(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [date]);

  // Get appointments for the selected day
  const selectedAppointments = appointments.filter(app => {
    if (!date) return false;
    const appDate = new Date(app.start_time);
    return (
      appDate.getFullYear() === date.getFullYear() &&
      appDate.getMonth() === date.getMonth() &&
      appDate.getDate() === date.getDate()
    );
  });

  // Highlight days with appointments
  const tileContent = ({ date: tileDate, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const hasAppointment = appointments.some(app => {
        const appDate = new Date(app.start_time);
        return (
          appDate.getFullYear() === tileDate.getFullYear() &&
          appDate.getMonth() === tileDate.getMonth() &&
          appDate.getDate() === tileDate.getDate()
        );
      });
      return hasAppointment ? <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 mx-auto" /> : null;
    }
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">Calendar</h1>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
        <Calendar
          onChange={(value) => setDate(value instanceof Date ? value : new Date())}
          value={date}
          className="react-calendar border-none"
          tileContent={tileContent}
        />
        <div className="mt-8 w-full">
          <h2 className="text-xl font-semibold mb-2 text-indigo-600 text-center">
            Appointments on {date ? date.toLocaleDateString() : '-'}
          </h2>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : selectedAppointments.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
              No appointments for this day.
            </div>
          ) : (
            <ul className="space-y-3">
              {selectedAppointments.map(app => (
                <li key={app.ID} className="bg-indigo-50 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-indigo-700">{app.service.name}</div>
                    <div className="text-sm text-gray-600">{app.customer.name} ({app.customer.email})</div>
                  </div>
                  <div className="text-sm text-gray-500 mt-2 md:mt-0">
                    {new Date(app.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(app.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 font-semibold mt-2 md:mt-0">
                    {app.status}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalenderPage; 