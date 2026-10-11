import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { Footer } from '@/components/layout/Footer';
import { usePublicThemeClassName } from '@/stores/publicThemeStore';
import { Hero } from './components/Hero';
import { FeatureSection } from './components/FeatureSection';
import { QuickstartSection } from './components/QuickstartSection';
import { CTASection } from './components/CTASection';

export function LandingPage() {
  const themeClassName = usePublicThemeClassName();
  return (
    <div className={`${themeClassName} flex min-h-screen flex-col bg-[var(--color-bg)]`}>
      <PublicNavbar />
      <main>
        <Hero />
        <FeatureSection />
        <QuickstartSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
