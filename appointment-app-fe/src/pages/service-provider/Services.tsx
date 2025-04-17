import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";

// Dummy data for services
const services = [
  {
    id: 1,
    name: "Haircut",
    duration: "30 mins",
    price: "$30",
    description: "Professional haircut service",
  },
  {
    id: 2,
    name: "Manicure",
    duration: "45 mins",
    price: "$25",
    description: "Basic manicure service",
  },
  {
    id: 3,
    name: "Massage",
    duration: "60 mins",
    price: "$60",
    description: "Full body massage",
  },
];

const Services = () => {
  const [isAddingService, setIsAddingService] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your service offerings
          </p>
        </div>
        <button
          onClick={() => setIsAddingService(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-purple-600 hover:from-pink-500 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Service
        </button>
      </div>

      {/* Services List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Your Services
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {services.map((service) => (
              <li key={service.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-600 flex items-center justify-center text-white">
                          {service.name.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {service.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.description}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      <div>{service.duration}</div>
                      <div>{service.price}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Services; 