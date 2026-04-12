import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc,
  updateDoc,
  orderBy
} from 'firebase/firestore';
import { 
  Search, 
  Filter, 
  Briefcase, 
  TrendingUp, 
  Users, 
  Target, 
  ChevronRight,
  ShieldCheck,
  Star,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';

export default function InvestorHub() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStartup, setSelectedStartup] = useState<any>(null);
  const [interestMessage, setInterestMessage] = useState('');
  const [isSendingInterest, setIsSendingInterest] = useState(false);
  const [isInvestor, setIsInvestor] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check if user is an investor
    const checkInvestor = async () => {
      const docSnap = await getDoc(doc(db, 'investorProfiles', user.uid));
      setIsInvestor(docSnap.exists());
    };
    checkInvestor();

    // Fetch published startups
    const q = query(
      collection(db, 'ideas'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setStartups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleExpressInterest = async () => {
    if (!user || !profile || !selectedStartup) return;
    setIsSendingInterest(true);
    try {
      await addDoc(collection(db, 'investmentInterests'), {
        investorId: user.uid,
        investorName: profile.displayName,
        ideaId: selectedStartup.id,
        ideaTitle: selectedStartup.title,
        status: 'pending',
        message: interestMessage,
        createdAt: serverTimestamp()
      });
      toast.success("Interest expressed! The founder will be notified.");
      setSelectedStartup(null);
      setInterestMessage('');
    } catch (error) {
      toast.error("Failed to send interest.");
    } finally {
      setIsSendingInterest(false);
    }
  };

  const filteredStartups = startups.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.tagline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#fff8f1] flex">
      <DashboardSidebar />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-[#1f1b12] tracking-tight">Investor Hub</h1>
              <p className="text-xs font-bold text-[#903f00] uppercase tracking-widest mt-1">Discover the next generation of industry leaders</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#564338]/40" />
                <Input 
                  placeholder="Search startups..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-[#111111]/5 focus:border-[#903f00] focus:ring-[#903f00]/10 rounded-xl font-bold"
                />
              </div>
              <Button variant="outline" className="rounded-xl border-[#111111]/5 text-[#564338] font-bold text-xs uppercase tracking-widest">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </header>

          {!isInvestor && (
            <Card className="border-none bg-[#1f1b12] text-white p-8 shadow-2xl shadow-[#1f1b12]/20 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl space-y-4">
                  <div className="flex items-center gap-2 text-[#903f00]">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Verified Investor Access</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">Become a TeamForge Investor</h2>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Get exclusive access to vetted startup ideas, real-time traction metrics, and direct lines of communication with founders.
                  </p>
                  <Button className="bg-[#903f00] hover:bg-[#7a3500] text-white font-black uppercase tracking-widest px-8 py-6 rounded-xl shadow-lg shadow-[#903f00]/20">
                    Apply for Verification
                  </Button>
                </div>
                <div className="hidden lg:grid grid-cols-2 gap-4">
                  {[
                    { label: 'Deals Closed', val: '124' },
                    { label: 'Total Capital', val: '$42M' },
                    { label: 'Active Startups', val: '850+' },
                    { label: 'Success Rate', val: '18%' }
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <p className="text-xl font-black text-white">{stat.val}</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-[#903f00]">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#903f00]/10 rounded-full blur-3xl -mr-32 -mt-32" />
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredStartups.map((startup) => (
                <motion.div
                  key={startup.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="h-full border-[#111111]/5 hover:border-[#903f00]/20 transition-all group shadow-sm bg-white overflow-hidden flex flex-col">
                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-[#fcf3e3] text-[#903f00] border-none font-black text-[8px] uppercase tracking-widest px-2 py-0.5">
                          {startup.stage}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#564338]/40 hover:text-[#903f00]">
                          <Star className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-black text-[#1f1b12] group-hover:text-[#903f00] transition-colors">{startup.title}</h3>
                        <p className="text-xs font-bold text-[#564338]/60 mt-1">{startup.tagline || "Innovating the future of industry"}</p>
                      </div>

                      <p className="text-xs text-[#564338] line-clamp-3 leading-relaxed">
                        {startup.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#111111]/5">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-[#564338]/40 uppercase tracking-widest">Funding Goal</p>
                          <p className="text-xs font-black text-[#1f1b12]">${startup.fundingGoal?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-[#564338]/40 uppercase tracking-widest">Founder</p>
                          <p className="text-xs font-black text-[#1f1b12]">{startup.founderName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-[#fcf3e3]/30 border-t border-[#111111]/5 flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-[#111111]/5 text-[#564338] font-black uppercase tracking-widest text-[10px] h-10 rounded-xl"
                        onClick={() => navigate(`/idea/${startup.id}`)}
                      >
                        Details
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="flex-1 bg-[#903f00] hover:bg-[#7a3500] text-white font-black uppercase tracking-widest text-[10px] h-10 rounded-xl shadow-lg shadow-[#903f00]/10"
                            onClick={() => setSelectedStartup(startup)}
                          >
                            Invest
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] border-none bg-[#fff8f1] p-0 overflow-hidden rounded-3xl">
                          <div className="p-8 space-y-6">
                            <DialogHeader>
                              <div className="w-12 h-12 rounded-2xl bg-[#903f00] flex items-center justify-center text-white mb-4 shadow-lg shadow-[#903f00]/20">
                                <Target className="w-6 h-6" />
                              </div>
                              <DialogTitle className="text-2xl font-black text-[#1f1b12] tracking-tight">Express Interest</DialogTitle>
                              <DialogDescription className="text-xs font-bold text-[#903f00] uppercase tracking-widest">
                                Connecting with {selectedStartup?.title}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#564338]/60 uppercase tracking-widest">Personal Message</label>
                                <Textarea 
                                  placeholder="Why are you interested in this startup? What value can you bring beyond capital?"
                                  value={interestMessage}
                                  onChange={(e) => setInterestMessage(e.target.value)}
                                  className="min-h-[120px] border-[#111111]/5 focus:border-[#903f00] focus:ring-[#903f00]/10 rounded-2xl font-medium text-sm"
                                />
                              </div>
                            </div>

                            <DialogFooter className="flex-col sm:flex-col gap-3">
                              <Button 
                                onClick={handleExpressInterest}
                                disabled={isSendingInterest || !interestMessage}
                                className="w-full bg-[#903f00] hover:bg-[#7a3500] text-white font-black uppercase tracking-widest py-6 rounded-2xl shadow-xl shadow-[#903f00]/20"
                              >
                                {isSendingInterest ? "Sending..." : "Send Interest"}
                              </Button>
                              <p className="text-[8px] text-center text-[#564338]/40 uppercase tracking-widest font-bold">
                                By sending, you agree to our Investor Terms of Service
                              </p>
                            </DialogFooter>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredStartups.length === 0 && (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-3xl bg-[#fcf3e3] flex items-center justify-center text-[#903f00] mx-auto mb-6">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-[#1f1b12] tracking-tight">No startups found</h3>
              <p className="text-sm font-bold text-[#564338]/40 uppercase tracking-widest mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
