import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, Check } from "lucide-react";
import { format, addDays } from "date-fns";
import { BaseURL } from "../../configs/api";

interface Provider {
  provider: {
    id: number;
    name: string;
  };
  business_details?: {
    business_name: string;
    logo_url: string;
    city: string;
    address: string;
    description: string;
  };
}

interface Service {
  id: number;
  name: string;
  duration: number;
}

const BookService = () => {
  const { providerId, serviceId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviewStats, setReviewStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    serviceId: serviceId || "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    isRecurring: false,
    recurrence: {
      frequency: "weekly",
      endAfter: 1,
    },
  });

  // Fetch provider details, services, and review stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Fetch provider details
        const providerResponse = await fetch(`${BaseURL}/providers/${providerId}`, { headers });
        if (!providerResponse.ok) throw new Error("Failed to fetch provider details");
        const providerData = await providerResponse.json();
        setProvider(providerData);

        // Fetch services
        const servicesResponse = await fetch(`${BaseURL}/providers/${providerId}/services`, { headers });
        if (!servicesResponse.ok) throw new Error("Failed to fetch services");
        const servicesData = await servicesResponse.json();
        console.log("Fetched services:", servicesData); // Debug services
        setServices(servicesData);

        // Fetch review stats
        const reviewStatsResponse = await fetch(`${BaseURL}/providers/${providerId}/review-stats`, { headers });
        if (!reviewStatsResponse.ok) throw new Error("Failed to fetch review stats");
        const reviewStatsData = await reviewStatsResponse.json();
        setReviewStats(reviewStatsData);

        // Pre-select service if serviceId is provided
        if (serviceId && servicesData.find((s: Service) => s.id.toString() === serviceId)) {
          setForm((prev) => ({ ...prev, serviceId }));
        }

        setError(null);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, [providerId, serviceId]);

  // Handle form submission to create appointment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.serviceId) throw new Error("Please select a service");

      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Construct StartTime
      const [year, month, day] = form.date.split("-").map(Number);
      const [hour, minute] = form.time.split(":").map(Number);
      const startTime = new Date(year, month - 1, day, hour, minute);

      // Get CustomerID
      const userResponse = await fetch(`${BaseURL}/auth/me`, { headers });
      if (!userResponse.ok) throw new Error("Failed to fetch user data");
      const userData = await userResponse.json();
      const customerId = userData.id;

      const appointment = {
        service_id: parseInt(form.serviceId, 10),
        provider_id: parseInt(providerId || "0", 10),
        customer_id: customerId,
        start_time: startTime.toISOString(),
        is_recurring: form.isRecurring,
        recur_pattern: form.isRecurring ? form.recurrence : undefined,
      };

      console.log("Submitting appointment:", appointment); // Debug appointment data

      const response = await fetch(`${BaseURL}/appointments`, {
        method: "POST",
        headers,
        body: JSON.stringify(appointment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create appointment");
      }

      setSuccess("Appointment booked successfully!");
      setError(null);
      setTimeout(() => navigate("/appointments"), 2000);
    } catch (err: any) {
      setError(err.message);
      setSuccess(null);
    }
  };

  // Generate time slots (placeholder, assuming 9 AM to 5 PM)
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
  ];

  if (!provider) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Book with {provider.business_details?.business_name || provider.provider.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Select a service and schedule your appointment</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      {/* Provider Details */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="h-48 w-full">
          <img
            src={provider.business_details?.logo_url || "https://via.placeholder.com/150"}
            alt={provider.business_details?.business_name || provider.provider.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {provider.business_details?.business_name || provider.provider.name}
            </h2>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="ml-1 text-sm text-gray-600">
                {reviewStats.average_rating.toFixed(1)} ({reviewStats.total_reviews} reviews)
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            {provider.business_details?.city || provider.business_details?.address || "Unknown"}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            {provider.business_details?.description || "No description available."}
          </p>
        </div>
      </div>

      {/* Booking Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Book an Appointment</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Service Selection */}
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700">
              Select Service
            </label>
            <select
              id="service"
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="">Choose a service</option>
              {services.map((service: Service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.duration} mins)
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              min={format(new Date(), "yyyy-MM-dd")}
              max={format(addDays(new Date(), 30), "yyyy-MM-dd")}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          {/* Time Selection */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Time
            </label>
            <select
              id="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Recurrence Options */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Recurring Appointment</span>
            </label>
            {form.isRecurring && (
              <div className="mt-2 space-y-2">
                <div>
                  <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                    Frequency
                  </label>
                  <select
                    id="frequency"
                    value={form.recurrence.frequency}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        recurrence: { ...form.recurrence, frequency: e.target.value },
                      })
                    }
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="endAfter" className="block text-sm font-medium text-gray-700">
                    Number of Occurrences
                  </label>
                  <input
                    type="number"
                    id="endAfter"
                    value={form.recurrence.endAfter}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        recurrence: { ...form.recurrence, endAfter: parseInt(e.target.value) },
                      })
                    }
                    min="1"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-purple-600 hover:from-pink-500 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Check className="h-5 w-5 mr-2" />
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookService;