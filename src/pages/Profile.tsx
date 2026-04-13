import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import { db, sendNotification } from '../lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, setDoc, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  MessageSquare, 
  UserPlus, 
  Settings, 
  Verified, 
  TrendingUp, 
  DraftingCompass, 
  Sprout, 
  Award,
  ArrowRight,
  Sparkles,
  Share2,
  Check,
  Loader2
} from 'lucide-react';
import { DashboardSidebar } from '../components/DashboardSidebar';
import ProjectShowcase from '../components/ProjectShowcase';
import EditProfileModal from '../components/EditProfileModal';
import { cn } from '../lib/utils';
import { useSidebar } from '../components/SidebarContext';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isOpen } = useSidebar();
  const { user: currentUser, profile: currentProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);
  const [teamsJoinedCount, setTeamsJoinedCount] = useState(0);

  const isOwnProfile = currentUser?.uid === userId;

  useEffect(() => {
    if (currentUser && isOwnProfile) {
      // Incoming connection requests
      const q = query(
        collection(db, 'connections'), 
        where('users', 'array-contains', currentUser.uid),
        where('status', '==', 'pending')
      );
      const unsub = onSnapshot(q, (snap) => {
        const requests = snap.docs
          .filter(d => d.data().users[1] === currentUser.uid) // I am the receiver
          .map(d => ({ id: d.id, ...d.data() }));
        setPendingRequests(requests);
      });

      // Incoming join requests for my ideas
      const qJoin = query(
        collection(db, 'joinRequests'),
        where('founderId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );
      const unsubJoin = onSnapshot(qJoin, (snap) => {
        setJoinRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      return () => {
        unsub();
        unsubJoin();
      };
    }
  }, [currentUser, isOwnProfile]);

  useEffect(() => {
    if (currentUser && userId) {
      const q = query(
        collection(db, 'connections'), 
        where('users', 'array-contains', currentUser.uid)
      );
      const unsub = onSnapshot(q, (snap) => {
        const connected = snap.docs.some(d => d.data().users.includes(userId) && d.data().status === 'accepted');
        setIsConnected(connected);
      });
      return () => unsub();
    }
  }, [currentUser, userId]);

  useEffect(() => {
    if (userId) {
      const fetchProfile = async () => {
        const docSnap = await getDoc(doc(db, 'profiles', userId));
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
        setLoading(false);
      };
      fetchProfile();

      const q = query(collection(db, 'ideas'), where('founderId', '==', userId));
      const unsub = onSnapshot(q, (snap) => {
        setIdeas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      // Connection count
      const qConn = query(
        collection(db, 'connections'),
        where('users', 'array-contains', userId),
        where('status', '==', 'accepted')
      );
      const unsubConn = onSnapshot(qConn, (snap) => {
        setConnectionCount(snap.size);
      });

      // Teams joined count
      const qJoined = query(
        collection(db, 'joinRequests'),
        where('userId', '==', userId),
        where('status', '==', 'accepted')
      );
      const unsubJoined = onSnapshot(qJoined, (snap) => {
        setTeamsJoinedCount(snap.size);
      });

      return () => {
        unsub();
        unsubConn();
        unsubJoined();
      };
    }
  }, [userId]);

  const handleConnect = async () => {
    if (!currentUser || !currentProfile || !userId) return;
    
    setConnecting(true);
    try {
      await addDoc(collection(db, 'connections'), {
        users: [currentUser.uid, userId],
        status: 'pending',
        createdAt: serverTimestamp()
      });

      await sendNotification(
        userId,
        'invitation',
        'New Connection Request',
        `${currentProfile.displayName} wants to connect with you.`,
        `/profile/${currentUser.uid}`
      );

      toast.success(`Connection request sent!`);
    } catch (error) {
      console.error("Connect error:", error);
      toast.error("Failed to send connection request.");
    } finally {
      setConnecting(false);
    }
  };

  const handleApproveConnection = async (requestId: string, senderId: string) => {
    try {
      await updateDoc(doc(db, 'connections', requestId), {
        status: 'accepted'
      });
      toast.success("Connection approved!");
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Failed to approve connection.");
    }
  };

  const handleApproveJoin = async (requestId: string, ideaId: string, userId: string) => {
    try {
      await updateDoc(doc(db, 'joinRequests', requestId), {
        status: 'accepted'
      });
      // Add user to team members in the idea document
      const ideaRef = doc(db, 'ideas', ideaId);
      const ideaSnap = await getDoc(ideaRef);
      if (ideaSnap.exists()) {
        const team = ideaSnap.data().team || [];
        await updateDoc(ideaRef, {
          team: [...team, userId]
        });
      }
      toast.success("Join request approved!");
    } catch (error) {
      console.error("Join approval error:", error);
      toast.error("Failed to approve join request.");
    }
  };

  const handleMessage = async () => {
    if (!currentUser || !userId) return;
    const chatId = [currentUser.uid, userId].sort().join('_');
    const convRef = doc(db, 'conversations', chatId);
    const convSnap = await getDoc(convRef);
    
    if (!convSnap.exists()) {
      await setDoc(convRef, {
        participants: [currentUser.uid, userId],
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        unreadCount: {
          [currentUser.uid]: 0,
          [userId]: 0
        }
      });
    }
    navigate('/messages', { state: { chatId } });
  };

  const handleShareProfile = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Profile link copied to clipboard!');
  };

  if (loading) return null;
  if (!profile) return <div className="p-12 text-center font-bold">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-[#fff8f1] flex">
      <DashboardSidebar />
      
      <main className="flex-1 lg:ml-64 p-6 md:p-12 transition-all duration-300">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header Section */}
          <header className="relative group">
            <div className="h-64 w-full rounded-3xl overflow-hidden bg-[#eae1d3] relative">
              <img 
                src={profile.coverURL || "https://picsum.photos/seed/studio/1200/400"} 
                alt="Studio background" 
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f1b12]/40 to-transparent"></div>
            </div>
            
            <div className="absolute -bottom-16 left-12 flex items-end gap-8">
              <div className="relative">
                <Avatar className="h-40 w-40 rounded-[2rem] border-8 border-[#fff8f1] shadow-2xl bg-[#fcf3e3]">
                  <AvatarImage src={profile.photoURL} />
                  <AvatarFallback className="bg-[#903f00] text-white text-4xl font-black">
                    {profile.displayName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-3 -right-3 bg-white/70 backdrop-blur-md border border-[#903f00]/15 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                  <Verified className="w-4 h-4 text-[#903f00]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#903f00]">Pro</span>
                </div>
              </div>
              
              <div className="pb-4 space-y-1">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <h1 className="text-4xl font-black text-[#1f1b12] tracking-tight font-headline">{profile.displayName}</h1>
                    <p className="text-sm font-bold text-[#903f00]/60">@{profile.username || 'anonymous'}</p>
                  </div>
                  <span className="bg-[#ffdbca] text-[#331200] px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                    {profile.role || 'Lead Forger'}
                  </span>
                </div>
                <p className="text-lg text-[#564338] max-w-lg font-bold italic opacity-70 leading-relaxed">
                  {profile.bio || 'Architecting the future through intentional systems and premium craftsmanship.'}
                </p>
                <p className="text-sm text-[#903f00] font-black uppercase tracking-widest mt-2">
                  Looking for: <span className="text-[#1f1b12]">{profile.lookingFor || 'Technical Co-founder'}</span>
                </p>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 flex gap-3">
              {isOwnProfile && (
                <Link to="/messages">
                  <Button className="bg-[#1f1b12] text-white hover:bg-[#903f00] rounded-2xl font-bold px-6 py-6 shadow-xl transition-all active:scale-95">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    My Inbox
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                onClick={handleShareProfile}
                className="bg-white/50 backdrop-blur-md border-none text-[#1f1b12] hover:bg-white rounded-2xl font-bold px-4 py-6 shadow-lg transition-all active:scale-95"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              {!isOwnProfile ? (
                <>
                  <Button 
                    onClick={handleMessage}
                    className="bg-[#1f1b12] text-white hover:bg-[#903f00] rounded-2xl font-bold px-6 py-6 shadow-xl transition-all active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleConnect}
                    disabled={connecting || isConnected}
                    className={cn(
                      "rounded-2xl font-bold px-6 py-6 transition-all",
                      isConnected 
                        ? "bg-emerald-500 text-white border-none hover:bg-emerald-600"
                        : "bg-white/50 backdrop-blur-md border-none text-[#1f1b12] hover:bg-white"
                    )}
                  >
                    {connecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isConnected ? (
                      <><Check className="w-4 h-4 mr-2" /> Connected</>
                    ) : (
                      <><UserPlus className="w-4 h-4 mr-2" /> Connect</>
                    )}
                  </Button>
                </>
              ) : (
                <EditProfileModal profile={{ ...profile, uid: userId }} onUpdate={(newProfile) => setProfile(newProfile)} />
              )}
            </div>
          </header>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-8">
            <div className="text-center">
              <p className="text-2xl font-black text-[#1f1b12]">{ideas.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#564338]/40">Ideas Created</p>
            </div>
            <div className="text-center border-x border-[#111111]/5">
              <p className="text-2xl font-black text-[#1f1b12]">{teamsJoinedCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#564338]/40">Teams Joined</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-[#1f1b12]">{connectionCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#564338]/40">Connections</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8 pt-8">
            {/* Left Column: Skills & Interests */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              {isOwnProfile && (pendingRequests.length > 0 || joinRequests.length > 0) && (
                <section className="bg-white p-8 rounded-[2.5rem] border-2 border-[#903f00]/20 space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#903f00] flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Pending Requests
                  </h3>
                  
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="p-4 bg-[#fcf3e3] rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-[#903f00] text-white text-[10px]">R</AvatarFallback>
                        </Avatar>
                        <p className="text-xs font-bold text-[#1f1b12]">Connection Request</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleApproveConnection(req.id, req.users[0])}
                        className="bg-[#1f1b12] hover:bg-[#903f00] text-white text-[10px] h-8 px-4 rounded-xl"
                      >
                        Approve
                      </Button>
                    </div>
                  ))}

                  {joinRequests.map((req) => (
                    <div key={req.id} className="p-4 bg-[#fcf3e3] rounded-2xl flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-[#903f00] text-white text-[10px]">J</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-black text-[#1f1b12]">Join Request</p>
                            <p className="text-[10px] font-bold text-[#564338]/60">for {req.ideaTitle}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveJoin(req.id, req.ideaId, req.userId)}
                          className="bg-[#1f1b12] hover:bg-[#903f00] text-white text-[10px] h-8 px-4 rounded-xl"
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              <section className="bg-[#fcf3e3] p-8 rounded-[2.5rem] space-y-8 border border-[#111111]/5">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#564338]/60 font-headline mb-6">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(profile.skills || ['Product Strategy', 'ML Engineering', 'Brand Identity']).map((skill: string) => (
                      <span key={skill} className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-[#1f1b12] border border-[#111111]/5 hover:bg-[#903f00] hover:text-white transition-all cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#564338]/60 font-headline mb-6">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {(profile.interests || ['Web3', 'AI', 'Sustainability']).map((interest: string) => (
                      <span key={interest} className="bg-[#1f1b12]/5 px-4 py-2 rounded-xl text-xs font-bold text-[#564338] border border-[#111111]/5">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              <section className="bg-[#111111] text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                <div className="relative z-10 space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 font-headline">Personality</h3>
                  <p className="text-lg font-bold font-headline leading-relaxed italic">
                    "{profile.personality || 'A visionary builder with a focus on high-impact systems.'}"
                  </p>
                </div>
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#903f00]/20 blur-[60px] rounded-full"></div>
              </section>
            </div>

            {/* Right Column: Ideas & Teams */}
            <div className="col-span-12 lg:col-span-8 space-y-12">
              <section>
                <div className="flex justify-between items-end mb-8">
                  <h2 className="text-3xl font-black tracking-tight font-headline text-[#1f1b12]">Ideas Created</h2>
                  <button className="text-[#903f00] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:underline">
                    View All <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ideas.map((idea) => (
                    <motion.div 
                      key={idea.id}
                      whileHover={{ y: -5 }}
                      className="bg-[#f6edde] p-8 rounded-[2.5rem] hover:shadow-xl transition-all group flex flex-col justify-between h-72 border border-[#111111]/5"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="bg-white h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm">
                            <DraftingCompass className="w-6 h-6 text-[#903f00]" />
                          </div>
                          <span className="bg-[#903f00]/10 text-[#903f00] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            {idea.stage || 'Forging'}
                          </span>
                        </div>
                        <Link to={`/idea/${idea.id}`}>
                          <h3 className="text-xl font-black font-headline group-hover:text-[#903f00] transition-colors leading-tight">
                            {idea.title}
                          </h3>
                        </Link>
                        <p className="text-[#564338] text-sm font-bold italic opacity-60 leading-relaxed line-clamp-2">
                          {idea.tagline || idea.problem}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {ideas.length === 0 && (
                    <div className="md:col-span-2 py-12 text-center bg-white rounded-[2.5rem] border border-dashed border-[#111111]/10">
                      <p className="text-[#564338]/40 font-bold italic">No ideas forged yet.</p>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-black tracking-tight font-headline text-[#1f1b12] mb-8">Teams Joined</h2>
                <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-[#111111]/10 text-center">
                  <p className="text-[#564338]/40 font-bold italic">Not part of any teams yet. Explore the Idea Hub to find your match.</p>
                  <Link to="/hub">
                    <Button className="mt-6 bg-[#1f1b12] text-white rounded-xl font-bold">Explore Hub</Button>
                  </Link>
                </div>
              </section>

              <ProjectShowcase 
                userId={userId!} 
                projects={profile.projects || []} 
                isOwnProfile={isOwnProfile} 
              />

              <section className="bg-white p-10 rounded-[2.5rem] border border-[#111111]/5 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-2xl bg-[#903f00]/5 flex items-center justify-center shrink-0">
                    <Award className="w-10 h-10 text-[#903f00]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black font-headline mb-1 text-[#1f1b12]">Suggested Startups</h4>
                    <p className="text-[#564338] text-sm font-bold italic opacity-60 leading-relaxed">
                      {profile.recommendations || 'Based on your profile, you should look for early-stage SaaS or AI-driven platforms.'}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
