import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/button';
import { ArrowRight, Lightbulb, Sparkles, Users, Handshake, Network, Activity } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#fff8f1] text-[#1f1b12] font-sans selection:bg-[#b45309]/30 selection:text-[#903f00]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden px-8 pt-20">
        {/* Abstract Shapes Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[10%] right-[-5%] w-[600px] h-[600px] bg-[#b45309]/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[5%] left-[-10%] w-[500px] h-[500px] bg-[#0072c0]/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#903f00] uppercase mb-6 block">The Digital Atelier</span>
            <h1 className="font-headline text-6xl md:text-7xl font-extrabold text-[#1f1b12] tracking-tighter leading-[1.1] mb-6">
              Build Your <br/><span className="text-[#903f00]">Startup.</span> Together.
            </h1>
            <p className="text-lg text-[#564338] max-w-md mb-10 leading-relaxed">
              Turn your ideas into real startups with AI validation and the right team. We bridge the gap between vision and execution.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={user ? "/create-idea" : "/login"}>
                <Button className="h-14 px-10 bg-gradient-to-br from-[#903f00] to-[#b45309] text-white rounded-2xl font-bold shadow-lg shadow-[#903f00]/20 hover:scale-105 transition-transform active:scale-95">
                  Start Building
                </Button>
              </Link>
              <Link to="/hub">
                <Button variant="ghost" className="h-14 px-10 bg-[#f6edde] text-[#1f1b12] rounded-2xl font-bold hover:bg-[#eae1d3] transition-all active:scale-95">
                  Explore Ideas
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="aspect-square w-full rounded-3xl overflow-hidden shadow-2xl relative group">
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpwAabPeEVN74qFJmADe0NT-AYQFOLnbjocG9jg1mKD15fxuWACoQJYG8x8BQ3iaUal2RFqpEhn8xqlO40Zj-xMcb3IpK07bMwFJHTlUvO5RcOD2_29ntqGEXrUMnI5ysN0YCmVaNlK1xBwnCLL1DQNkqfCfpS9HoqxvYil_DFPUPQjHv-iHQ66feCjaBB_iCqPpBptHkyfffc2Vncd8JoLAj6Rdra-vWav5A5_1JeB-YkOEBM_M_qXXCzC9iV0_fYcy8rbjK2y4c"
                alt="Modern collaborative workspace"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#903f00]/20 to-transparent"></div>
              
              {/* Floating AI Chip */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-8 right-8 bg-white/70 backdrop-blur-2xl px-6 py-3 rounded-full flex items-center gap-3 shadow-xl border border-white/20"
              >
                <Sparkles className="w-5 h-5 text-[#903f00]" />
                <span className="font-mono text-[10px] font-bold text-[#1f1b12] uppercase tracking-wider">AI Validated Success</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#fcf3e3] py-24 px-8 border-y border-[#b45309]/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { value: "120+", label: "Ideas Created" },
              { value: "75+", label: "Founders Joined" },
              { value: "30+", label: "Teams Formed" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-headline text-5xl font-extrabold text-[#903f00] mb-3">{stat.value}</div>
                <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#564338] uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-32 px-8 bg-[#fff8f1]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-[#1f1b12] mb-4">Crafted for Excellence</h2>
            <p className="text-[#564338] max-w-lg mx-auto">Tools designed to take you from initial spark to a market-ready venture.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[650px]">
            {/* Large Card: Idea Creation */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-8 bg-[#f6edde] rounded-3xl p-10 flex flex-col justify-between overflow-hidden relative group shadow-sm border border-[#111111]/5"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-[#903f00]/10 rounded-2xl flex items-center justify-center text-[#903f00] mb-6">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="font-headline text-3xl font-bold mb-4">Idea Creation</h3>
                <p className="text-[#564338] max-w-xs leading-relaxed">Shape your vision with structured frameworks designed by world-class serial founders.</p>
              </div>
              <div className="absolute right-0 bottom-0 w-2/3 h-2/3 translate-x-8 translate-y-8 transition-transform duration-500 group-hover:translate-x-4 group-hover:translate-y-4">
                <img 
                  className="w-full h-full object-cover rounded-tl-3xl shadow-2xl" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSSLafTzI3ZMZ_d-wPimcwEHc3mFYe5T8eL7V42TfmtaoSrmbtIld6WamOPSlQuEub6QSmdnAIy0vXV8WWCL45gOs1f_BZx0Z5IK06YPe32NecDuRNaoluvRPrcCp-iFS4tKFNFb23q0CbPL-jROKp50LT_CuI2SDKBBFHnDoFjL7I5u-rm0Otvve_CpGL9ybKzNQbo6XwYIC3pmNGWIXsX_ofYHkMwAB_IcoSMj1wpZ72ITuQKKytOl-sRZ8iayT6BJmsiLafzr8"
                  alt="Minimalist design workspace"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>

            {/* AI Validation Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-4 bg-[#903f00] text-white rounded-3xl p-10 flex flex-col justify-end shadow-xl"
            >
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-headline text-2xl font-bold mb-4">AI Validation</h3>
              <p className="text-white/80 leading-relaxed">Instant market analysis and feasibility scores powered by our proprietary founder-LLM.</p>
            </motion.div>

            {/* Find Co-Founders Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-4 bg-[#eae1d3] rounded-3xl p-10 shadow-sm border border-[#111111]/5"
            >
              <div className="w-12 h-12 bg-[#903f00]/10 rounded-2xl flex items-center justify-center text-[#903f00] mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-2xl font-bold mb-4">Find Co-Founders</h3>
              <p className="text-[#564338] leading-relaxed">Network with vetted talent who share your obsession and complementary skills.</p>
            </motion.div>

            {/* Build Together Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-8 bg-[#111111] text-white rounded-3xl p-10 flex items-center justify-between shadow-xl overflow-hidden relative"
            >
              <div className="max-w-md relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <Handshake className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-headline text-2xl font-bold mb-4">Build Together</h3>
                <p className="text-white/50 leading-relaxed">Shared equity management, roadmaps, and collaborative workspaces out of the box.</p>
              </div>
              <div className="hidden md:block opacity-5 absolute right-[-20px] top-[-20px]">
                <Logo showText={false} className="scale-[5]" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-8 bg-[#fcf3e3] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#903f00] uppercase mb-6 block">The Journey</span>
              <h2 className="font-headline text-5xl md:text-6xl font-bold text-[#1f1b12] tracking-tighter leading-tight mb-12">How We Build <br/>The Future.</h2>
              
              <div className="space-y-12">
                {[
                  { num: "01", title: "Create Idea", desc: "Input your core concept and let our atelier tools refine your value proposition." },
                  { num: "02", title: "Validate", desc: "Get real-time feedback from AI-driven personas representing your target market." },
                  { num: "03", title: "Find Team", desc: "Match with technical, product, or growth partners whose profiles fit your needs." },
                  { num: "04", title: "Build Startup", desc: "Launch your MVP with shared resources and our global founder network." },
                ].map((step, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-8 group"
                  >
                    <span className="font-headline text-4xl font-black text-[#903f00]/20 group-hover:text-[#903f00] transition-colors">{step.num}</span>
                    <div>
                      <h4 className="font-headline text-xl font-bold mb-2">{step.title}</h4>
                      <p className="text-[#564338] leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative flex items-center justify-center"
            >
              <div className="w-full aspect-[4/5] bg-white rounded-3xl shadow-2xl overflow-hidden p-8 border border-[#ddc1b3]/20">
                <div className="w-full h-full rounded-2xl bg-[#fcf3e3]/50 p-8 flex flex-col gap-6">
                  <div className="h-8 w-1/3 bg-[#903f00]/10 rounded-full"></div>
                  <div className="h-4 w-full bg-[#ddc1b3]/20 rounded-full"></div>
                  <div className="h-4 w-5/6 bg-[#ddc1b3]/20 rounded-full"></div>
                  <div className="h-4 w-4/6 bg-[#ddc1b3]/20 rounded-full"></div>
                  <div className="mt-auto h-56 w-full bg-[#f6edde] rounded-2xl flex items-center justify-center border border-[#111111]/5">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <div className="w-16 h-16 bg-[#903f00] rounded-full"></div>
                      <div className="w-32 h-4 bg-[#903f00] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#903f00]/10 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8 bg-[#fff8f1]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-[#111111] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#903f00]/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#0072c0]/10 rounded-full blur-[80px]"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="font-headline text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter">Ready to Forge Your Legacy?</h2>
            <p className="text-white/50 max-w-xl mx-auto mb-12 text-lg">Join a community of thousands of founders who are already building the companies of tomorrow.</p>
            <Link to={user ? "/create-idea" : "/login"}>
              <Button className="h-16 px-12 bg-[#903f00] text-white hover:bg-[#b45309] rounded-2xl font-bold text-xl transition-all active:scale-95 shadow-xl shadow-[#903f00]/20">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#fcf3e3] border-t border-[#b45309]/5 py-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center gap-10">
          <Logo />
          <div className="flex flex-wrap justify-center gap-10 font-mono text-[10px] uppercase tracking-[0.2em] text-[#564338]/60">
            <a href="#" className="hover:text-[#903f00] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#903f00] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#903f00] transition-colors">Manifesto</a>
            <a href="#" className="hover:text-[#903f00] transition-colors">Contact</a>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#564338]/30">
            © 2026 Team Forge. The Digital Atelier.
          </p>
        </div>
      </footer>
    </div>
  );
}
