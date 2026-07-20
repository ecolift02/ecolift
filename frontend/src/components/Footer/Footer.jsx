import { Globe, Mail, Share2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-green-700 mb-4">EcoLift</h2>

          <p className="text-gray-600 leading-7">
            Sustainable mobility for a greener planet. Join the movement and
            make every ride count.
          </p>

          <div className="flex gap-4 mt-6 text-gray-500">
            <Globe className="hover:text-green-700 cursor-pointer" />
            <Mail className="hover:text-green-700 cursor-pointer" />
            <Share2 className="hover:text-green-700 cursor-pointer" />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>

          <ul className="space-y-3 text-gray-600">
            <li className="hover:text-green-700 cursor-pointer">
              How it works
            </li>
            <li className="hover:text-green-700 cursor-pointer">Features</li>
            <li className="hover:text-green-700 cursor-pointer">Pricing</li>
            <li className="hover:text-green-700 cursor-pointer">Support</li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Legal</h3>

          <ul className="space-y-3 text-gray-600">
            <li className="hover:text-green-700 cursor-pointer">
              Privacy Policy
            </li>
            <li className="hover:text-green-700 cursor-pointer">
              Terms of Service
            </li>
            <li className="hover:text-green-700 cursor-pointer">Contact Us</li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Newsletter</h3>

          <p className="text-gray-600 mb-4">
            Get eco-travel updates and offers.
          </p>

          <div className="flex">
            <input
              type="email"
              placeholder="Enter email"
              className="w-full px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />

            <button className="bg-green-700 text-white px-4 rounded-r-lg hover:bg-green-800">
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t mt-12 py-6 text-center text-gray-500 text-sm">
        © 2026 EcoLift. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
