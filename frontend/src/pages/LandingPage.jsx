import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Sparkles, ArrowRight, Database, Calculator, ShieldCheck,
  Radar, FileText, Users, CalendarCheck, BarChart2,
  CheckCircle, Zap, Lock, Bell, ChevronDown
} from 'lucide-react';

const FEATURES = [
  { icon: Database,     title: 'Data Aggregation',     desc: 'Automatically collects attendance, leave, and overtime data for every employee each month.', color: '#6C63FF' },
  { icon: Calculator,   title: 'Smart Calculation',    desc: 'Computes HRA, LOP deductions, overtime pay, PF, and professional tax with zero manual effort.', color: '#00D4AA' },
  { icon: ShieldCheck,  title: 'Compliance Validation',desc: 'Validates every payroll record against minimum wage laws, PF caps, and statutory limits.', color: '#FFB547' },
  { icon: Radar,        title: 'Anomaly Detection',    desc: 'Flags unusual salary spikes, LOP patterns, and overtime anomalies before approval.', color: '#FF4365' },
  { icon: Sparkles,     title: 'AI Explanations',      desc: 'GPT-4o generates natural language salary summaries for every employee payslip.', color: '#9B5DFF' },
  { icon: FileText,     title: 'PDF Payslips',         desc: 'Beautifully styled payslips generated instantly and downloadable by employees anytime.', color: '#00D4AA' },
];

const NAV_LINKS = ['Features', 'How It Works'];

const STEPS = [
  { icon: Users,        step: '01', title: 'Add Employees',    desc: 'HR adds employees — credentials are auto-generated and emailed instantly.' },
  { icon: CalendarCheck,step: '02', title: 'Track Attendance', desc: 'Employees check in/out daily. Overtime is calculated automatically.' },
  { icon: Zap,          step: '03', title: 'Initiate Payroll', desc: 'One click runs all 5 AI agents — data, calculation, compliance, anomaly, explanation.' },
  { icon: CheckCircle, step: '04', title: 'Approve & Publish', desc: 'HR reviews flagged records, approves payroll, and payslips are instantly available.' },
];

const FadeIn = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F0F0FF] overflow-x-hidden">

      {/* Navbar */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(10,10,15,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(108,99,255,0.15)' : 'none',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6C63FF,#9B5DFF)' }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <span className="text-xl font-bold">PayFlow</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <button key={link} onClick={() => scrollTo(link.toLowerCase().replace(' ', '-'))}
              className="text-sm text-[#8888AA] hover:text-[#F0F0FF] transition-colors">
              {link}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')}
            className="text-sm text-[#8888AA] hover:text-[#F0F0FF] transition-colors hidden md:block">
            Sign In
          </button>
          <button onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg,#6C63FF,#9B5DFF)' }}>
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        {/* Background orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,212,170,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold leading-tight mb-6 max-w-4xl"
        >
          Payroll that{' '}
          <span style={{ background: 'linear-gradient(135deg,#6C63FF,#00D4AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            thinks for itself
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-[#8888AA] max-w-2xl mb-10 leading-relaxed"
        >
          PayFlow runs a 5-agent AI pipeline to calculate, validate, detect anomalies, and explain every payslip — automatically.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button onClick={() => navigate('/login')}
            className="px-8 py-4 rounded-xl text-white font-semibold text-base flex items-center gap-2 group"
            style={{ background: 'linear-gradient(135deg,#6C63FF,#9B5DFF)', boxShadow: '0 0 40px rgba(108,99,255,0.3)' }}>
            Sign In
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={() => scrollTo('how-it-works')}
            className="px-8 py-4 rounded-xl font-semibold text-base border text-[#8888AA] hover:text-[#F0F0FF] transition-colors flex items-center gap-2"
            style={{ borderColor: '#1E1E2E', background: 'rgba(26,26,36,0.6)' }}>
            See How It Works <ChevronDown size={16} />
          </button>
        </motion.div>

      </section>



      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-xs font-semibold text-[#6C63FF] uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything payroll needs</h2>
            <p className="text-[#8888AA] text-lg max-w-xl mx-auto">From data collection to PDF payslips — fully automated, fully compliant.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <FadeIn key={f.title} delay={i * 0.08}>
                  <div className="p-6 rounded-2xl border h-full group hover:border-[#6C63FF]/40 transition-all duration-300"
                    style={{ background: 'rgba(17,17,24,0.8)', borderColor: '#1E1E2E' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${f.color}18` }}>
                      <Icon size={22} style={{ color: f.color }} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                    <p className="text-[#8888AA] text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-xs font-semibold text-[#00D4AA] uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Payroll in 4 steps</h2>
            <p className="text-[#8888AA] text-lg max-w-xl mx-auto">From onboarding to payslip in minutes, not days.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <FadeIn key={step.step} delay={i * 0.1}>
                  <div className="flex gap-5 p-6 rounded-2xl border" style={{ background: 'rgba(17,17,24,0.8)', borderColor: '#1E1E2E' }}>
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(108,99,255,0.15)' }}>
                        <Icon size={22} style={{ color: '#6C63FF' }} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#6C63FF] mb-1">STEP {step.step}</div>
                      <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                      <p className="text-[#8888AA] text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl border relative overflow-hidden"
            style={{ borderColor: 'rgba(108,99,255,0.3)', background: 'rgba(108,99,255,0.06)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(108,99,255,0.12) 0%, transparent 70%)' }} />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Lock size={16} className="text-[#6C63FF]" />
                <Bell size={16} className="text-[#00D4AA]" />
                <BarChart2 size={16} className="text-[#FFB547]" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to automate payroll?</h2>
              <p className="text-[#8888AA] text-lg mb-8">Join teams using PayFlow to run accurate, compliant payroll with zero manual effort.</p>
              <button onClick={() => navigate('/login')}
                className="px-10 py-4 rounded-xl text-white font-semibold text-base inline-flex items-center gap-2 group"
                style={{ background: 'linear-gradient(135deg,#6C63FF,#9B5DFF)', boxShadow: '0 0 40px rgba(108,99,255,0.3)' }}>
                Get Started Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t text-center" style={{ borderColor: '#1E1E2E' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6C63FF,#9B5DFF)' }}>
            <Sparkles size={12} color="#fff" />
          </div>
          <span className="font-bold">PayFlow</span>
        </div>
        <p className="text-xs text-[#44445A]">Payroll Intelligence System · Built with React & Node.js</p>
      </footer>
    </div>
  );
};

export default LandingPage;
