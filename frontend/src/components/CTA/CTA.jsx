import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="relative py-24 bg-green-700 text-white overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-96 h-96 bg-green-400 rounded-full blur-3xl top-10 left-10"></div>
        <div className="absolute w-96 h-96 bg-green-300 rounded-full blur-3xl bottom-10 right-10"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        {/* Heading */}
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Ready to lift the planet?
        </h2>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-green-100 mb-10 leading-7">
          Join thousands of EcoLifters who are saving money and reducing carbon
          emissions every single day through smarter shared travel.
        </p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button className="bg-white text-green-700 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2">
            Get Started Free
            <ArrowRight size={18} />
          </button>

          <button className="bg-green-800 border border-green-300 px-8 py-4 rounded-full font-semibold hover:bg-green-900 transition">
            List a Ride
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
