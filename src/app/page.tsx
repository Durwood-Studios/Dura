import type { Metadata } from "next";
import { Nav } from "@/components/splash/Nav";
import { Hero } from "@/components/splash/Hero";

export const metadata: Metadata = {
  title: "DURA — Zero to CTO, Free Forever",
  description:
    "An open-source learning management system that takes you from absolute beginner to CTO-ready. 10 phases, 400+ lessons, offline-first.",
};
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
