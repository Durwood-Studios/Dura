import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Nav } from "@/components/splash/Nav";
import { Footer } from "@/components/splash/Footer";

const Hero = dynamic(() => import("@/components/splash/Hero").then((m) => m.Hero));
const PathSelector = dynamic(() =>
  import("@/components/splash/PathSelector").then((m) => m.PathSelector)
);
const PhaseGrid = dynamic(() => import("@/components/splash/PhaseGrid").then((m) => m.PhaseGrid));
const Features = dynamic(() => import("@/components/splash/Features").then((m) => m.Features));
const Standards = dynamic(() => import("@/components/splash/Standards").then((m) => m.Standards));
const CTA = dynamic(() => import("@/components/splash/CTA").then((m) => m.CTA));

export const metadata: Metadata = {
  title: "DURA — Engineering Education, Free Forever",
  description:
    "An open-source learning platform that takes you from absolute beginner to engineering leadership. 10 phases, 400+ lessons, offline-first.",
};

export default function Home(): React.ReactElement {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <PathSelector />
        <PhaseGrid />
        <Features />
        <Standards />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
