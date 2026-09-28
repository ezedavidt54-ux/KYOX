import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import IntelligenceOnboarding from '@/components/intelligence-onboarding';

export default async function IntelligenceOnboardingPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/intelligence');
  return <IntelligenceOnboarding />;
}
