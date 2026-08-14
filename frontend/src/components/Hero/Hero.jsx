import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, CalendarDays, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import PassengerView from "../PassengerView/PassengerView";
import DriverView from "../DriverView/DriverView";
import heroGif from "../../assets/vid.gif";


const Hero = () => {
  const { currentMode, isAuthenticated } = useAuth();
  return (
    <section
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url(${heroGif})`,
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 w-full max-w-6xl px-6 py-12">
        <h1 className="text-5xl md:text-7xl font-bold text-white text-center mb-12">
          Travel Sustainably.
          <br />
          Together.
        </h1>
        {isAuthenticated &&
        (currentMode === "driver" || currentMode === "DRIVER") ? (
          <DriverView />
        ) : (
          <PassengerView />
        )}
      </div>
    </section>
  );
};

export default Hero;
