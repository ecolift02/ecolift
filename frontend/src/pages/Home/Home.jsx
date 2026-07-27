import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import Stats from "../../components/Stats/Stats";
import FeaturedRides from "../../components/FeaturedRides/FeaturedRides";
import CTA from "../../components/CTA/CTA";
import Footer from "../../components/Footer/Footer";
const Home = () => {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Hero />
        <HowItWorks />
        <Stats />
        <FeaturedRides />
        <CTA />
      </main>
      <Footer />
    </>
  );
};

export default Home;
