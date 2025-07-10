import { useState, useEffect } from "react";
import { 
  User, 
  Edit2, 
  Briefcase, 
  Save, 
  X, 
  Camera, 
  Settings, 
  Building,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { BaseURL } from "../../configs/api";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role?: {
    name: string;
  };
}

interface BusinessDetails {
  id?: number;
  provider_id: number;
  business_name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone_number: string;
  email: string;
  website: string;
  profile_picture_url: string;
  certificate_urls: string;
  business_hours: string;
  tax_number: string;
  business_license: string;
}

interface ProviderSettings {
  id?: number;
  provider_id: number;
  notifications_enabled: boolean;
  auto_confirm_bookings: boolean;
  advance_booking_days: number;
  currency: string;
  time_zone: string;
  language: string;
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState<"personal" | "business" | "settings">("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 0,
    name: "",
    email: "",
  });

  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    provider_id: 0,
    business_name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    phone_number: "",
    email: "",
    website: "",
    profile_picture_url: "",
    certificate_urls: "",
    business_hours: "",
    tax_number: "",
    business_license: "",
  });

  const [providerSettings, setProviderSettings] = useState<ProviderSettings>({
    provider_id: 0,
    notifications_enabled: true,
    auto_confirm_bookings: false,
    advance_booking_days: 30,
    currency: "USD",
    time_zone: "UTC",
    language: "en",
  });

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Fetch all profile data
  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch user profile
      const profileResponse = await fetch(`${BaseURL}/provider/profile`, {
        headers,
      });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData.profile);
      }

      // Fetch business details
      const businessResponse = await fetch(`${BaseURL}/provider/profile/business`, {
        headers,
      });
      if (businessResponse.ok) {
        const businessData = await businessResponse.json();
        setBusinessDetails(businessData.business_details);
      }

      // Fetch provider settings
      const settingsResponse = await fetch(`${BaseURL}/provider/profile/settings`, {
        headers,
      });
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setProviderSettings(settingsData.settings);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Handle save for different sections
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      let successMessage = "";

      if (activeTab === "personal") {
        // Update user profile
        const profileResponse = await fetch(`${BaseURL}/provider/profile`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            name: userProfile.name,
            email: userProfile.email,
          }),
        });

        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(errorData.error || "Failed to update profile");
        }

        successMessage = "Personal profile updated successfully";
      } else if (activeTab === "business") {
        // Update business details
        const businessResponse = await fetch(`${BaseURL}/provider/profile/business`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(businessDetails),
        });

        if (!businessResponse.ok) {
          const errorData = await businessResponse.json();
          throw new Error(errorData.error || "Failed to update business details");
        }

        successMessage = "Business details updated successfully";
      } else if (activeTab === "settings") {
        // Update provider settings
        const settingsResponse = await fetch(`${BaseURL}/provider/profile/settings`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(providerSettings),
        });

        if (!settingsResponse.ok) {
          const errorData = await settingsResponse.json();
          throw new Error(errorData.error || "Failed to update settings");
        }

        successMessage = "Settings updated successfully";
      }

      setSuccess(successMessage);
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("New passwords do not match");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BaseURL}/provider/profile/password`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update password");
      }

      setSuccess("Password updated successfully");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage your personal information, business details, and preferences
              </p>
            </div>
            <div className="flex space-x-3">
              {isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Profile Overview Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
                {isEditing && (
                  <button className="absolute -bottom-1 -right-1 h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{userProfile.name}</h2>
                <p className="text-indigo-100 mt-1 font-medium">{userProfile.email}</p>
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                    <Briefcase className="h-3 w-3 mr-1" />
                    Service Provider
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: "personal", label: "Personal Info", icon: User },
              { id: "business", label: "Business Details", icon: Building },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Personal Information Tab */}
          {activeTab === "personal" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-indigo-600" />
                  Personal Information
                </h3>
                <p className="text-sm text-gray-600 mt-1 font-medium">
                  Update your personal details and contact information
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{userProfile.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your email"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{userProfile.email}</p>
                    )}
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-bold text-gray-900 mb-4">Change Password</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="New password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handlePasswordChange}
                      disabled={saving || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Details Tab */}
          {activeTab === "business" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-indigo-600" />
                  Business Information
                </h3>
                <p className="text-sm text-gray-600 mt-1 font-medium">
                  Manage your business details and contact information
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Business Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={businessDetails.business_name}
                        onChange={(e) => setBusinessDetails({ ...businessDetails, business_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter business name"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{businessDetails.business_name || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Business Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={businessDetails.email}
                        onChange={(e) => setBusinessDetails({ ...businessDetails, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter business email"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{businessDetails.email || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={businessDetails.phone_number}
                        onChange={(e) => setBusinessDetails({ ...businessDetails, phone_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{businessDetails.phone_number || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Website
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={businessDetails.website}
                        onChange={(e) => setBusinessDetails({ ...businessDetails, website: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter website URL"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{businessDetails.website || "Not provided"}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={businessDetails.address}
                        onChange={(e) => setBusinessDetails({ ...businessDetails, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter business address"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{businessDetails.address || "Not provided"}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Business Description
                    </label>
                    {isEditing ? (
                      <textarea
                        value={businessDetails.description}
                        onChange={(e) => setBusinessDetails({ ...businessDetails, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Describe your business and services"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{businessDetails.description || "No description provided"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-indigo-600" />
                  Provider Settings
                </h3>
                <p className="text-sm text-gray-600 mt-1 font-medium">
                  Configure your appointment and notification preferences
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive email notifications for new appointments</p>
                    </div>
                    {isEditing ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={providerSettings.notifications_enabled}
                          onChange={(e) => setProviderSettings({ ...providerSettings, notifications_enabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        providerSettings.notifications_enabled 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {providerSettings.notifications_enabled ? "Enabled" : "Disabled"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Auto-Confirm Bookings</h4>
                      <p className="text-sm text-gray-500">Automatically confirm new appointment requests</p>
                    </div>
                    {isEditing ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={providerSettings.auto_confirm_bookings}
                          onChange={(e) => setProviderSettings({ ...providerSettings, auto_confirm_bookings: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        providerSettings.auto_confirm_bookings 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {providerSettings.auto_confirm_bookings ? "Enabled" : "Disabled"}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advance Booking Days
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={providerSettings.advance_booking_days}
                        onChange={(e) => setProviderSettings({ ...providerSettings, advance_booking_days: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        min="1"
                        max="365"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{providerSettings.advance_booking_days} days</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    {isEditing ? (
                      <select
                        value={providerSettings.currency}
                        onChange={(e) => setProviderSettings({ ...providerSettings, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD (C$)</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2">{providerSettings.currency}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;