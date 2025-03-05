import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import img4 from "../assets/img4.png";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import axios from "axios";
import { toast } from "react-hot-toast";
import { USER_API_END_POINT } from "@/utils/ApiEndPoint";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${USER_API_END_POINT}/forgot-password`,
        {
          email,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.log(`error in password sending link ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-row md:flex-row-reverse items-center bg-gradient-to-tl from-white to-blue-100 h-screen">
        {/* Left Side - Image */}
        <div className="hidden md:block w-full md:w-2/3">
          <img
            src={img4}
            alt=""
            className="w-full h-full object-cover opacity-70"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/3 p-8 flex flex-col space-y-4">
          <h1 className="text-3xl font-bold text-center">
            Lets<span className="text-blue-700">Hire</span>
          </h1>
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Forgot Password
          </h3>
          <p className="text-gray-600 text-center mb-4">
            Enter your email address below and we'll send you a link to reset
            your password.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
          <div className="text-center mt-6">
            <p
              className="text-blue-600 text-sm cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPassword;
