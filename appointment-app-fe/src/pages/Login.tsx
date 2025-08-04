import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2, AlertCircle, Smartphone } from "lucide-react";
import { BaseURL } from "../configs/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      console.log("Logging in with:", { email, password });
      console.log("BaseURL:", BaseURL);
      const response = await axios.post(`${BaseURL}/auth/login`, {
        email,
        password,
      });

      console.log("Login successful:", response.data);
      
      localStorage.setItem('token', response.data.token);
      
      // Check user role and redirect accordingly
      const roleId = response.data.user.role_id;
      if (roleId === 1) {
        navigate('/service-dashboard');
      }
      else if (roleId === 2) {
        // Service Provider
        navigate('/service-dashboard');
      } else if (roleId === 4) {
        // Receptionist
        navigate('/receptionist-dashboard');
      } else if (roleId === 3) {
        // Consumer - show app download message
        setError("Consumers should use our mobile app. Please download the app to book appointments.");
        localStorage.removeItem('token'); // Remove token since they shouldn't access web
        return;
      } else {
        setError("Invalid user role. Please contact support.");
        localStorage.removeItem('token');
        return;
      }
      
    } catch (error: any) {
      console.log(`${BaseURL}/auth/login`);
      console.error("Login failed:", error.response?.data || error.message);
      setError(error.response?.data?.error || "Login failed. Please check your credentials.");
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
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
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
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-400 to-purple-600 text-white py-2 rounded-xl hover:bg-opacity-80 transition duration-200 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center space-y-3">
              <Link 
                to="/forgot-password" 
                className="text-sm text-purple-600 hover:text-purple-800 transition block"
              >
                Forgot Password?
              </Link>
              
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-purple-600 font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            {/* Consumer App Download Notice */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <Smartphone className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="text-sm font-medium text-blue-800">For Consumers</h3>
              </div>
              <p className="text-xs text-blue-700">
                If you're a customer looking to book appointments, please download our mobile app for the best experience.
              </p>
              <div className="mt-2 flex space-x-2">
                <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                  Download iOS App
                </button>
                <button className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">
                  Download Android App
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;