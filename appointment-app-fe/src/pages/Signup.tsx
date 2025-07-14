import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2, UserPlus, AlertCircle } from "lucide-react";
import { BaseURL } from "../configs/api";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(`${BaseURL}/auth/register`, {
        name: fullName,
        email,
        password,
        role_id: 2, // Service Provider role
      });

      console.log("Signup successful:", response.data);
      setMessage("Registration successful! Please check your email for OTP verification.");
      // Redirect to OTP verification page
      navigate(`/verify-registration-otp?email=${email}`);

    } catch (error: any) {
      console.error("Signup failed:", error.response?.data || error.message);
      setError(error.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="fixed w-full transition-all duration-300 z-50 bg-white shadow-md py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold flex items-center text-gray-800">
              <span className="text-3xl mr-2">✨</span>
              <span className="bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">AppointEase</span>
            </h1>
          </Link>
        </div>
      </header>

      <section className="pt-32 pb-20 bg-gradient-to-b from-purple-600 via-pink-500 to-pink-200">
        <div className="container mx-auto px-6 flex justify-center items-center">
          <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <UserPlus className="w-8 h-8 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Service Provider Registration</h2>
              <p className="text-gray-600">Create your business account</p>
            </div>

            {message && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isLoading}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isLoading}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isLoading}
                minLength={6}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isLoading}
              />
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This registration is for service providers only. 
                  Consumers should download our mobile app for booking appointments.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-400 to-purple-600 text-white py-2 rounded-xl hover:bg-opacity-80 transition duration-200 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Service Provider Account'
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-purple-600 font-medium hover:underline">
                  Login
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                For consumers, please download our mobile app
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Signup;