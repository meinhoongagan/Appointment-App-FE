import { useState, useEffect } from "react";
import { Search, Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BaseURL } from "../../configs/api";

interface Provider {
  id: number;
  name: string;
  location: string;
}

interface Service {
  id: number;
  name: string;
  provider: Provider;
  price?: number;
  description?: string;
  rating?: number;
  reviews?: number;
}

interface Category {
  id: string;
  name: string;
}

const FindServices = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Added loading state
  const navigate = useNavigate();

  const categories: Category[] = [
    { id: "all", name: "All" },
    { id: "1", name: "Hair" },
    { id: "2", name: "Spa" },
    { id: "3", name: "Massage" },
    { id: "4", name: "Nails" },
  ];

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true); // Set loading to true at the start
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Adjusted endpoint to /services (assuming /provider/services was a typo)
        let url = `${BaseURL}/provider/services?page=1&limit=10`;
        if (searchQuery) {
          url = `${BaseURL}/services/search?q=${encodeURIComponent(searchQuery)}`;
        } else if (selectedCategory !== "all") {
          url = `${BaseURL}/category/${selectedCategory}/services`;
        }

        console.log("Fetching services from:", url); // Debug: Log the URL
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`Failed to fetch services: ${response.statusText}`);
        const data = await response.json();
        console.log("API response:", data); // Debug: Log the raw response

        const fetchedServices = Array.isArray(data.services) ? data.services : data || [];
        if (!fetchedServices.length) {
          console.warn("No services found in response"); // Debug: Warn if no services
        }

        const enhancedServices: Service[] = await Promise.all(
          fetchedServices.map(async (service: any): Promise<Service> => {
            // Fetch provider details
            let providerData: any = {};
            try {
              const providerResponse = await fetch(`${BaseURL}/providers/${service.provider_id}`, { headers });
              providerData = providerResponse.ok ? await providerResponse.json() : {};
              console.log(`Provider data for service ${service.id}:`, providerData); // Debug
            } catch (err) {
              console.error(`Failed to fetch provider for service ${service.id}:`, err); // Debug
            }

            // Fetch review stats
            let reviewStats = { average_rating: 0, total_reviews: 0 };
            try {
              const reviewStatsResponse = await fetch(`${BaseURL}/services/${service.id}/review-stats`, { headers });
              reviewStats = reviewStatsResponse.ok ? await reviewStatsResponse.json() : reviewStats;
              console.log(`Review stats for service ${service.id}:`, reviewStats); // Debug
            } catch (err) {
              console.error(`Failed to fetch review stats for service ${service.id}:`, err); // Debug
            }

            return {
              id: service.id || 0,
              name: service.name || "Unknown Service",
              provider: {
                id: providerData.id || 0,
                name: providerData.business_details?.business_name || providerData.name || "Unknown Provider",
                location: providerData.business_details?.city || providerData.business_details?.address || "Unknown",
              },
              price: service.price || undefined,
              description: service.description || undefined,
              rating: reviewStats.average_rating || 0,
              reviews: reviewStats.total_reviews || 0,
            };
          })
        );

        console.log("Enhanced services:", enhancedServices); // Debug: Log final services
        setServices(enhancedServices);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching services:", err); // Debug: Log error
        setError(err.message || "An error occurred while fetching services");
      } finally {
        setLoading(false); // Set loading to false when done
      }
    };

    fetchServices();
  }, [searchQuery, selectedCategory]);

  const handleBookService = (providerId: number, serviceId: number) => {
    navigate(`/book/${providerId}/${serviceId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Services</h1>
        <p className="mt-1 text-sm text-gray-500">Discover and book services from our trusted providers</p>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {loading && (
        <div className="text-center text-gray-500">Loading services...</div>
      )}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  selectedCategory === category.id
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.length === 0 && !loading ? (
          <div className="col-span-full text-center text-gray-500">No services found.</div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1 text-sm text-gray-600">{service.rating?.toFixed(1) || "N/A"}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Provider:</span> {service.provider.name}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {service.provider.location}
                </div>
                {service.description && (
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">Description:</span> {service.description}
                  </div>
                )}
                {service.price && (
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">Price:</span> ${service.price.toFixed(2)}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">{service.reviews || 0} reviews</div>
                  <button
                    onClick={() => handleBookService(service.provider.id, service.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-purple-600 hover:from-pink-500 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FindServices;