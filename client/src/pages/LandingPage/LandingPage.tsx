import Footer from "@/components/Landing/Footer";
import Home from "@/components/Landing/Home/Home";
import Navbar from "@/components/Landing/Navbar";
import Outro from "@/components/Landing/VigetArticle/Outro";
import Product from "@/components/Landing/Product/Product";
import Slack from "@/components/Landing/WhyHearth/Slack";
import VigetArticle from "@/components/Landing/VigetArticle/VigetArticle";
import WhyHearth from "@/components/Landing/WhyHearth/WhyHearth";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col bg-page">
      <Navbar />

      <Home />
      <Product />
      <WhyHearth />
      <Slack />
      <VigetArticle />
      <Outro />

      <Footer />
    </div>
  );
}
