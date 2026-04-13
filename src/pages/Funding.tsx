import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
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
  TrendingUp, 
  DollarSign, 
  FileText, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Users,
  Briefcase,
  ArrowLeft,
  Target,
  BarChart3
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { format } from 'date-fns';
import { useSidebar } from '../components/SidebarContext';
import { cn } from '../lib/utils';

export default function Funding() {
  const { ideaId } = useParams();
  const { user, profile } = useAuth();
  const { isOpen } = useSidebar();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<any>(null);
  const [traction, setTraction] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [metricName, setMetricName] = useState('');
  const [metricValue, setMetricValue] = useState('');
  const [fundingGoal, setFundingGoal] = useState('');
  const [pitchDeckUrl, setPitchDeckUrl] = useState('');

  useEffect(() => {
    if (!ideaId || !user) return;

    const fetchIdea = async () => {
      const docSnap = await getDoc(doc(db, 'ideas', ideaId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIdea({ id: docSnap.id, ...data });
        setFundingGoal(data.fundingGoal?.toString() || '');
        setPitchDeckUrl(data.pitchDeckUrl || '');
      }
      setLoading(false);
    };
    fetchIdea();

    const unsubTraction = onSnapshot(
      query(collection(db, 'traction'), where('ideaId', '==', ideaId), orderBy('date', 'desc')),
      (snap) => setTraction(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsubInterests = onSnapshot(
      query(collection(db, 'investmentInterests'), where('ideaId', '==', ideaId), orderBy('createdAt', 'desc')),
      (snap) => setInterests(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubTraction();
      unsubInterests();
    };
  }, [ideaId, user]);

  const handleUpdateFunding = async () => {
    if (!ideaId) return;
    try {
      await updateDoc(doc(db, 'ideas', ideaId), {
        fundingGoal: parseFloat(fundingGoal) || 0,
        pitchDeckUrl,
        updatedAt: serverTimestamp()
      });
      toast.success("Funding details updated!");
    } catch (error) {
      toast.error("Failed to update funding details.");
    }
  };

  const handleAddTraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaId || !metricName || !metricValue) return;
    try {
      await addDoc(collection(db, 'traction'), {
        ideaId,
        metricName,
        value: metricValue,
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      });
      setMetricName('');
      setMetricValue('');
      toast.success("Traction metric added!");
    } catch (error) {
      toast.error("Failed to add traction.");
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#fff8f1] flex">
      <DashboardSidebar />
      
      <main className="flex-1 lg:ml-64 p-8 transition-all duration-300">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(`/workspace/${ideaId}`)} className="text-[#564338]/60 hover:text-[#903f00] font-bold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Workspace
              </Button>
              <div className="h-8 w-px bg-[#111111]/5" />
              <div>
                <h1 className="text-2xl font-black text-[#1f1b12] tracking-tight">Funding & Investment</h1>
                <p className="text-xs font-bold text-[#903f00] uppercase tracking-widest">Prepare for your next round</p>
              </div>
            </div>
            <Badge className="bg-[#903f00] text-white font-bold px-3 py-1">
              {idea?.stage} Stage
            </Badge>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Pitch & Goal */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-[#111111]/5 shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-[#fcf3e3]/30 border-b border-[#111111]/5">
                  <CardTitle className="text-[10px] font-black text-[#903f00] uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-3 h-3" />
                    Investment Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#564338]/60 uppercase tracking-widest">Funding Goal ($)</label>
                      <Input 
                        type="number" 
                        value={fundingGoal} 
                        onChange={(e) => setFundingGoal(e.target.value)}
                        placeholder="e.g. 500000"
                        className="border-[#111111]/5 focus:border-[#903f00] focus:ring-[#903f00]/10 rounded-xl font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#564338]/60 uppercase tracking-widest">Pitch Deck URL</label>
                      <div className="flex gap-2">
                        <Input 
                          value={pitchDeckUrl} 
                          onChange={(e) => setPitchDeckUrl(e.target.value)}
                          placeholder="Link to DocSend, Google Drive, etc."
                          className="border-[#111111]/5 focus:border-[#903f00] focus:ring-[#903f00]/10 rounded-xl font-bold"
                        />
                        {pitchDeckUrl && (
                          <Button variant="outline" size="icon" asChild className="rounded-xl border-[#111111]/5">
                            <a href={pitchDeckUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleUpdateFunding} className="w-full bg-[#903f00] hover:bg-[#7a3500] text-white font-black uppercase tracking-widest py-6 rounded-xl shadow-lg shadow-[#903f00]/20">
                    Update Funding Details
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-[#111111]/5 shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-[#fcf3e3]/30 border-b border-[#111111]/5">
                  <CardTitle className="text-[10px] font-black text-[#903f00] uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    Traction & Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleAddTraction} className="flex gap-4 mb-8">
                    <Input 
                      value={metricName} 
                      onChange={(e) => setMetricName(e.target.value)}
                      placeholder="Metric (e.g. Monthly Revenue)"
                      className="border-[#111111]/5 focus:border-[#903f00] focus:ring-[#903f00]/10 rounded-xl font-bold"
                    />
                    <Input 
                      value={metricValue} 
                      onChange={(e) => setMetricValue(e.target.value)}
                      placeholder="Value (e.g. $10k)"
                      className="border-[#111111]/5 focus:border-[#903f00] focus:ring-[#903f00]/10 rounded-xl font-bold"
                    />
                    <Button type="submit" className="bg-[#903f00] hover:bg-[#7a3500] text-white font-black uppercase tracking-widest px-6 rounded-xl">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </form>

                  <div className="space-y-4">
                    {traction.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-[#111111]/5 rounded-2xl bg-[#fcf3e3]/10">
                        <BarChart3 className="w-12 h-12 text-[#903f00]/20 mx-auto mb-4" />
                        <p className="text-sm font-bold text-[#564338]/40 uppercase tracking-widest">No metrics added yet</p>
                      </div>
                    ) : (
                      traction.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl border border-[#111111]/5 bg-white hover:border-[#903f00]/20 transition-all group shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#fcf3e3] flex items-center justify-center text-[#903f00]">
                              <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-[#903f00] uppercase tracking-widest">{t.metricName}</p>
                              <p className="text-lg font-black text-[#1f1b12]">{t.value}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-[#564338]/40 uppercase tracking-widest mb-1">{t.date}</p>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#564338]/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Investor Interest */}
            <div className="space-y-8">
              <Card className="border-[#111111]/5 shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-[#fcf3e3]/30 border-b border-[#111111]/5">
                  <CardTitle className="text-[10px] font-black text-[#903f00] uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    Investor Interest
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {interests.length === 0 ? (
                      <div className="text-center py-12 text-[#564338]/40 italic text-xs">
                        No investor interest yet. Keep building!
                      </div>
                    ) : (
                      interests.map((interest) => (
                        <div key={interest.id} className="p-4 rounded-2xl border border-[#111111]/5 bg-white shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-black text-[#1f1b12]">{interest.investorName}</p>
                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-[#903f00]/20 text-[#903f00]">
                              {interest.status}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-[#564338] line-clamp-2 mb-3 leading-relaxed">
                            "{interest.message}"
                          </p>
                          <Button variant="outline" size="sm" className="w-full text-[10px] font-black uppercase tracking-widest border-[#111111]/5 rounded-xl h-8">
                            View Profile
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 border-[#111111]/5 shadow-sm bg-[#1f1b12] text-white">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 text-[#903f00]">Investor Hub Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/60">Public Listing</span>
                    <Badge className={idea?.status === 'published' ? "bg-green-500" : "bg-red-500"}>
                      {idea?.status === 'published' ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    {idea?.status === 'published' 
                      ? "Your startup is visible to verified investors in the Investor Hub."
                      : "Publish your idea to start receiving interest from investors."}
                  </p>
                  {idea?.status !== 'published' && (
                    <Button 
                      variant="outline" 
                      className="w-full border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] h-10 rounded-xl"
                      onClick={() => updateDoc(doc(db, 'ideas', ideaId!), { status: 'published' })}
                    >
                      Go Public
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
