import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import WhyChooseUs from "@/components/WhyChooseUs";
import Reviews from "@/components/Reviews";
import InstagramSection from "@/components/InstagramSection";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <FeaturedProducts />
      <WhyChooseUs />
      <Reviews />
      <InstagramSection />
      <FAQ />
      <Newsletter />
    </main>
  );
}
