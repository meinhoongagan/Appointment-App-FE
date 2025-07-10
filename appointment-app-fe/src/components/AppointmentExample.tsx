import React, { useState, useEffect } from 'react';
import { 
  consumerAppointmentService, 
  providerAppointmentService, 
  appointmentUtils,
  type Appointment 
} from '../services/appointmentService';

/**
 * Example component demonstrating how to use the appointment service
 * This component shows best practices for integrating with the appointment system
 */
const AppointmentExample: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'consumer' | 'provider'>('consumer');

  // Example: Fetch appointments based on user role
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data: Appointment[];
      
      if (userRole === 'consumer') {
        // Consumer: Get upcoming appointments
        data = await consumerAppointmentService.getAppointmentsByStatus('upcoming');
      } else {
        // Provider: Get upcoming appointments with stats
        const response = await providerAppointmentService.getUpcomingAppointments('month', 10);
        data = response.appointments;
      }
      
      setAppointments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Example: Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      if (userRole === 'consumer') {
        await consumerAppointmentService.cancelAppointment(appointmentId);
        alert('Appointment cancelled successfully!');
      } else {
        await providerAppointmentService.updateAppointmentStatus(appointmentId, 'canceled');
        alert('Appointment cancelled successfully!');
      }
      
      // Refresh the appointments list
      fetchAppointments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Example: Handle status update (provider only)
  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    if (userRole !== 'provider') return;

    try {
      await providerAppointmentService.updateAppointmentStatus(appointmentId, newStatus);
      alert(`Appointment ${newStatus} successfully!`);
      fetchAppointments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Example: Create a new appointment
  const handleCreateAppointment = async () => {
    try {
      // const appointmentData = {
      //   service_id: 1,
      //   provider_id: 1,
      //   customer_id: 1,
      //   start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      //   is_recurring: false
      // };

      // const newAppointment = await consumerAppointmentService.createAppointment(appointmentData);
      alert('Appointment created successfully!');
      fetchAppointments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [userRole]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Appointment Service Example
        </h1>
        
        {/* Role Toggle */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setUserRole('consumer')}
            className={`px-4 py-2 rounded-lg ${
              userRole === 'consumer'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Consumer View
          </button>
          <button
            onClick={() => setUserRole('provider')}
            className={`px-4 py-2 rounded-lg ${
              userRole === 'provider'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Provider View
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={fetchAppointments}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Appointments'}
          </button>
          
          {userRole === 'consumer' && (
            <button
              onClick={handleCreateAppointment}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Test Appointment
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          appointments.map((appointment) => {
            const statusInfo = appointmentUtils.getStatusInfo(appointment.status);
            const duration = appointmentUtils.calculateDuration(appointment.start_time, appointment.end_time);
            const timeUntil = appointmentUtils.getTimeUntil(appointment.start_time);
            
            return (
              <div
                key={appointment.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {userRole === 'consumer' 
                          ? appointment.provider.name 
                          : appointment.customer.name
                        }
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2">
                      {appointment.service.name} • ${appointment.service.price || 0}
                    </p>
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Date: {new Date(appointment.start_time).toLocaleDateString()}</p>
                      <p>Time: {new Date(appointment.start_time).toLocaleTimeString()}</p>
                      <p>Duration: {duration}</p>
                      {userRole === 'consumer' && (
                        <p>Time until: {timeUntil}</p>
                      )}
                    </div>

                    {appointment.is_recurring && appointment.recur_pattern && (
                      <p className="text-sm text-purple-600 mt-2">
                        {appointmentUtils.formatRecurrence(appointment.recur_pattern)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    {/* Cancel Button */}
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="px-3 py-1 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                      >
                        Cancel
                      </button>
                    )}

                    {/* Provider Status Actions */}
                    {userRole === 'provider' && appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                          className="px-3 py-1 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, 'canceled')}
                          className="px-3 py-1 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {userRole === 'provider' && appointment.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                          className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, 'canceled')}
                          className="px-3 py-1 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Usage Examples */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Examples</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Consumer Service Usage:</h3>
            <pre className="bg-white p-3 rounded text-sm overflow-x-auto">
{`// Get upcoming appointments
const appointments = await consumerAppointmentService.getAppointmentsByStatus('upcoming');

// Cancel appointment
await consumerAppointmentService.cancelAppointment(appointmentId);

// Create appointment
const newAppointment = await consumerAppointmentService.createAppointment({
  service_id: 1,
  provider_id: 1,
  customer_id: 1,
  start_time: new Date().toISOString(),
  is_recurring: false
});`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Provider Service Usage:</h3>
            <pre className="bg-white p-3 rounded text-sm overflow-x-auto">
{`// Get upcoming appointments with stats
const response = await providerAppointmentService.getUpcomingAppointments('month', 10);

// Update appointment status
await providerAppointmentService.updateAppointmentStatus(appointmentId, 'confirmed');

// Get appointment history
const history = await providerAppointmentService.getAppointmentHistory(1, 10, '', 'month');`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Utility Functions:</h3>
            <pre className="bg-white p-3 rounded text-sm overflow-x-auto">
{`// Calculate duration
const duration = appointmentUtils.calculateDuration(startTime, endTime);

// Get status info
const statusInfo = appointmentUtils.getStatusInfo('pending');

// Format recurrence
const recurrence = appointmentUtils.formatRecurrence(recurPattern);

// Calculate time until
const timeUntil = appointmentUtils.getTimeUntil(startTime);`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentExample; 