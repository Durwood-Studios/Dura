import { Nav } from "@/components/splash/Nav";
import { Hero } from "@/components/splash/Hero";
import { PhaseGrid } from "@/components/splash/PhaseGrid";
import { Features } from "@/components/splash/Features";
import { Standards } from "@/components/splash/Standards";
import { CTA } from "@/components/splash/CTA";
import { Footer } from "@/components/splash/Footer";

export default function Home(): React.ReactElement {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <PhaseGrid />
        <Features />
        <Standards />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
