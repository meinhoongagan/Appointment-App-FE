import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Loader2, Shield, CheckCircle, ArrowLeft } from "lucide-react";
import { BaseURL } from "../configs/api";

const VerifyRegistrationOTP = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  // const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Get email from URL params if available
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // Only allow single digit
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      (inputRefs[index + 1].current as HTMLInputElement | null)?.focus();
    }
    if (!value && index > 0) {
      (inputRefs[index - 1].current as HTMLInputElement | null)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      (inputRefs[index - 1].current as HTMLInputElement | null)?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");
    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      setError("Please enter the 4-digit OTP sent to your email.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.post(`${BaseURL}/auth/otp/verify/`, {
        email,
        otp: otpValue,
      });
      setMessage("Email verified successfully! You can now login.");
      setIsVerified(true);
      console.log("OTP verified:", response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to verify OTP. Please try again.");
      console.error("OTP verification failed:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError("");
    setMessage("");
    try {
      await axios.post(`${BaseURL}/auth/send-otp`, {
        email,
      });
      setMessage("OTP resent successfully! Please check your email.");
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to resend OTP. Please try again.");
      console.error("Resend OTP failed:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
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
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Successful!</h2>
              <p className="text-gray-600 mb-6">Your email has been verified. You can now login to your account.</p>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                <p className="text-sm text-green-700">You may now proceed to login.</p>
              </div>
              <Link to="/login" className="inline-block bg-gradient-to-r from-pink-400 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition">
                Go to Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
              <p className="text-gray-600">Enter the 4-digit code sent to your email</p>
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
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isLoading}
              />
              <div className="flex space-x-3 justify-center">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    disabled={isLoading}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-400 to-purple-600 text-white py-2 rounded-xl hover:bg-opacity-80 transition duration-200 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>
            </form>
            <div className="mt-6 text-center space-y-2">
              <button
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-sm text-gray-600 hover:text-gray-800 transition underline"
              >
                Didn't receive? Resend OTP
              </button>
              <div>
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
        </div>
      </section>
    </div>
  );
};

export default VerifyRegistrationOTP; 