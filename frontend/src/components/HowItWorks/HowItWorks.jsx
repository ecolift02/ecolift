import { Search, CheckCircle, Leaf } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Find",
    description:
      "Browse verified drivers and eco-friendly routes that match your destination and schedule.",
    icon: Search,
  },
  {
    id: 2,
    title: "Book",
    description:
      "Reserve your seat instantly with transparent pricing and secure booking.",
    icon: CheckCircle,
  },
  {
    id: 3,
    title: "Go",
    description:
      "Meet your driver, enjoy the ride, and help reduce carbon emissions together.",
    icon: Leaf,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800">
            Your Journey Made Simple
          </h2>

          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            EcoLift connects passengers and drivers to make travel affordable,
            convenient, and environmentally friendly.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-10 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Icon className="text-green-700" size={40} />
                </div>

                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  {step.title}
                </h3>

                <p className="text-gray-600 leading-7">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
