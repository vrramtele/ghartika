import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import FeaturedProducts from "@/components/FeaturedProducts";
import ComboSection from "@/components/ComboSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import RecipeSection from "@/components/RecipeSection";
import Reviews from "@/components/Reviews";
import InstagramSection from "@/components/InstagramSection";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <TrustBar />
      <FeaturedProducts />
      <ComboSection />
      <WhyChooseUs />
      <RecipeSection />
      <Reviews />
      <InstagramSection />
      <FAQ />
      <Newsletter />
    </main>
  );
}
