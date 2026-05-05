"use client";

import { HeroSection } from "@/components/hero-section";
import { ProofCards } from "@/components/proof-cards";
import { WorkflowSteps } from "@/components/workflow-steps";
import { CTASection } from "@/components/cta-section";
import { LandingFooter } from "@/components/landing-footer";

export function HomePage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-background">
      <HeroSection />
      <ProofCards />
      <WorkflowSteps />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
