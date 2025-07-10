import { useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../configs/api";
import { 
  Calendar, 
  Clock, 
  ChevronRight, 
  X, 
  Plus, 
  Trash, 
  Edit, 
  DollarSign, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Star,
  Users,
  TrendingUp
} from "lucide-react";
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
  };
}

// Define form data interface
interface ServiceFormData {
  name: string;
  description: string;
  duration: number; // Duration in minutes
  cost: number;
  buffer_time: number; // Buffer time in minutes
}

// Toast notification interface
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    duration: 30, // 30 minutes
    cost: 0,
    buffer_time: 10, // 10 minutes
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState<number | null>(null);
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  const user = JSON.parse(localStorage.getItem("user") || '{}');
  const isReceptionist = user?.role_id === 4;

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Filter services based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredServices(services);
    } else {
      const filtered = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  }, [searchTerm, services]);

  // Add toast notification
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
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

      // Validate and filter services
      const validServices = response.data.filter((service: any): service is Service => {
        if (!service || typeof service.ID !== "number" || isNaN(service.ID)) {
          console.warn("Invalid service detected:", service);
          return false;
        }
        return true;
      });

      setServices(validServices);
      addToast('success', `Successfully loaded ${validServices.length} services`);
    } catch (err: any) {
      console.error("Error in fetchServices:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError("You don't have permission to access this resource.");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to load services");
      }
      addToast('error', err.response?.data?.error || err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "cost" ? parseFloat(value) || 0 : 
              name === "duration" || name === "buffer_time" ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Service name is required");
      setSubmitting(false);
      return;
    }
    if (formData.cost < 0) {
      setError("Cost cannot be negative");
      setSubmitting(false);
      return;
    }
    if (formData.duration <= 0) {
      setError("Duration must be greater than 0");
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      // Convert minutes to nanoseconds for API
      const apiData = {
        ...formData,
        duration: formData.duration * 60 * 1000000000, // Convert minutes to nanoseconds
        buffer_time: formData.buffer_time * 60 * 1000000000, // Convert minutes to nanoseconds
      };

      if (isEditing && currentServiceId != null && !isNaN(currentServiceId)) {
        await axios.patch(
          `${BaseURL}/provider/services/${currentServiceId}`,
          apiData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        addToast('success', 'Service updated successfully');
      } else if (!isEditing) {
        await axios.post(
          `${BaseURL}/provider/services`,
          apiData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        addToast('success', 'Service created successfully');
      } else {
        throw new Error("Invalid service ID for update");
      }
      
      await fetchServices();
      closeModal();
    } catch (err: any) {
      console.error("Error in handleSubmit:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError("You don't have permission to perform this action.");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to save service");
      }
      addToast('error', err.response?.data?.error || err.message || "Failed to save service");
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
      duration: Math.floor(service.duration / (60 * 1000000000)), // Convert nanoseconds to minutes
      cost: service.cost,
      buffer_time: Math.floor(service.buffer_time / (60 * 1000000000)), // Convert nanoseconds to minutes
    });
    setIsModalOpen(true);
  };

  const handleDeleteService = async (id: number) => {
    if (typeof id !== "number" || isNaN(id)) {
      console.error("Invalid service ID for deletion:", id);
      setError("Cannot delete service: Invalid service ID");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
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
      
      addToast('success', 'Service deleted successfully');
      await fetchServices();
    } catch (err: any) {
      console.error("Error in handleDeleteService:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError("You don't have permission to delete this service.");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to delete service");
      }
      addToast('error', err.response?.data?.error || err.message || "Failed to delete service");
    } finally {
      setDeleting(false);
    }
  };

  // const handleLogout = () => {
  //   localStorage.removeItem('token');
  //   navigate('/login');
  // };

  const openModal = () => {
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentServiceId(null);
    setError(null);
    setFormData({
      name: "",
      description: "",
      duration: 30,
      cost: 0,
      buffer_time: 10,
    });
  };

  const formatDuration = (nanoseconds: number | undefined) => {
    if (!nanoseconds) return "Not specified";
    const minutes = Math.floor(nanoseconds / (60 * 1000000000));
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    let result = `${hours}h`;
    if (remainingMinutes > 0) {
      result += ` ${remainingMinutes}m`;
    }
    return result;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
                toast.type === 'success' 
                  ? 'bg-green-500 text-white' 
                  : toast.type === 'error' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-blue-500 text-white'
              }`}
            >
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
              {toast.type === 'info' && <AlertCircle className="w-5 h-5 mr-2" />}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          ))}
        </div>

        {/* Header - Commented out as it's handled by the layout */}

        {/* Main Content */}
        <main className="flex-grow pt-5 pb-20">
          <div className="container mx-auto px-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">My Services</h2>
                  <p className="text-gray-600">Manage and organize the services you offer to your clients</p>
                </div>
                {!isReceptionist && (
                  <button
                    onClick={openModal}
                    className="mt-4 md:mt-0 bg-gradient-to-r from-pink-400 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Plus size={20} className="mr-2" />
                    Add New Service
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-pink-500">
                <div className="flex items-center">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Star className="w-6 h-6 text-pink-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Services</p>
                    <p className="text-2xl font-bold text-gray-900">{services.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Services</p>
                    <p className="text-2xl font-bold text-gray-900">{services.filter(s => !s.DeletedAt).length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${services.length > 0 ? (services.reduce((sum, s) => sum + s.cost, 0) / services.length).toFixed(0) : '0'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${services.reduce((sum, s) => sum + s.cost, 0).toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p>{error}</p>
              </div>
            )}

            {/* Services List */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
                  <p className="text-gray-600">Loading your services...</p>
                </div>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar size={48} className="text-pink-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No Services Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchTerm ? "No services match your search criteria." : "Start by adding your first service to offer to your clients."}
                </p>
                {!searchTerm && !isReceptionist && (
                  <button
                    onClick={openModal}
                    className="bg-gradient-to-r from-pink-400 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Create Your First Service
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <div key={service.ID} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-800 line-clamp-2">{service.name || "Unnamed Service"}</h3>
                        <div className="flex space-x-2 ml-4">
                          {!isReceptionist && (
                            <>
                              <button
                                onClick={() => handleEditService(service)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={deleting}
                                title="Edit service"
                              >
                                <Edit size={16} className="text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteService(service.ID)}
                                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                disabled={deleting}
                                title="Delete service"
                              >
                                <Trash size={16} className="text-red-500" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-6 line-clamp-3 min-h-[4.5rem]">
                        {service.description || "No description provided"}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-700">
                            <Clock size={16} className="mr-2 text-pink-500" />
                            <span className="text-sm font-medium">Duration</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{formatDuration(service.duration)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-700">
                            <DollarSign size={16} className="mr-2 text-green-500" />
                            <span className="text-sm font-medium">Price</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">${(service.cost || 0).toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-700">
                            <ChevronRight size={16} className="mr-2 text-purple-500" />
                            <span className="text-sm font-medium">Buffer</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{formatDuration(service.buffer_time)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Created: {formatDate(service.CreatedAt)}
                        </p>
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
            <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {isEditing ? "Edit Service" : "Add New Service"}
                </h3>
                <button 
                  onClick={closeModal} 
                  className="text-gray-500 hover:text-gray-700 transition-colors" 
                  disabled={submitting}
                >
                  <X size={24} />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <p>{error}</p>
                </div>
              )}

              {!isReceptionist && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Service Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                      required
                      placeholder="e.g. Haircut, Consultation, Training Session"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                      rows={4}
                      placeholder="Describe what this service includes, what clients can expect, and any important details..."
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Duration *</label>
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                        disabled={submitting}
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                        <option value="180">3 hours</option>
                        <option value="240">4 hours</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Buffer Time</label>
                      <select
                        name="buffer_time"
                        value={formData.buffer_time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
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
                    <label className="block text-gray-700 font-semibold mb-2">Price ($) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                        required
                        placeholder="0.00"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-pink-400 to-purple-600 text-white rounded-lg hover:shadow-md transition-all duration-200 flex items-center font-medium"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          {isEditing ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        isEditing ? "Update Service" : "Create Service"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Deleting Overlay */}
        {deleting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">Deleting service...</p>
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

export default Services;