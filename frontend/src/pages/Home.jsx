import React, { useEffect, useState } from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import HeroSection from "../components/HeroSection";
//import CategoryCarousel from './CategoryCarousel';
import LatestJobs from "./job/LatestJobs";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [titleKeyword, setTitleKeyword] = useState("");
  const [location, setLocation] = useState("");
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === "recruiter") navigate("/recruiter/dashboard");
    else if (user && (user.role === "Owner" || user.role === "admin"))
      navigate("/admin/dashboard");
  }, [user]);

  return (
    <>
      <Navbar />
      <div className="bg-white">
        <HeroSection
          searchInfo={{
            titleKeyword,
            setTitleKeyword,
            location,
            setLocation,
          }}
        />
        {/* <CategoryCarousel/> */}
        <LatestJobs />
      </div>
      <Footer />
    </>
  );
};

export default Home;
