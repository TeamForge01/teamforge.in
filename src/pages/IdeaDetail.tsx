import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import { db, sendNotification } from '../lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { 
  CheckCircle2, 
  MessageSquare, 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  LayoutDashboard,
  Award,
  Link as LinkIcon,
  Network,
  Settings,
  ArrowRight,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export default function IdeaDetail() {
  const { ideaId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState('');
  const [userSkills, setUserSkills] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myRequest, setMyRequest] = useState<any>(null);
  const [allRequests, setAllRequests] = useState<any[]>([]);

  useEffect(() => {
    if (ideaId) {
      const fetchIdea = async () => {
        const docSnap = await getDoc(doc(db, 'ideas', ideaId));
        if (docSnap.exists()) {
          setIdea({ id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
      };
      fetchIdea();

      if (user) {
        const q = query(collection(db, 'joinRequests'), where('ideaId', '==', ideaId));
        const unsub = onSnapshot(q, (snap) => {
          const requests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setAllRequests(requests);
          setMyRequest(requests.find((r: any) => r.userId === user.uid));
        });
        return () => unsub();
      }
    }
  }, [ideaId, user]);

  const handleJoinRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !profile || !ideaId || !idea) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'joinRequests'), {
        ideaId,
        ideaTitle: idea.title,
        userId: user.uid,
        userName: profile.displayName,
        userRole: profile.role,
        status: 'pending',
        message: requestMessage,
        skills: userSkills,
        createdAt: serverTimestamp()
      });

      await sendNotification(
        idea.founderId,
        'join_request',
        'New Join Request',
        `${profile.displayName} wants to join "${idea.title}"`,
        `/idea/${ideaId}`
      );

      toast.success("Application submitted to the forge!");
      setRequestMessage('');
      setUserSkills('');
    } catch (error) {
      console.error("Failed to send request:", error);
      toast.error("Failed to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Shareable link copied to clipboard!");
  };

  if (loading) return null;
  if (!idea) return <div className="p-12 text-center font-bold">Idea not found.</div>;

  const isFounder = user?.uid === idea.founderId;
  const isMember = isFounder || myRequest?.status === 'accepted';

  return (
    <div className="min-h-screen bg-[#fff8f1] flex overflow-x-hidden">
      {user && <DashboardSidebar />}
      
      <main className={cn("flex-1 pt-32 pb-24 px-8", user ? "ml-64" : "max-w-7xl mx-auto")}>
        <div className="max-w-7xl mx-auto">
          {/* Back Button & Team Space */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)} className="text-[#564338]/60 hover:text-[#903f00] font-bold group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Hub
              </Button>
              <Button 
                variant="outline" 
                onClick={handleShare}
                className="bg-white/50 backdrop-blur-md border-none text-[#1f1b12] rounded-xl font-bold px-4 hover:bg-white transition-all shadow-sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Idea
              </Button>
            </div>
            {isMember && (
              <Button asChild className="bg-[#903f00] text-white hover:bg-[#b45309] rounded-xl font-bold shadow-lg shadow-[#903f00]/20">
                <Link to={`/idea/${ideaId}/workspace`}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Enter Workspace
                </Link>
              </Button>
            )}
          </div>

          {/* Hero Header */}
          <header className="mb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
              <div className="max-w-4xl">
                <div className="flex items-center gap-4 mb-6">
                  <span className="bg-[#eae1d3] text-[#903f00] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#903f00] animate-pulse"></span>
                    {idea.stage || 'Early Stage'}
                  </span>
                  <span className="text-[#564338]/40 text-xs font-bold uppercase tracking-[0.2em]">
                    {idea.category || 'Sustainability & Tech'}
                  </span>
                </div>
                <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-[#1f1b12] mb-8 leading-[0.95]">
                  {idea.title}
                </h1>
                <p className="text-2xl text-[#564338] leading-relaxed font-bold italic opacity-70 max-w-3xl">
                  {idea.tagline || idea.problem}
                </p>
              </div>
              
              {!isFounder && !myRequest && (
                <div className="flex flex-col gap-4 min-w-[280px]">
                  <Button 
                    onClick={() => document.getElementById('join-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-gradient-to-br from-[#903f00] to-[#b45309] text-white px-10 py-8 rounded-2xl text-xl font-black shadow-2xl shadow-[#903f00]/20 hover:scale-[1.02] transition-all active:scale-95"
                  >
                    Request to Join
                  </Button>
                  <p className="text-[10px] text-[#564338]/40 text-center font-bold uppercase tracking-[0.2em]">
                    Application Closes in 4 Days
                  </p>
                </div>
              )}
            </div>
          </header>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-12">
              {/* Description Card */}
              <section className="bg-white p-12 rounded-[3rem] shadow-[0px_20px_40px_rgba(17,17,17,0.04)] border border-[#111111]/5">
                <h2 className="text-3xl font-black mb-8 text-[#1f1b12] tracking-tight">Idea Description</h2>
                <div className="space-y-6 text-[#564338] leading-[1.8] font-medium text-lg">
                  <p>{idea.description}</p>
                  
                  <div className="relative w-full h-[450px] rounded-[2.5rem] overflow-hidden my-12 group">
                    <img 
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" 
                      src="https://picsum.photos/seed/forge/1200/800" 
                      alt="Project Visual"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1f1b12]/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl">
                        <p className="text-white text-sm font-bold italic">"Visualizing the future of circular systems through intentional design."</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-[#1f1b12] pt-8 mb-6">Current Milestones</h3>
                  <ul className="space-y-6">
                    <li className="flex items-start gap-4 p-6 bg-[#f6edde]/30 rounded-2xl border border-[#111111]/5">
                      <CheckCircle2 className="w-6 h-6 text-[#903f00] shrink-0" />
                      <div>
                        <p className="font-black text-[#1f1b12] mb-1">Prototype Phase</p>
                        <p className="text-sm opacity-70 italic">Initial API developed for categorization and logistics orchestration.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4 p-6 bg-[#f6edde]/30 rounded-2xl border border-[#111111]/5">
                      <CheckCircle2 className="w-6 h-6 text-[#903f00] shrink-0" />
                      <div>
                        <p className="font-black text-[#1f1b12] mb-1">Market Validation</p>
                        <p className="text-sm opacity-70 italic">Letters of Intent secured from 3 Tier-1 industrial suppliers.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Join Request Form */}
              {!isFounder && !myRequest && (
                <section className="bg-[#fcf3e3] p-12 rounded-[3rem] border border-[#903f00]/10" id="join-form">
                  <div className="max-w-3xl">
                    <h2 className="text-3xl font-black mb-3 text-[#1f1b12] tracking-tight">Apply to the Forge</h2>
                    <p className="text-[#564338] font-bold italic opacity-60 mb-10">Join {idea.founderName} and the founding team to build the future of circularity.</p>
                    
                    <form onSubmit={handleJoinRequest} className="space-y-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#903f00]">Why do you want to join?</label>
                        <Textarea 
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value)}
                          className="w-full bg-transparent border-none border-b-2 border-[#564338]/20 focus:ring-0 focus:border-[#903f00] transition-colors resize-none py-4 text-xl font-bold italic placeholder:text-[#564338]/20 min-h-[120px]" 
                          placeholder="Tell us about your motivation..." 
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#903f00]">Your skills</label>
                        <input 
                          value={userSkills}
                          onChange={(e) => setUserSkills(e.target.value)}
                          className="w-full bg-transparent border-none border-b-2 border-[#564338]/20 focus:ring-0 focus:border-[#903f00] transition-colors py-4 text-xl font-bold italic placeholder:text-[#564338]/20" 
                          placeholder="e.g. PyTorch, Supply Chain Logistics, React..." 
                          type="text"
                        />
                      </div>
                      <Button 
                        type="submit"
                        disabled={isSubmitting || !requestMessage.trim()}
                        className="bg-[#1f1b12] text-white px-12 py-8 rounded-2xl text-lg font-black hover:bg-[#903f00] transition-all shadow-xl shadow-[#1f1b12]/10"
                      >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Application"}
                      </Button>
                    </form>
                  </div>
                </section>
              )}

              {myRequest && (
                <section className="bg-white p-12 rounded-[3rem] border border-[#111111]/5 text-center space-y-6">
                  <div className="w-20 h-20 bg-[#fcf3e3] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-[#903f00]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#1f1b12]">Application Sent</h3>
                    <p className="text-[#564338] font-bold italic opacity-60 mt-2">
                      Your request is currently <span className="text-[#903f00] uppercase tracking-widest">{myRequest.status}</span>.
                    </p>
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar Info */}
            <aside className="lg:col-span-4 space-y-10">
              {/* Founder Profile */}
              <section className="bg-[#f6edde] p-10 rounded-[2.5rem] border border-[#111111]/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#564338]/40 mb-8">Founder</h3>
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-2 border-white">
                    <Avatar className="w-full h-full rounded-none">
                      <AvatarFallback className="bg-[#903f00] text-white font-black text-2xl">
                        {idea.founderName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h4 className="font-black text-xl text-[#1f1b12] tracking-tight">{idea.founderName}</h4>
                    <p className="text-xs text-[#903f00] font-bold uppercase tracking-widest mt-1">Lead Forger</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[#564338] font-bold italic opacity-70 mb-8">
                  "I've spent years optimizing systems. Now I'm building the orchestration layer that makes the systems themselves obsolete."
                </p>
                <div className="flex gap-4 pt-6 border-t border-[#111111]/5">
                  <Link to={`/profile/${idea.founderId}`} className="text-[#564338]/40 hover:text-[#903f00] transition-colors">
                    <LinkIcon className="w-5 h-5" />
                  </Link>
                  <button className="text-[#564338]/40 hover:text-[#903f00] transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              </section>

              {/* Skills Required */}
              <section className="bg-white p-10 rounded-[2.5rem] border border-[#111111]/5 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#564338]/40 mb-8">Skills Required</h3>
                <div className="flex flex-wrap gap-3">
                  {['Machine Learning', 'B2B Sales', 'Logistics API', 'Python', 'SaaS Strategy'].map(skill => (
                    <span key={skill} className="bg-[#fcf3e3] px-5 py-2.5 rounded-xl text-xs font-black text-[#1f1b12] border border-[#111111]/5">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {/* Stage Details */}
              <section className="bg-[#111111] text-white p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-8">Project Stage</h3>
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-sm font-black tracking-tight">Ideation & MVP</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#903f00]">Current</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-[#903f00] rounded-full shadow-[0_0_15px_rgba(144,63,0,0.5)]"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">Equity</p>
                        <p className="text-2xl font-black tracking-tighter">5 - 15%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">Timeline</p>
                        <p className="text-2xl font-black tracking-tighter">Launch Q3</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-10">
                  <Sparkles className="w-40 h-40 text-[#903f00]" />
                </div>
              </section>

              {/* AI Validation Summary */}
              <section className="bg-gradient-to-br from-[#1f1b12] to-[#111111] p-10 rounded-[2.5rem] text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <Sparkles className="w-5 h-5 text-[#903f00]" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">AI Validation</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold opacity-60">Forge Score</span>
                    <span className="text-4xl font-black text-[#903f00]">{idea.aiValidation?.score || '72'}</span>
                  </div>
                  <p className="text-sm font-bold italic opacity-60 leading-relaxed">
                    {idea.aiValidation?.marketPotential || "High potential for disruption in industrial logistics through automated orchestration."}
                  </p>
                  <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 rounded-xl font-bold text-xs uppercase tracking-widest py-6">
                    View Full Report
                  </Button>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}


