import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { authRequest } from '@/lib/api';
import { toast } from 'sonner';
import { Eye, EyeOff, Activity } from 'lucide-react';

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, isAuthenticated } = useAuth();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [welcomeScreen, setWelcomeScreen] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');

  // Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');

  const handleSubmit = async (e, mode) => {
    e.preventDefault();
    setLoading(true);

    const payload = mode === 'login'
      ? { email: loginEmail, password: loginPass }
      : { name: signupName, email: signupEmail, password: signupPass };

    try {
      const data = await authRequest(mode, payload);
      const userName = data.name || 'User';

      // Show welcome screen
      setWelcomeName(userName);
      setWelcomeScreen(true);

      // After 2 seconds, close
      setTimeout(() => {
        const email = mode === 'login' ? loginEmail : signupEmail;
        login(userName, data.email || email, data.token);
        setWelcomeScreen(false);
        toast.success('Dashboard Ready!');
      }, 2000);
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showAuthModal} onOpenChange={(open) => { if (isAuthenticated) setShowAuthModal(open); }}>
      <DialogContent
        showCloseButton={isAuthenticated}
        className="sm:max-w-[480px] p-0 border-sage/25 overflow-hidden"
        style={{
          background: 'rgba(26, 58, 28, 0.95)',
          borderRadius: '24px',
          boxShadow: '0 40px 100px rgba(0, 0, 0, 0.5)',
        }}
        onInteractOutside={(e) => { if (!isAuthenticated) e.preventDefault(); }}
      >
        {welcomeScreen ? (
          <div className="flex flex-col items-center justify-center py-16 px-12 text-center">
            <Activity className="w-16 h-16 text-sage mb-5" style={{ animation: 'bounce-emoji 1s infinite alternate' }} />
            <h3 className="text-cream text-2xl font-[var(--font-display)] font-bold mb-2.5">Welcome, {welcomeName}!</h3>
            <p className="text-cream/50 text-base">Preparing your intelligent dashboard...</p>
            <div className="mt-8 w-9 h-9 border-3 border-sage/30 border-t-sage rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div className="p-12">
            <h2 className="font-[var(--font-display)] text-2xl font-bold text-cream text-center mb-6">
              Welcome to FitMind AI
            </h2>

            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="w-full bg-white/[0.04] rounded-xl p-1 mb-6">
                <TabsTrigger value="login" className="flex-1 rounded-lg py-2.5 text-sm font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-cream text-cream/50 transition-all">
                  Log In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex-1 rounded-lg py-2.5 text-sm font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-cream text-cream/50 transition-all">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <form onSubmit={(e) => handleSubmit(e, 'login')}>
                  <div className="flex flex-col gap-2 mb-4">
                    <Label className="text-cream/80 text-xs tracking-wider uppercase">Email Address</Label>
                    <Input type="email" placeholder="you@example.com" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="bg-white/[0.06] border-white/15 text-cream rounded-xl py-3.5" />
                  </div>
                  <div className="flex flex-col gap-2 mb-5">
                    <Label className="text-cream/80 text-xs tracking-wider uppercase">Password</Label>
                    <div className="relative">
                      <Input
                        type={showLoginPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        value={loginPass}
                        onChange={e => setLoginPass(e.target.value)}
                        className="bg-white/[0.06] border-white/15 text-cream rounded-xl py-3.5 pr-12 font-mono"
                      />
                      <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-0 text-cream/50 cursor-pointer hover:text-cream transition-colors">
                        {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full py-6 rounded-xl text-base bg-gradient-to-br from-forest-light to-sage hover:from-sage hover:to-forest-bright border-0 transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_var(--glow-green)] disabled:opacity-60">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" style={{ animation: 'spin 0.8s linear infinite' }} /> Authenticating...</>
                    ) : 'Continue to App'}
                  </Button>
                  <div className="mt-6 text-center text-sm text-cream/50">
                    Don't have an account?{' '}
                    <a onClick={() => setTab('signup')} className="text-sage-light cursor-pointer underline decoration-sage-light/30 hover:decoration-sage-light transition-all">Sign up here</a>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={(e) => handleSubmit(e, 'signup')}>
                  <div className="flex flex-col gap-2 mb-4">
                    <Label className="text-cream/80 text-xs tracking-wider uppercase">Full Name</Label>
                    <Input type="text" placeholder="John Doe" required value={signupName} onChange={e => setSignupName(e.target.value)} className="bg-white/[0.06] border-white/15 text-cream rounded-xl py-3.5" />
                  </div>
                  <div className="flex flex-col gap-2 mb-4">
                    <Label className="text-cream/80 text-xs tracking-wider uppercase">Email Address</Label>
                    <Input type="email" placeholder="you@example.com" required value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className="bg-white/[0.06] border-white/15 text-cream rounded-xl py-3.5" />
                  </div>
                  <div className="flex flex-col gap-2 mb-5">
                    <Label className="text-cream/80 text-xs tracking-wider uppercase">Password</Label>
                    <div className="relative">
                      <Input
                        type={showSignupPass ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        required
                        minLength={6}
                        value={signupPass}
                        onChange={e => setSignupPass(e.target.value)}
                        className="bg-white/[0.06] border-white/15 text-cream rounded-xl py-3.5 pr-12 font-mono"
                      />
                      <button type="button" onClick={() => setShowSignupPass(!showSignupPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-0 text-cream/50 cursor-pointer hover:text-cream transition-colors">
                        {showSignupPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full py-6 rounded-xl text-base bg-gradient-to-br from-forest-light to-sage hover:from-sage hover:to-forest-bright border-0 transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_var(--glow-green)] disabled:opacity-60">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" style={{ animation: 'spin 0.8s linear infinite' }} /> Creating account...</>
                    ) : 'Create Account'}
                  </Button>
                  <div className="mt-6 text-center text-sm text-cream/50">
                    Already have an account?{' '}
                    <a onClick={() => setTab('login')} className="text-sage-light cursor-pointer underline decoration-sage-light/30 hover:decoration-sage-light transition-all">Log in here</a>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
