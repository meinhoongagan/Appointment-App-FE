import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { BaseURL } from "../configs/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(`${BaseURL}/auth/send-otp`, {
        email,
      });

      setMessage("OTP sent successfully! Please check your email.");
      console.log("OTP sent:", response.data);
      
      // Redirect to OTP verification page
      setTimeout(() => {
        window.location.href = `/verify-otp?email=${email}`;
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to send OTP. Please try again.");
      console.error("Send OTP failed:", error.response?.data || error.message);
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
                <Mail className="w-8 h-8 text-pink-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
              <p className="text-gray-600">Enter your email to receive a reset link</p>
            </div>

            {message && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSendOTP} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isLoading}
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-400 to-purple-600 text-white py-2 rounded-xl hover:bg-opacity-80 transition duration-200 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword; 