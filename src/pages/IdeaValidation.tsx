import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Target, 
  Search, 
  ShieldCheck, 
  ExternalLink,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { useSidebar } from '../components/SidebarContext';
import { Link } from 'react-router-dom';

export default function IdeaValidation() {
  const { isOpen } = useSidebar();

  const validationSteps = [
    {
      title: "Idea Submission",
      description: "Detailed breakdown of your startup concept, target audience, and monetization strategy.",
      icon: <Lightbulb className="w-6 h-6" />
    },
    {
      title: "Market Analysis",
      description: "Real-time scanning of current market trends, competitor density, and untapped niches.",
      icon: <Search className="w-6 h-6" />
    },
    {
      title: "Feasibility Audit",
      description: "Technical and financial stress-testing to see if your model is sustainable at scale.",
      icon: <ShieldCheck className="w-6 h-6" />
    },
    {
      title: "Master Report Generation",
      description: "Synthesis of data into a comprehensive 15-page deep-dive validation report.",
      icon: <Zap className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#fff8f1] flex">
      <DashboardSidebar />
      
      <main className="flex-1 lg:ml-64 p-8 transition-all duration-300">
        <div className="max-w-5xl mx-auto space-y-12 py-12">
          {/* Hero Section */}
          <header className="text-center space-y-4">
            <Badge className="bg-[#903f00] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Advanced Validation Interface
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-[#1f1b12] tracking-tighter leading-none">
              Don't Build in <span className="text-[#903f00]">The Dark.</span>
            </h1>
            <p className="text-xl text-[#564338] font-medium max-w-2xl mx-auto leading-relaxed">
              Our Master Validation engine performs quantitative and qualitative research across global databases to verify your concept's potential.
            </p>
          </header>

          {/* How it works Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-[#903f00]/5 border border-[#111111]/5">
              <h2 className="text-3xl font-black text-[#1f1b12] mb-8 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-[#903f00]" />
                The Process
              </h2>
              <div className="space-y-8">
                {validationSteps.map((step, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-12 h-12 bg-[#fcf3e3] rounded-2xl flex items-center justify-center text-[#903f00] shrink-0 group-hover:scale-110 transition-transform">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#1f1b12] mb-1">{step.title}</h3>
                      <p className="text-sm text-[#564338] leading-relaxed opacity-70 font-medium">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-8 p-6">
              <div className="bg-[#1f1b12] p-10 rounded-[3rem] text-white relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Live Analyzer Ready</span>
                  </div>
                  <h3 className="text-3xl font-black leading-tight">Generate Your Master Report Now</h3>
                  <p className="text-white/60 font-medium leading-relaxed">
                    Our high-fidelity validation engine takes <span className="text-white font-bold">10-15 minutes</span> to cross-reference thousands of data points. This ensures you get the most accurate failure-prevention audit available.
                  </p>
                  
                  <div className="pt-8">
                    <Button 
                      asChild
                      className="w-full h-16 bg-[#903f00] hover:bg-[#b45309] text-white rounded-2xl font-black text-lg shadow-xl shadow-[#903f00]/20 active:scale-95 transition-all group"
                    >
                      <a href="https://opal.google/app/112KX_iWciItJYGrIMAOJJCkMG2UYUp7L" target="_blank" rel="noopener noreferrer">
                        Start Master Validation
                        <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </a>
                    </Button>
                    <p className="text-center mt-4 text-[10px] font-black uppercase tracking-widest opacity-40">
                      Redirecting to external high-performance tool
                    </p>
                  </div>
                </div>
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#903f00]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex gap-6 items-center">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-emerald-900">Success Rate Increased by 40%</h4>
                  <p className="text-xs text-emerald-700/70 font-bold">Founders who use the Master Validation report are 2.4x more likely to secure pre-seed funding within 6 months.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
