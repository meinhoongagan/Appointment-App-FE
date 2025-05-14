import { useState, useEffect } from "react";
import { Search, Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BaseURL } from "../../configs/api";

interface Service {
  id: number;
  name: string;
}

interface Provider {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  services: Service[];
  image: string;
}

interface Category {
  id: string;
  name: string;
}

const FindServices = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const categories: Category[] = [
    { id: "all", name: "All" },
    { id: "1", name: "Hair" },
    { id: "2", name: "Spa" },
    { id: "3", name: "Massage" },
    { id: "4", name: "Nails" },
  ];

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        let url = `${BaseURL}/providers?page=1&limit=10`;
        if (searchQuery) {
          url = `${BaseURL}/providers/search/service?q=${encodeURIComponent(searchQuery)}`;
        } else if (selectedCategory !== "all") {
          url = `${BaseURL}/category/${selectedCategory}`;
        }

        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error("Failed to fetch providers");
        const data = await response.json();
        const fetchedProviders = data.providers || [];

        const enhancedProviders: Provider[] = await Promise.all(
          fetchedProviders.map(async (provider: any): Promise<Provider> => {
            const servicesResponse = await fetch(`${BaseURL}/providers/${provider.id}/services`, { headers });
            const servicesData = servicesResponse.ok ? await servicesResponse.json() : [];
            const services: Service[] = servicesData.map((service: any) => ({
              id: service.id,
              name: service.name || "Unknown",
            }));

            const reviewStatsResponse = await fetch(`${BaseURL}/providers/${provider.id}/review-stats`, { headers });
            const reviewStats = reviewStatsResponse.ok
              ? await reviewStatsResponse.json()
              : { average_rating: 0, total_reviews: 0 };

            return {
              id: provider.id,
              name: provider.business_details?.business_name || provider.name,
              rating: reviewStats.average_rating || 0,
              reviews: reviewStats.total_reviews || 0,
              location: provider.business_details?.city || provider.business_details?.address || "Unknown",
              services,
              image: provider.business_details?.logo_url || "https://via.placeholder.com/150",
            };
          })
        );

        setProviders(enhancedProviders);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchProviders();
  }, [searchQuery, selectedCategory]);

  const handleBookService = (providerId: number, serviceId?: number) => {
    navigate(`/book/${providerId}${serviceId ? `/${serviceId}` : ""}`);
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
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search services or providers..."
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
        {providers.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">No providers found.</div>
        ) : (
          providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="h-48 w-full">
                <img src={provider.image} alt={provider.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1 text-sm text-gray-600">{provider.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {provider.location}
                </div>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {provider.services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleBookService(provider.id, service.id)}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                      >
                        {service.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">{provider.reviews} reviews</div>
                  <button
                    onClick={() => handleBookService(provider.id)}
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