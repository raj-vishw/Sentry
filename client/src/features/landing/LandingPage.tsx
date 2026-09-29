import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from './components/Hero';
import { StatsSection } from './components/StatsSection';
import { CategorySection } from './components/CategorySection';
import { FeatureSection } from './components/FeatureSection';
import { ChallengePreviewSection } from './components/ChallengePreviewSection';
import { LeaderboardPreviewSection } from './components/LeaderboardPreviewSection';
import { CTASection } from './components/CTASection';

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <PublicNavbar />
      <main>
        <Hero />
        <StatsSection />
        <CategorySection />
        <FeatureSection />
        <ChallengePreviewSection />
        <LeaderboardPreviewSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
