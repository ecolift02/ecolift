import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RideCard from "./RideCard";

const rides = [
  {
    id: 1,
    route: "Pune → Mumbai",
    time: "Tomorrow • 8:30 AM",
    price: 450,
    rating: "4.9",
    driver: "Rahul Sharma",
    vehicle: "Tesla Model 3",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    driverImage: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    route: "Mumbai → Nashik",
    time: "Friday • 10:00 AM",
    price: 380,
    rating: "5.0",
    driver: "Priya Patel",
    vehicle: "Hyundai Creta",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
    driverImage: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 3,
    route: "Pune → Goa",
    time: "Saturday • 7:00 AM",
    price: 1200,
    rating: "4.8",
    driver: "Amit Joshi",
    vehicle: "Kia Seltos",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
    driverImage: "https://randomuser.me/api/portraits/men/65.jpg",
  },
];

const FeaturedRides = () => {
  const sliderRef = useRef(null);

  const next = () => {
    sliderRef.current.scrollBy({
      left: 360,
      behavior: "smooth",
    });
  };

  const prev = () => {
    sliderRef.current.scrollBy({
      left: -360,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-bold">Featured Rides</h2>

            <p className="text-gray-500 mt-2">
              Popular rides from trusted drivers
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full border flex justify-center items-center hover:bg-gray-100"
            >
              <ChevronLeft />
            </button>

            <button
              onClick={next}
              className="w-12 h-12 rounded-full border flex justify-center items-center hover:bg-gray-100"
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar"
        >
          {rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedRides;
