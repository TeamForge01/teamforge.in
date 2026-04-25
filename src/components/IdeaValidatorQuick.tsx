import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, Loader2, Users, Lightbulb, Target, Landmark, Globe, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { validateIdeaDetailed } from '../lib/gemini';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export function IdeaValidatorQuick() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [hasValidated, setHasValidated] = useState(() => {
    return localStorage.getItem('guest_validated_v2') === 'true';
  });

  const handleValidate = async () => {
    if (hasValidated) {
      toast.error('You have already used your free guest validation. Please sign up for more!');
      return;
    }

    if (!description.trim() || description.length < 20) {
      toast.error('Please provide a more detailed description (at least 20 characters).');
      return;
    }

    setLoading(true);
    try {
      // Mocking other fields for quick validation
      const data = await validateIdeaDetailed(
        description,
        "General public / Target market",
        "Freemium / B2B SaaS",
        "Global"
      );
      setResult(data);
      localStorage.setItem('guest_validated_v2', 'true');
      setHasValidated(true);
      toast.success('Validation complete!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to validate idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-[#b45309]/5 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#903f00]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#903f00] rounded-xl flex items-center justify-center text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-headline text-3xl font-bold text-[#1f1b12]">Free AI Idea Validator</h2>
        </div>
        
        {!result ? (
          <div className="space-y-6">
            <p className="text-[#564338] text-lg leading-relaxed">
              Wondering if your startup idea has legs? Get an instant, AI-driven feasibility report. 
              <span className="block mt-2 font-bold text-[#903f00]">Free for guests once. No login required.</span>
            </p>
            
            <div className="relative group">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your idea... (e.g., A peer-to-peer luxury watch rental platform for corporate events in Dubai)"
                disabled={hasValidated || loading}
                className="w-full h-40 bg-[#fcf3e3] rounded-3xl p-8 text-lg text-[#1f1b12] placeholder:text-[#564338]/40 border-2 border-transparent focus:border-[#903f00]/20 focus:outline-none transition-all resize-none shadow-inner"
              />
              {hasValidated && (
                <div className="absolute inset-0 bg-[#fcf3e3]/80 backdrop-blur-sm rounded-3xl flex items-center justify-center p-8 text-center">
                  <div className="space-y-4">
                    <AlertCircle className="w-12 h-12 text-[#903f00] mx-auto opacity-40" />
                    <p className="font-bold text-[#1f1b12]">Guest limit reached</p>
                    <Link to="/login">
                      <Button className="bg-[#903f00] text-white rounded-xl">Sign in for unlimited validations</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleValidate}
                disabled={loading || hasValidated || description.length < 20}
                className="h-14 px-10 bg-[#903f00] text-white rounded-2xl font-bold hover:bg-[#b45309] transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Market...
                  </>
                ) : (
                  <>
                    Validate Idea <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Score Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#fcf3e3] p-6 rounded-2xl border border-[#903f00]/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#564338]/40 mb-2">Overall Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-[#903f00]">{result.score}/10</span>
                </div>
              </div>
              <div className="bg-[#fcf3e3] p-6 rounded-2xl border border-[#903f00]/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#564338]/40 mb-2">Competition</p>
                <span className="text-2xl font-bold text-[#1f1b12]">{result.competition.score}/10</span>
              </div>
              <div className="bg-[#fcf3e3] p-6 rounded-2xl border border-[#903f00]/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#564338]/40 mb-2">Demand</p>
                <span className="text-2xl font-bold text-[#1f1b12]">{result.demand.score}/10</span>
              </div>
              <div className="bg-[#fcf3e3] p-6 rounded-2xl border border-[#903f00]/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#564338]/40 mb-2">Monetization</p>
                <span className="text-2xl font-bold text-[#1f1b12]">{result.monetization.score}/10</span>
              </div>
            </div>

            {/* Recommendations & Team Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-headline text-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Key Strengths
                </h3>
                <div className="space-y-3">
                  {result.strengths.slice(0, 3).map((s: string, i: number) => (
                    <p key={i} className="text-sm font-bold text-[#564338] bg-emerald-50 p-3 rounded-xl">
                      {s}
                    </p>
                  ))}
                </div>
                
                <h3 className="font-headline text-xl font-bold flex items-center gap-2 mt-8">
                  <Users className="w-5 h-5 text-[#903f00]" />
                  Ideal Team Members
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {/* AI Suggested Roles for this idea */}
                  {result.nextSteps.filter((s: string) => s.toLowerCase().includes('connect') || s.toLowerCase().includes('interview') || s.toLowerCase().includes('team')).slice(0, 2).map((s: string, i: number) => (
                    <div key={i} className="bg-[#f6edde] p-4 rounded-xl border border-[#903f00]/10 flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#903f00] shadow-sm">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1f1b12]">{s}</p>
                        <p className="text-[10px] text-[#564338]/60 font-medium">Recommended for this domain</p>
                      </div>
                    </div>
                  ))}
                  {/* Generic suggestions if AI didn't return specific member matching steps */}
                  {result.nextSteps.filter((s: string) => s.toLowerCase().includes('connect') || s.toLowerCase().includes('interview') || s.toLowerCase().includes('team')).length === 0 && (
                    <>
                      <div className="bg-[#f6edde] p-4 rounded-xl border border-[#903f00]/10 flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#903f00] shadow-sm">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1f1b12]">Growth Marketing Specialist</p>
                          <p className="text-[10px] text-[#564338]/60 font-medium">To validate initial demand</p>
                        </div>
                      </div>
                      <div className="bg-[#f6edde] p-4 rounded-xl border border-[#903f00]/10 flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#903f00] shadow-sm">
                          <Landmark className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1f1b12]">Technical Co-Founder (CTO)</p>
                          <p className="text-[10px] text-[#564338]/60 font-medium">For MVP development</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-[#111111] text-white p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <h3 className="font-headline text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-[#903f00]" />
                    AI Action Plan
                  </h3>
                  <div className="space-y-4">
                    {result.nextSteps.slice(0, 4).map((step: string, i: number) => (
                      <div key={i} className="flex gap-4 group">
                        <span className="text-[#903f00] font-black">{i + 1}.</span>
                        <p className="text-sm text-white/70 group-hover:text-white transition-colors">{step}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-white/10 mt-6">
                    <a href="https://opal.google/app/112KX_iWciItJYGrIMAOJJCkMG2UYUp7L" target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button className="w-full h-14 bg-[#903f00] hover:bg-[#b45309] text-white rounded-2xl font-bold shadow-xl shadow-[#903f00]/20 active:scale-95 transition-all">
                        Get 15-Page Master Analysis
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                    <p className="text-[10px] text-center mt-4 text-white/30 uppercase tracking-widest font-bold">
                      Takes 10-15 min for best report
                    </p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#903f00]/10 rounded-full blur-[80px]"></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
