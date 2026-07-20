const LoginHero = () => {
  return (
    <div className="hidden lg:flex w-1/2 relative bg-green-100 overflow-hidden">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1600&q=80"
        className="absolute inset-0 w-full h-full object-cover opacity-80"
        alt="EcoLift background"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-green-900/40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center px-16 text-white">
        <h1 className="text-4xl font-bold mb-6">
          Moving together for a greener world
        </h1>

        <p className="text-green-100 mb-10">
          Join thousands of users reducing carbon footprint through shared
          rides.
        </p>

        {/* Stats */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl flex items-center gap-4">
          <div className="flex -space-x-3">
            <img
              className="w-10 h-10 rounded-full border-2 border-white"
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt=""
            />

            <img
              className="w-10 h-10 rounded-full border-2 border-white"
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt=""
            />

            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-xs">
              +12k
            </div>
          </div>

          <div>
            <p className="font-semibold">New users this week</p>
            <p className="text-sm text-green-100">
              Growing sustainable community
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginHero;
