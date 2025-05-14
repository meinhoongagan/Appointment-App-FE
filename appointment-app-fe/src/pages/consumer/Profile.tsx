import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Edit2, Save, X } from "lucide-react";
import axios from "axios";
import { BaseURL } from "../../configs/api";

// Define interface for profile data
interface Profile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

const ConsumerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    id: 0,
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [originalProfile, setOriginalProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Retrieve token from localStorage
  const token = localStorage.getItem("token") || "";
  console.log("Token retrieved:", token || "No token found");

  // Fetch profile data when component mounts
  useEffect(() => {
    console.log("useEffect triggered with token:", token);
    const fetchProfile = async () => {
      console.log("fetchProfile called");
      try {
        setLoading(true);
        console.log("Making GET request to:", `${BaseURL}/auth/me`);
        const response = await axios.get(`${BaseURL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("GET /auth/me response:", response.data);
        const profileData: Profile = response.data;
        setProfile(profileData);
        setOriginalProfile(profileData);
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || "Failed to load profile";
        setError(errorMessage);
        console.error("Error fetching profile:", err);
        console.error("Error details:", errorMessage);
      } finally {
        setLoading(false);
        console.log("Loading state set to false");
      }
    };

    if (token) {
      console.log("Token exists, calling fetchProfile");
      fetchProfile();
    } else {
      setError("Please log in to view your profile");
      setLoading(false);
      console.log("No token, skipping API call");
    }
  }, [token]);

  const handleSave = async () => {
    console.log("handleSave called with profile:", profile);
    try {
      console.log("Making PATCH request to:", `${BaseURL}/auth/me`);
      console.log("PATCH payload:", {
        name: profile.name,
        email: profile.email,
        phone: profile.phone || null,
        address: profile.address || null,
      });
      const response = await axios.patch(
        `${BaseURL}/auth/me`,
        {
          name: profile.name,
          email: profile.email,
          phone: profile.phone || null,
          address: profile.address || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("PATCH /auth/me response:", response.data);
      setOriginalProfile(profile);
      setIsEditing(false);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to save profile";
      setError(errorMessage);
      console.error("Error saving profile:", err);
      console.error("Error details:", errorMessage);
    }
  };

  const handleCancel = () => {
    console.log("handleCancel called");
    if (originalProfile) {
      setProfile(originalProfile);
      console.log("Profile reset to:", originalProfile);
    }
    setIsEditing(false);
    setError(null);
  };

  console.log("Rendering with state - loading:", loading, "error:", error, "profile:", profile);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error && !isEditing) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => {
              console.log("Edit Profile button clicked");
              setIsEditing(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Error Message (shown during editing) */}
      {error && isEditing && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      {/* Profile Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-pink-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {profile.name ? profile.name.charAt(0) : "U"}
            </div>
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {profile.name || "User"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">Consumer</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                ) : (
                  profile.email || "Not provided"
                )}
              </dd>
            </div>
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Phone
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                ) : (
                  profile.phone || "Not provided"
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
                    value={profile.address || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                ) : (
                  profile.address || "Not provided"
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ConsumerProfile;