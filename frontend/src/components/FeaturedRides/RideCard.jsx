import { Star, Car, MapPin, Clock } from "lucide-react";

const RideCard = ({ ride }) => {
  return (
    <div className="min-w-[340px] bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">
      {/* Image */}
      <img
        src={ride.image}
        alt={ride.route}
        className="w-full h-48 object-cover"
      />

      <div className="p-6">
        {/* Route */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{ride.route}</h3>

            <div className="flex items-center gap-2 mt-2 text-gray-500">
              <Clock size={16} />
              <span>{ride.time}</span>
            </div>
          </div>

          <span className="text-2xl font-bold text-green-700">
            ₹{ride.price}
          </span>
        </div>

        {/* Driver */}
        <div className="flex items-center gap-4 mt-6 border-t pt-5">
          <img
            src={ride.driverImage}
            alt={ride.driver}
            className="w-12 h-12 rounded-full object-cover"
          />

          <div className="flex-1">
            <h4 className="font-semibold">{ride.driver}</h4>

            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={16} fill="currentColor" />

              <span className="text-sm text-gray-700">{ride.rating}</span>
            </div>
          </div>

          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
            <Car size={16} className="inline mr-1" />
            {ride.vehicle}
          </div>
        </div>

        <button className="mt-6 w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl transition">
          View Details
        </button>
      </div>
    </div>
  );
};

export default RideCard;
