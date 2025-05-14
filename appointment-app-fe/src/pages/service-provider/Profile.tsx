import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Edit2, Briefcase } from "lucide-react";
import { BaseURL } from "../../configs/api";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
  });
  const [businessDetails, setBusinessDetails] = useState({
    business_name: "",
    phone_number: "",
    address: "",
    description: "",
    email: "",
  });
  const [error, setError] = useState(null);

  // Fetch profile and business details on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // Adjust based on your auth setup
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Fetch User Profile
        const profileResponse = await fetch(`${BaseURL}/provider/profile`, {
          method: "GET",
          headers,
        });
        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile");
        }
        const profileData = await profileResponse.json();
        setUserProfile({
          name: profileData.profile.name,
          email: profileData.profile.email,
        });

        // Fetch Business Details
        const businessResponse = await fetch(`${BaseURL}/provider/profile/business`, {
          method: "GET",
          headers,
        });
        if (!businessResponse.ok) {
          throw new Error("Failed to fetch business details");
        }
        const businessData = await businessResponse.json();
        setBusinessDetails(businessData.business_details);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  // Handle save for both profile and business details
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token"); // Adjust based on your auth setup
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Update User Profile
      const profileResponse = await fetch(`${BaseURL}/provider/profile`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(userProfile),
      });
      if (!profileResponse.ok) {
        throw new Error("Failed to update profile");
      }
      const profileData = await profileResponse.json();
      setUserProfile({
        name: profileData.profile.name,
        email: profileData.profile.email,
      });

      // Update Business Details
      const businessResponse = await fetch(`${BaseURL}/provider/profile/business`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(businessDetails),
      });
      if (!businessResponse.ok) {
        throw new Error("Failed to update business details");
      }
      const businessData = await businessResponse.json();
      setBusinessDetails(businessData.business_details);

      setIsEditing(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal and business information
          </p>
        </div>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-purple-600 hover:from-pink-500 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Edit2 className="h-5 w-5 mr-2" />
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>
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

      {/* Personal Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-pink-400 to-purple-600 flex items-center justify-center text-white text-2xl">
              {userProfile.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {userProfile.name}
              </h3>
              <p className="text-sm text-gray-500">Service Provider</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) =>
                      setUserProfile({ ...userProfile, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  userProfile.name
                )}
              </dd>
            </div>
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="email"
                    value={userProfile.email}
                    onChange={(e) =>
                      setUserProfile({ ...userProfile, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  userProfile.email
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Business Details */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Business Details</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage your business information
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                Business Name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={businessDetails.business_name}
                    onChange={(e) =>
                      setBusinessDetails({
                        ...businessDetails,
                        business_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  businessDetails.business_name
                )}
              </dd>
            </div>
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Business Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="email"
                    value={businessDetails.email}
                    onChange={(e) =>
                      setBusinessDetails({
                        ...businessDetails,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  businessDetails.email
                )}
              </dd>
            </div>
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Phone Number
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="tel"
                    value={businessDetails.phone_number}
                    onChange={(e) =>
                      setBusinessDetails({
                        ...businessDetails,
                        phone_number: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  businessDetails.phone_number
                )}
              </dd>
            </div>
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={businessDetails.address}
                    onChange={(e) =>
                      setBusinessDetails({
                        ...businessDetails,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  businessDetails.address
                )}
              </dd>
            </div>
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Description
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <textarea
                    value={businessDetails.description}
                    onChange={(e) =>
                      setBusinessDetails({
                        ...businessDetails,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                ) : (
                  businessDetails.description
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Placeholder for Provider Settings */}
      {/* Uncomment and implement if needed
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Provider Settings</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage your provider settings
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Notifications
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={providerSettings.notifications_enabled}
                    onChange={(e) =>
                      setProviderSettings({
                        ...providerSettings,
                        notifications_enabled: e.target.checked,
                      })
                    }
                  />
                ) : (
                  providerSettings.notifications_enabled ? "Enabled" : "Disabled"
                )}
              </dd>
            </div>
            <!-- Add more settings fields as needed -->
          </dl>
        </div>
      </div>
      */}

      {/* Placeholder for Working Hours and Time Off */}
      {/* Uncomment and implement if needed
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage your working hours and time off
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Working Hours
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <!-- Implement working hours display/edit -->
              </dd>
            </div>
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Time Off
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <!-- Implement time off display/edit -->
              </dd>
            </div>
          </dl>
        </div>
      </div>
      */}
    </div>
  );
};

export default Profile;