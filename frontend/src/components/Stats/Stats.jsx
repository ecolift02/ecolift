import { CloudOff, Trees, Users } from "lucide-react";

const Stats = () => {
  return (
    <section className="py-24 bg-green-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Big Card */}
          <div className="lg:col-span-4 bg-green-700 text-white rounded-3xl p-10 relative overflow-hidden flex flex-col justify-end">
            <CloudOff size={90} className="absolute top-8 right-8 opacity-20" />

            <h2 className="text-5xl font-bold">12,450</h2>

            <h3 className="text-2xl font-semibold mt-2">Tons of CO₂ Saved</h3>

            <p className="mt-6 text-green-100 leading-7">
              Every shared ride helps reduce greenhouse gas emissions. Together,
              EcoLift users have already prevented thousands of tons of carbon
              dioxide from entering the atmosphere.
            </p>
          </div>

          {/* Right Side */}
          <div className="lg:col-span-8 grid md:grid-cols-2 gap-6">
            {/* Trees Card */}
            <div className="bg-white rounded-3xl shadow-md p-8 hover:shadow-xl transition">
              <div className="w-16 h-16 rounded-xl bg-green-100 flex items-center justify-center mb-6">
                <Trees size={32} className="text-green-700" />
              </div>

              <h2 className="text-4xl font-bold">85,000+</h2>

              <h3 className="text-xl font-semibold mt-2 text-green-700">
                Trees Saved
              </h3>

              <p className="text-gray-600 mt-4 leading-7">
                EcoLift promotes ride sharing, reducing fuel consumption and
                supporting environmental conservation initiatives.
              </p>
            </div>

            {/* Users Card */}
            <div className="bg-white rounded-3xl shadow-md p-8 hover:shadow-xl transition">
              <div className="w-16 h-16 rounded-xl bg-green-100 flex items-center justify-center mb-6">
                <Users size={32} className="text-green-700" />
              </div>

              <h2 className="text-4xl font-bold">250K+</h2>

              <h3 className="text-xl font-semibold mt-2 text-green-700">
                Active EcoLifters
              </h3>

              <p className="text-gray-600 mt-4 leading-7">
                Thousands of drivers and passengers use EcoLift every day to
                travel safely, economically, and sustainably.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
