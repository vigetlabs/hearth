import Footer from "@/components/Signin/Footer";
import Home from "@/components/Signin/Home";
import Navbar from "@/components/Signin/Navbar";
import Product from "@/components/Signin/Product";
import VigetArticle from "@/components/Signin/VigetArticle";
import WhyHearth from "@/components/Signin/WhyHearth";

export default function SigninPage() {
  return (
    <div className="flex flex-1 flex-col bg-page">
      <Navbar />

      <Home />
      <Product />
      <WhyHearth />
      <VigetArticle />

      <Footer />
    </div>
  );
}
