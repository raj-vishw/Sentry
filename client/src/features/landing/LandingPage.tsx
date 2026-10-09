import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from './components/Hero';
import { FeatureSection } from './components/FeatureSection';
import { QuickstartSection } from './components/QuickstartSection';
import { DemoAndDocsSection } from './components/DemoAndDocsSection';
import { CTASection } from './components/CTASection';

export function LandingPage() {
  return (
    <div className="theme-public flex min-h-screen flex-col bg-black">
      <PublicNavbar />
      <main>
        <Hero />
        <FeatureSection />
        <QuickstartSection />
        <DemoAndDocsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
