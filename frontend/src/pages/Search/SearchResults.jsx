import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDeparture = (dateString) => {
    const parsedDate = new Date(dateString);

    return Number.isNaN(parsedDate.getTime())
      ? "Unavailable"
      : parsedDate.toLocaleString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
  };

  useEffect(() => {
    const source = searchParams.get("from");
    const destination = searchParams.get("to");
    const date = searchParams.get("date");
    const seats = searchParams.get("seats") || "1";

    if (!source || !destination || !date) {
      setError("Please provide source, destination, and date.");
      setLoading(false);
      setRides([]);
      return;
    }

    const fetchRides = async () => {
      setLoading(true);
      setError("");
      setRides([]);

      try {
        const url = `http://localhost:8083/api/rides/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}T00:00:00&seats=${encodeURIComponent(seats)}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setRides(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load rides right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [searchParams]);

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-gradient-to-b from-emerald-50 via-white to-gray-50">
        <section className="px-4 py-10 md:py-14">
          <div className="mx-auto max-w-6xl rounded-[28px] bg-white shadow-[0_12px_40px_rgba(21,128,61,0.08)] border border-emerald-100 p-6 md:p-8">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green-700">
                  Search results
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Available Rides
                </h1>
                <p className="text-gray-600 mt-1">
                  Showing trips for your selected route.
                </p>
              </div>
              <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-green-700">
                Eco-friendly matches
              </div>
            </div>

            {loading && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6 text-center text-gray-700 shadow-sm">
                Loading rides...
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 text-red-600 p-4">
                {error}
              </div>
            )}

            {!loading && rides.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {rides.map((ride, index) => (
                  <div
                    key={`${ride.driverName}-${ride.departureTime}-${index}`}
                    className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                          Driver
                        </p>
                        <h2 className="text-xl font-bold text-gray-900">
                          {ride.driverName}
                        </h2>
                      </div>
                      <div className="rounded-full bg-green-700 px-3 py-1 text-sm font-bold text-white">
                        ₹{ride.pricePerSeat}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold">Vehicle:</span>{" "}
                        {ride.vehicleModel}
                      </p>
                      <p>
                        <span className="font-semibold">From:</span>{" "}
                        {ride.departureLocationName}
                      </p>
                      <p>
                        <span className="font-semibold">To:</span>{" "}
                        {ride.arrivalLocationName}
                      </p>
                      <p>
                        <span className="font-semibold">Departure:</span>{" "}
                        {formatDeparture(ride.departureTime)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/ride-details", { state: { ride } })}
                      className="mt-5 w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
                    >
                      Details
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && rides.length === 0 && (
              <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 text-gray-600 shadow-sm">
                No rides found for this route.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default SearchResults;
