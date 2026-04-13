import React from 'react';
import { motion } from 'motion/react';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { 
  Phone, 
  Mail, 
  Instagram, 
  MessageCircle, 
  ExternalLink,
  ShieldCheck,
  HeartHandshake,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export default function Support() {
  const contactInfo = [
    {
      icon: Phone,
      label: 'Phone Support',
      value: '+91 8867678750',
      href: 'tel:+918867678750',
      description: 'Available for urgent queries and direct assistance.'
    },
    {
      icon: Mail,
      label: 'Email Support',
      value: 'infinityanirudra@gmail.com',
      href: 'mailto:infinityanirudra@gmail.com',
      description: 'Send us your detailed feedback or support requests.'
    }
  ];

  const socialLinks = [
    {
      label: 'TeamForge Official',
      value: 'teamforge.in',
      href: 'https://instagram.com/teamforge.in',
      description: 'Stay updated with our latest features and community news.'
    },
    {
      label: 'Founder Public Page',
      value: 'buildwithanirudra',
      href: 'https://instagram.com/buildwithanirudra',
      description: 'Behind the scenes and building in public.'
    },
    {
      label: 'Founder Personal',
      value: 'aniiirudra',
      href: 'https://instagram.com/aniiirudra',
      description: 'Personal updates and founder journey.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fff8f1] flex">
      <DashboardSidebar />
      
      <main className="flex-1 lg:ml-64 p-6 md:p-12 transition-all duration-300">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header Section */}
          <header className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#903f00]/10 text-[#903f00] text-xs font-bold uppercase tracking-widest"
            >
              <HeartHandshake className="w-4 h-4" />
              Support Center
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black text-[#1f1b12] tracking-tight font-headline"
            >
              How can we help you <span className="text-[#903f00]">forge</span> your future?
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-[#564338] font-bold italic opacity-70 max-w-2xl"
            >
              We're here to ensure your journey from idea to execution is seamless. Reach out to us through any of the channels below.
            </motion.p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Direct Contact */}
            <div className="space-y-6">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#903f00] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Direct Channels
              </h2>
              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="bg-white border-[#111111]/5 rounded-[2rem] hover:shadow-xl transition-all group overflow-hidden">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-[#fcf3e3] flex items-center justify-center shrink-0 group-hover:bg-[#903f00] transition-colors">
                            <item.icon className="w-6 h-6 text-[#903f00] group-hover:text-white transition-colors" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#564338]/40">{item.label}</h3>
                            <a 
                              href={item.href}
                              className="text-xl font-black text-[#1f1b12] hover:text-[#903f00] transition-colors block"
                            >
                              {item.value}
                            </a>
                            <p className="text-sm text-[#564338] font-bold italic opacity-60">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Social Support */}
            <div className="space-y-6">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#903f00] flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Social Presence
              </h2>
              <div className="space-y-4">
                {socialLinks.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="bg-[#fcf3e3] border-none rounded-[2rem] hover:shadow-xl transition-all group overflow-hidden">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shrink-0 group-hover:bg-[#1f1b12] transition-colors">
                            <Instagram className="w-6 h-6 text-[#1f1b12] group-hover:text-white transition-colors" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="text-xs font-black uppercase tracking-widest text-[#564338]/40">{item.label}</h3>
                              <ExternalLink className="w-4 h-4 text-[#564338]/20 group-hover:text-[#1f1b12] transition-colors" />
                            </div>
                            <a 
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xl font-black text-[#1f1b12] hover:text-[#903f00] transition-colors block"
                            >
                              @{item.value}
                            </a>
                            <p className="text-sm text-[#564338] font-bold italic opacity-60">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-[#1f1b12] text-white p-12 rounded-[3rem] relative overflow-hidden shadow-2xl text-center space-y-6"
          >
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                Community First
              </div>
              <h2 className="text-3xl font-black font-headline">Join the Forge Community</h2>
              <p className="text-[#fff8f1]/60 font-bold italic max-w-xl mx-auto">
                Connect with other founders, share your progress, and get help from the community in real-time.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Button className="bg-[#903f00] hover:bg-[#b45309] text-white rounded-2xl font-bold px-8 py-6 h-auto transition-all active:scale-95">
                  Join Discord
                </Button>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-[#1f1b12] rounded-2xl font-bold px-8 py-6 h-auto transition-all active:scale-95">
                  Follow Updates
                </Button>
              </div>
            </div>
            {/* Abstract Background Elements */}
            <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-[#903f00]/20 blur-[80px] rounded-full"></div>
            <div className="absolute -left-24 -top-24 w-64 h-64 bg-[#903f00]/10 blur-[80px] rounded-full"></div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
