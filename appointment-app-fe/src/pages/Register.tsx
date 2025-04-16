import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../configs/api"; // Adjust path as per your structure

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client"); // default to client

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const roleId = role === "provider" ? 2 : 3;

    try {
      const response = await axios.post(`${BaseURL}/auth/register`, {
        name: fullName,
        email,
        password,
        role_id: roleId,
      });

      console.log("Signup successful:", response.data);
      alert("Signup Successful");

      // Optionally redirect to login or dashboard
    } catch (error: any) {
      console.error("Signup failed:", error.response?.data || error.message);
      alert("Signup Failed: " + (error.response?.data?.message || "Unknown error"));
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
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign Up</h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="client"
                    checked={role === "client"}
                    onChange={() => setRole("client")}
                  />
                  <span>Consumer</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="provider"
                    checked={role === "provider"}
                    onChange={() => setRole("provider")}
                  />
                  <span>Service Provider</span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-400 to-purple-600 text-white py-2 rounded-xl hover:bg-opacity-80 transition duration-200"
              >
                Create Account
              </button>
            </form>
            <p className="text-sm text-center text-gray-600 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-gradient font-medium hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Signup;
