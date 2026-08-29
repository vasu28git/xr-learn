import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="bg-surface-container-lowest text-on-surface font-body-md min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(142, 213, 255, 0.12) 0%, transparent 60%)' }}></div>
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(142, 213, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(142, 213, 255, 0.15) 1px, transparent 1px)', backgroundSize: '45px 45px' }}></div>

      {/* Navigation */}
      <header className="relative z-10 bg-surface/85 backdrop-blur-md border-b border-outline-variant flex justify-between items-center w-full px-8 h-16 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="material-symbols-outlined text-primary text-xl">view_in_ar</span>
          </div>
          <span className="font-headline-md text-headline-sm font-bold text-primary tracking-tight">Multiverse 3D</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-on-surface-variant hover:text-on-surface font-code-sm text-xs uppercase tracking-wider transition-colors">
            Access System
          </Link>
          <Link to="/signup" className="bg-primary hover:bg-primary-fixed text-on-primary font-headline-sm text-xs py-2 px-4 rounded transition-colors flex items-center gap-1">
            <span>Register Alpha</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto px-6 py-20 flex flex-col items-center text-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/15 border border-primary/20 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary ai-orb"></span>
          <span className="font-code-sm text-[10px] text-primary tracking-wider uppercase">Interactive XR Simulator</span>
        </div>

        <h1 className="font-display-lg text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-tight max-w-3xl mb-6">
          Learn <span className="text-primary">Augmented & Virtual Reality</span> Directly in Your Browser
        </h1>

        <p className="font-body-md text-on-surface-variant max-w-xl mb-12 text-sm leading-relaxed">
          Master 3D spatial programming, vectors, and camera mechanics through hands-on coding. Work alongside a dedicated AI tutor that guides your debugging with progressive hints.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link to="/signup" className="bg-primary hover:bg-primary-fixed text-on-primary font-headline-sm text-sm py-3.5 px-8 rounded transition-all duration-200 flex items-center gap-2 shadow-lg shadow-primary/10">
            <span>Initialize Environment</span>
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
          </Link>
          <Link to="/login" className="border border-outline-variant hover:bg-surface-container-highest text-on-surface font-headline-sm text-sm py-3.5 px-8 rounded transition-colors">
            Access Dashboard
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="glass-panel p-6 rounded-xl hover:border-primary/40 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <span className="material-symbols-outlined text-primary text-3xl mb-4 block">code</span>
            <h3 className="font-headline-sm text-sm text-on-surface mb-2">Hands-on Sandbox</h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Write C#-like behavior scripts and execute them in a real-time web 3D workspace. No installation, just code and run.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl hover:border-secondary/40 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors"></div>
            <span className="material-symbols-outlined text-secondary text-3xl mb-4 block">smart_toy</span>
            <h3 className="font-headline-sm text-sm text-on-surface mb-2">AI Tutoring System</h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Stuck on vector math or rotation fixes? Our progress-tutor checks your active scene state and provides progressive conceptual hints.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl hover:border-tertiary/40 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl group-hover:bg-tertiary/10 transition-colors"></div>
            <span className="material-symbols-outlined text-tertiary text-3xl mb-4 block">3d_rotation</span>
            <h3 className="font-headline-sm text-sm text-on-surface mb-2">Zero Hardware Barriers</h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Test rotational transforms, spatial logic, and camera projection math directly in a high-fidelity WebGL simulator.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-outline-variant relative z-10">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-on-surface-variant gap-4">
          <p>© 2026 Multiverse 3D. Operational status optimal.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
            <a href="#" className="hover:text-primary transition-colors">Alpha Rules</a>
            <a href="#" className="hover:text-primary transition-colors">Console</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
