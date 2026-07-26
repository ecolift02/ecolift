import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosConfig";

const RideDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [ride, setRide] = useState(location.state?.ride);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const rideId = location.state?.ride?.rideId;

  useEffect(() => {
    const loadRideDetails = async () => {
      if (!rideId) {
        return;
      }

      setLoadingDetails(true);
      try {
        const response = await api.get(`/rides/${rideId}`);
        setRide(response.data);
      } catch (error) {
        console.error("Failed to load ride details:", error);
      } finally {
        setLoadingDetails(false);
      }
    };

    loadRideDetails();
  }, [rideId]);

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Not Available";
    }
    const parsedDate = new Date(dateString);
    if (Number.isNaN(parsedDate.getTime())) {
      return "Not Available";
    }

    return parsedDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const availableSeatsLabel = loadingDetails
    ? "Loading..."
    : ride?.availableSeats ?? "N/A";

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    navigate("/booking", { state: { ride } });
  };

  if (!ride) {
    return (
      <>
        <Navbar />
        <main className="pt-20 bg-linear-to-b from-emerald-50 via-white to-gray-50 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-sm border border-emerald-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ride not found</h1>
            <p className="text-gray-600 mb-4">
              Please select a ride from the search results page.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
            >
              Back to Home
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-linear-to-b from-emerald-50 via-white to-gray-50 min-h-screen px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-[28px] bg-white p-8 shadow-[0_12px_40px_rgba(21,128,61,0.08)] border border-emerald-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green-700">
                Ride details
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {ride.departureLocationName} → {ride.arrivalLocationName}
              </h1>
            </div>
            <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-green-700">
              ₹{ride.pricePerSeat} per seat
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-gray-500">Driver</p>
              <p className="text-lg font-semibold text-gray-900">{ride.driverName}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-gray-500">Vehicle</p>
              <p className="text-lg font-semibold text-gray-900">{ride.vehicleModel}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-gray-500">Departure</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(ride.departureTime)}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-gray-500">Arrival</p>
              <p className="text-lg font-semibold text-gray-900">
                {loadingDetails ? "Loading details..." : formatDate(ride.arrivalTime)}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-gray-500">Journey</p>
              <p className="text-lg font-semibold text-gray-900">
                {ride.departureLocationName} to {ride.arrivalLocationName}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-gray-500">Available Seats</p>
              <p className="text-lg font-semibold text-gray-900">{availableSeatsLabel}</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-100 bg-green-50 p-5">
            {!isAuthenticated && (
              <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                Please login to continue with your booking.
              </div>
            )}

            <p className="text-sm text-gray-600">
              Ready to reserve this ride? Sign in to continue with your booking.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-2xl font-bold text-green-700">₹{ride.pricePerSeat}</p>
              </div>
              <button
                type="button"
                onClick={handleBook}
                className="rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
              >
                Book
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default RideDetails;
