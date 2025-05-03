import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../configs/api";
import { Calendar, Clock, ChevronRight, Menu, X, Plus, Trash, Edit, DollarSign, LogOut, Loader2 } from "lucide-react";
import ErrorBoundary from "../../utils/Error-Boundary";

// Define the Service interface to match the API response structure
interface Service {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: null | string;
  name: string;
  description: string;
  duration: number; // Duration in nanoseconds
  cost: number;
  buffer_time: number; // Buffer time in nanoseconds
  provider_id: number;
  provider?: {
    id: number;
    name: string;
    email: string;
    // ...other provider fields
  };
}

// Define form data interface
interface ServiceFormData {
  name: string;
  description: string;
  duration: number; // Duration in nanoseconds
  cost: number;
  buffer_time: number; // Buffer time in nanoseconds
}

const ServiceDashboard = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    duration: 30 * 60 * 1000000000, // 30 minutes in nanoseconds
    cost: 0,
    buffer_time: 10 * 60 * 1000000000, // 10 minutes in nanoseconds
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await axios.get(`${BaseURL}/provider/services/get-provider/service`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data) {
        throw new Error("No data received from the server");
      }

      // Log response data for debugging
      console.log("Fetched services:", response.data);

      // Validate and filter services
      const validServices = response.data.filter((service: any): service is Service => {
        if (!service || typeof service.ID !== "number" || isNaN(service.ID)) {
          console.warn("Invalid service detected:", service);
          return false;
        }
        return true;
      });

      if (response.data.length > 0 && validServices.length === 0) {
        setError("Received invalid service data from the server");
      } else {
        setServices(validServices);
        setError(null);
      }
    } catch (err: any) {
      console.error("Detailed error in fetchServices:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError("You don't have permission to access this resource.");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to load services");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field?: 'duration' | 'buffer_time'
  ) => {
    const { name, value } = e.target;
    if (field) {
      const minutes = parseInt(value, 10);
      const nanoseconds = minutes * 60 * 1000000000; // Convert minutes to nanoseconds
      setFormData({
        ...formData,
        [field]: nanoseconds,
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === "cost" ? parseFloat(value) : value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      if (isEditing && currentServiceId != null && !isNaN(currentServiceId)) {
        await axios.patch(
          `${BaseURL}/provider/services/${currentServiceId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else if (!isEditing) {
        await axios.post(
          `${BaseURL}/provider/services`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        throw new Error("Invalid service ID for update");
      }
      fetchServices();
      closeModal();
    } catch (err: any) {
      console.error("Detailed error in handleSubmit:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError("You don't have permission to perform this action.");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to save service");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditService = (service: Service) => {
    if (typeof service.ID !== "number" || isNaN(service.ID)) {
      console.error("Invalid service ID:", service);
      setError("Cannot edit service: Invalid service ID");
      return;
    }
    setIsEditing(true);
    setCurrentServiceId(service.ID);
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      cost: service.cost,
      buffer_time: service.buffer_time,
    });
    setIsModalOpen(true);
  };

  const handleDeleteService = async (id: number) => {
    if (typeof id !== "number" || isNaN(id)) {
      console.error("Invalid service ID for deletion:", id);
      setError("Cannot delete service: Invalid service ID");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      await axios.delete(`${BaseURL}/provider/services/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchServices();
    } catch (err: any) {
      console.error("Detailed error in handleDeleteService:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError("You don't have permission to delete this service.");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to delete service");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentServiceId(null);
    setFormData({
      name: "",
      description: "",
      duration: 30 * 60 * 1000000000, // 30 minutes
      cost: 0,
      buffer_time: 10 * 60 * 1000000000, // 10 minutes
    });
  };

  const formatDuration = (nanoseconds: number | undefined) => {
    if (!nanoseconds) return "Not specified";
    const minutes = Math.floor(nanoseconds / (60 * 1000000000));
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    let result = `${hours} hour${hours !== 1 ? "s" : ""}`;
    if (remainingMinutes > 0) {
      result += ` ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
    }
    return result;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md py-4 fixed w-full z-50">
          <div className="container mx-auto px-6 flex justify-between items-center">
            <Link to="/service-dashboard" className="flex items-center">
              <h1 className="text-2xl font-bold flex items-center text-gray-800">
                <span className="text-3xl mr-2">✨</span>
                <span className="bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">AppointEase</span>
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/service-dashboard" className="font-medium text-gray-700 hover:text-pink-500 transition">Dashboard</Link>
              <Link to="/service-dashboard/appointments" className="font-medium text-gray-700 hover:text-pink-500 transition">Appointments</Link>
              <Link to="/service-dashboard/services" className="font-medium text-pink-500 transition">Services</Link>
              <Link to="/service-dashboard/profile" className="font-medium text-gray-700 hover:text-pink-500 transition">Profile</Link>
              <button onClick={handleLogout} className="flex items-center text-gray-700 hover:text-pink-500 transition">
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="text-gray-800" size={24} />
              ) : (
                <Menu className="text-gray-800" size={24} />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white shadow-xl px-4 py-5 absolute top-full left-0 right-0 border-t border-gray-100">
              <nav className="flex flex-col space-y-4">
                <Link to="/service-dashboard" className="text-gray-700 hover:text-pink-500 transition font-medium" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <Link to="/service-dashboard/appointments" className="text-gray-700 hover:text-pink-500 transition font-medium" onClick={() => setMobileMenuOpen(false)}>Appointments</Link>
                <Link to="/service-dashboard/services" className="text-pink-500 transition font-medium" onClick={() => setMobileMenuOpen(false)}>Services</Link>
                <Link to="/service-dashboard/profile" className="text-gray-700 hover:text-pink-500 transition font-medium" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-gray-700 hover:text-pink-500 transition font-medium text-left">Logout</button>
              </nav>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-grow pt-24 pb-20">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">My Services</h2>
                <p className="text-gray-600">Manage the services you offer to your clients</p>
              </div>
              <button
                onClick={openModal}
                className="bg-gradient-to-r from-pink-400 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:shadow-lg transition"
              >
                <Plus size={20} className="mr-2" />
                Add Service
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <p>{error}</p>
              </div>
            )}

            {/* Services List */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
              </div>
            ) : services.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center">
                <Calendar size={48} className="mx-auto text-pink-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Services Yet</h3>
                <p className="text-gray-600 mb-6">Start by adding your first service to offer to your clients.</p>
                <button
                  onClick={openModal}
                  className="bg-gradient-to-r from-pink-400 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition"
                >
                  Create Your First Service
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <div key={service.ID} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">{service.name || "Unnamed Service"}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditService(service)}
                          className="p-1 hover:bg-gray-100 rounded-full transition"
                          disabled={deleting}
                        >
                          <Edit size={18} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.ID)}
                          className="p-1 hover:bg-gray-100 rounded-full transition"
                          disabled={deleting}
                        >
                          <Trash size={18} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{service.description || "No description provided"}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-700">
                        <Clock size={16} className="mr-2 text-pink-500" />
                        <span>{formatDuration(service.duration)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <DollarSign size={16} className="mr-2 text-green-500" />
                        <span>${(service.cost || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <ChevronRight size={16} className="mr-2 text-purple-500" />
                        <span>Buffer: {formatDuration(service.buffer_time)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Add/Edit Service Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {isEditing ? "Edit Service" : "Add New Service"}
                </h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700" disabled={submitting}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Service Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                    placeholder="e.g. Haircut, Consultation, Training Session"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    rows={3}
                    placeholder="Describe what this service includes"
                    disabled={submitting}
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-2">Duration</label>
                    <select
                      name="duration"
                      value={formData.duration / (60 * 1000000000)} // Convert nanoseconds to minutes for display
                      onChange={(e) => handleInputChange(e, 'duration')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      disabled={submitting}
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-2">Buffer Time</label>
                    <select
                      name="buffer_time"
                      value={formData.buffer_time / (60 * 1000000000)} // Convert nanoseconds to minutes for display
                      onChange={(e) => handleInputChange(e, 'buffer_time')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      disabled={submitting}
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
                  <label className="block text-gray-700 font-medium mb-2">Price ($)</label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-pink-400 to-purple-600 text-white rounded-lg hover:shadow-md transition flex items-center"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        {isEditing ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      isEditing ? "Update Service" : "Add Service"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Deleting Overlay */}
        {deleting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
          </div>
        )}

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6">
          <div className="container mx-auto px-6 text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} AppointEase. All rights reserved.
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default ServiceDashboard;