import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../configs/api";
import { Calendar, Clock, ChevronRight, Menu, X, Plus, Trash, Edit, DollarSign } from "lucide-react";
import ErrorBoundary from "../utils/Error-Boundary";

// Define the Service interface
interface Service {
  ID: number;
  Name: string;
  Description: string;
  Duration: string;
  Cost: number;
  BufferTime: string;
  ProviderID: number;
}

// Define form data interface
interface ServiceFormData {
  name: string;
  description: string;
  duration: string;
  cost: number;
  buffer_time: string;
}

const ServiceDashboard = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    duration: "30m",
    cost: 0,
    buffer_time: "10m",
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

      console.log("Fetching services with token:", token);
      const response = await axios.get(`${BaseURL}/services`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.data) {
        throw new Error("No data received from the server");
      }
      
      setServices(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Detailed error in fetchServices:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else if (err.response?.status === 403) {
        setError("You don't have permission to access this resource.");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to load services");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "cost" ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      console.log("Submitting service with token:", token);
      if (isEditing && currentServiceId) {
        await axios.patch(
          `${BaseURL}/services/${currentServiceId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          `${BaseURL}/services`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      fetchServices();
      closeModal();
    } catch (err: any) {
      console.error("Detailed error in handleSubmit:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else if (err.response?.status === 403) {
        setError("You don't have permission to perform this action.");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to save service");
      }
    }
  };

  const handleEditService = (service: Service) => {
    setIsEditing(true);
    setCurrentServiceId(service.ID);
    setFormData({
      name: service.Name,
      description: service.Description,
      duration: service.Duration,
      cost: service.Cost,
      buffer_time: service.BufferTime,
    });
    setIsModalOpen(true);
  };

  const handleDeleteService = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      console.log("Deleting service with token:", token);
      await axios.delete(`${BaseURL}/services/${id}`, {
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
        config: err.config
      });
      
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else if (err.response?.status === 403) {
        setError("You don't have permission to delete this service.");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to delete service");
      }
    }
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
      duration: "30m",
      cost: 0,
      buffer_time: "10m",
    });
  };

  const formatDuration = (duration: string | undefined) => {
    if (!duration) return "Not specified";
    return duration.replace("m", " minutes").replace("h", " hours");
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md py-4 fixed w-full z-50">
          <div className="container mx-auto px-6 flex justify-between items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold flex items-center text-gray-800">
                <span className="text-3xl mr-2">✨</span>
                <span className="bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">AppointEase</span>
              </h1>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/dashboard" className="font-medium text-gray-700 hover:text-pink-500 transition">Dashboard</Link>
              <Link to="/appointments" className="font-medium text-gray-700 hover:text-pink-500 transition">Appointments</Link>
              <Link to="/services" className="font-medium text-pink-500 transition">Services</Link>
              <Link to="/profile" className="font-medium text-gray-700 hover:text-pink-500 transition">Profile</Link>
              <button className="text-gray-700 hover:text-pink-500 transition">Logout</button>
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
                <Link to="/dashboard" className="text-gray-700 hover:text-pink-500 transition font-medium" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <Link to="/appointments" className="text-gray-700 hover:text-pink-500 transition font-medium" onClick={() => setMobileMenuOpen(false)}>Appointments</Link>
                <Link to="/services" className="text-pink-500 transition font-medium" onClick={() => setMobileMenuOpen(false)}>Services</Link>
                <Link to="/profile" className="text-gray-700 hover:text-pink-500 transition font-medium" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <button className="text-gray-700 hover:text-pink-500 transition font-medium text-left" onClick={() => setMobileMenuOpen(false)}>Logout</button>
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
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
                      <h3 className="text-xl font-semibold text-gray-800">{service.Name || "Unnamed Service"}</h3>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditService(service)}
                          className="p-1 hover:bg-gray-100 rounded-full transition"
                        >
                          <Edit size={18} className="text-gray-600" />
                        </button>
                        <button 
                          onClick={() => handleDeleteService(service.ID)}
                          className="p-1 hover:bg-gray-100 rounded-full transition"
                        >
                          <Trash size={18} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{service.Description || "No description provided"}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-700">
                        <Clock size={16} className="mr-2 text-pink-500" />
                        <span>{formatDuration(service.Duration)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <DollarSign size={16} className="mr-2 text-green-500" />
                        <span>${(service.Cost || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <ChevronRight size={16} className="mr-2 text-purple-500" />
                        <span>Buffer: {formatDuration(service.BufferTime)}</span>
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
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
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
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-2">Duration</label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="15m">15 minutes</option>
                      <option value="30m">30 minutes</option>
                      <option value="45m">45 minutes</option>
                      <option value="1h">1 hour</option>
                      <option value="1h30m">1.5 hours</option>
                      <option value="2h">2 hours</option>
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-2">Buffer Time</label>
                    <select
                      name="buffer_time"
                      value={formData.buffer_time}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="0m">No buffer</option>
                      <option value="5m">5 minutes</option>
                      <option value="10m">10 minutes</option>
                      <option value="15m">15 minutes</option>
                      <option value="30m">30 minutes</option>
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
                  />
                </div>
                
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-pink-400 to-purple-600 text-white rounded-lg hover:shadow-md transition"
                  >
                    {isEditing ? "Update Service" : "Add Service"}
                  </button>
                </div>
              </form>
            </div>
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