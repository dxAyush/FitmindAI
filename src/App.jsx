import { AuthProvider } from '@/hooks/useAuth';
import ThreeBackground from '@/components/background/ThreeBackground';
import SideNav from '@/components/layout/SideNav';
import MobileNav from '@/components/layout/MobileNav';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import BMISection from '@/components/sections/BMISection';
import DietSection from '@/components/sections/DietSection';
import WorkoutSection from '@/components/sections/WorkoutSection';
import FormAnalysisSection from '@/components/sections/FormAnalysisSection';
import ChatSection from '@/components/sections/ChatSection';
import ProgressSection from '@/components/sections/ProgressSection';
import AuthModal from '@/components/auth/AuthModal';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen relative">
        {/* 3D Background */}
        <ThreeBackground />

        {/* Navigation */}
        <SideNav />
        <MobileNav />

        {/* Main Content */}
        <main className="md:pl-[70px] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <HeroSection />
          <BMISection />
          <DietSection />
          <FormAnalysisSection />
          <WorkoutSection />
          <ChatSection />
          <ProgressSection />
          <Footer />
        </main>

        {/* Auth Modal */}
        <AuthModal />

        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(26, 58, 28, 0.95)',
              border: '1px solid rgba(122, 173, 110, 0.3)',
              color: '#f5f0e8',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}
