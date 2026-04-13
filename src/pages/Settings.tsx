import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { Button } from '../components/ui/button';
import { useSidebar } from '../components/SidebarContext';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Eye, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Camera,
  Globe,
  Smartphone,
  CreditCard,
  Mail,
  Check,
  Search,
  MessageSquare,
  Users,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Settings() {
  const { user, profile, userData } = useAuth();
  const { isOpen } = useSidebar();
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    website: profile?.website || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'profiles', user.uid), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      toast.success("Settings updated successfully!");
    } catch (error) {
      console.error("Update settings error:", error);
      toast.error("Failed to update settings.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f1] flex">
      <DashboardSidebar />
      
      <main className="flex-1 lg:ml-64 p-12 transition-all duration-300">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-black text-[#1f1b12] tracking-tight mb-2">Settings</h1>
            <p className="text-[#564338] font-bold italic opacity-60">Manage your account, privacy, and preferences.</p>
          </header>

          <div className="grid grid-cols-12 gap-12">
            {/* Sidebar Tabs */}
            <aside className="col-span-12 lg:col-span-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group",
                    activeTab === tab.id 
                      ? "bg-white text-[#903f00] shadow-sm translate-x-1" 
                      : "text-[#564338] hover:text-[#1f1b12] hover:bg-white/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-[#903f00]" : "text-[#564338] group-hover:text-[#1f1b12]")} />
                    <span className="text-sm font-bold">{tab.label}</span>
                  </div>
                  <ChevronRight className={cn("w-4 h-4 transition-transform", activeTab === tab.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100")} />
                </button>
              ))}
              
              <div className="pt-8 mt-8 border-t border-[#111111]/5">
                <button className="w-full flex items-center gap-3 px-6 py-4 text-rose-600 hover:bg-rose-50 rounded-2xl transition-all font-bold text-sm">
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </div>
            </aside>

            {/* Content Area */}
            <div className="col-span-12 lg:col-span-8">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-[#111111]/5"
              >
                {activeTab === 'account' && (
                  <div className="space-y-10">
                    <div className="flex items-center gap-8 pb-10 border-b border-[#111111]/5">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-[2rem] bg-[#fcf3e3] overflow-hidden border-4 border-white shadow-lg">
                          {profile?.photoURL ? (
                            <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl font-black text-[#903f00]">
                              {profile?.displayName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 bg-[#1f1b12] text-white p-2 rounded-xl shadow-lg hover:bg-[#903f00] transition-colors">
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#1f1b12]">Profile Photo</h3>
                        <p className="text-sm text-[#564338] font-bold italic opacity-60">Update your avatar for the studio.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#564338]/40 ml-2">Display Name</label>
                        <Input 
                          name="displayName"
                          value={formData.displayName} 
                          onChange={handleInputChange}
                          className="bg-[#fcf3e3]/30 border-none h-12 rounded-xl font-bold" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#564338]/40 ml-2">Username</label>
                        <Input 
                          name="username"
                          value={formData.username} 
                          onChange={handleInputChange}
                          className="bg-[#fcf3e3]/30 border-none h-12 rounded-xl font-bold" 
                        />
                      </div>
                      <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#564338]/40 ml-2">Bio</label>
                        <Textarea 
                          name="bio"
                          value={formData.bio} 
                          onChange={handleInputChange}
                          className="bg-[#fcf3e3]/30 border-none rounded-xl font-bold min-h-[100px] resize-none" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#564338]/40 ml-2">Email Address</label>
                        <Input defaultValue={user?.email || ''} disabled className="bg-[#fcf3e3]/10 border-none h-12 rounded-xl font-bold opacity-60" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#564338]/40 ml-2">Website</label>
                        <Input 
                          name="website"
                          value={formData.website} 
                          onChange={handleInputChange}
                          placeholder="https://yourportfolio.com" 
                          className="bg-[#fcf3e3]/30 border-none h-12 rounded-xl font-bold" 
                        />
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button onClick={handleSave} className="bg-[#1f1b12] text-white hover:bg-[#903f00] px-10 py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#1f1b12]/10">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-8">
                    <h3 className="text-2xl font-black text-[#1f1b12] mb-8">Privacy Settings</h3>
                    <div className="space-y-6">
                      {[
                        { label: 'Private Profile', desc: 'Only approved connections can see your full profile.', icon: Lock },
                        { label: 'Show Online Status', desc: 'Allow others to see when you are active in the studio.', icon: Globe },
                        { label: 'Read Receipts', desc: 'Let others know when you have read their messages.', icon: Check },
                        { label: 'Discoverable', desc: 'Allow your profile to be shown in the "Founders" discovery hub.', icon: Search },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-[#fcf3e3]/30 rounded-2xl border border-[#111111]/5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <item.icon className="w-5 h-5 text-[#903f00]" />
                            </div>
                            <div>
                              <p className="font-black text-[#1f1b12]">{item.label}</p>
                              <p className="text-xs text-[#564338] font-bold italic opacity-60">{item.desc}</p>
                            </div>
                          </div>
                          <div className="w-12 h-6 bg-[#903f00] rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <h3 className="text-2xl font-black text-[#1f1b12] mb-8">Notification Preferences</h3>
                    <div className="space-y-6">
                      {[
                        { label: 'Email Notifications', desc: 'Receive updates about your ideas and connections via email.', icon: Mail },
                        { label: 'Push Notifications', desc: 'Get real-time alerts on your device.', icon: Smartphone },
                        { label: 'Message Alerts', desc: 'Notifications for new direct messages.', icon: MessageSquare },
                        { label: 'Team Activity', desc: 'Updates from your project workspaces.', icon: Users },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-[#fcf3e3]/30 rounded-2xl border border-[#111111]/5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <item.icon className="w-5 h-5 text-[#903f00]" />
                            </div>
                            <div>
                              <p className="font-black text-[#1f1b12]">{item.label}</p>
                              <p className="text-xs text-[#564338] font-bold italic opacity-60">{item.desc}</p>
                            </div>
                          </div>
                          <div className="w-12 h-6 bg-[#eae1d3] rounded-full relative cursor-pointer">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-10">
                    <h3 className="text-2xl font-black text-[#1f1b12] mb-8">Security & Login</h3>
                    <div className="space-y-8">
                      <div className="p-8 bg-[#fcf3e3]/30 rounded-[2rem] border border-[#111111]/5 space-y-6">
                        <h4 className="font-black text-[#1f1b12] flex items-center gap-2">
                          <Lock className="w-4 h-4 text-[#903f00]" />
                          Change Password
                        </h4>
                        <div className="space-y-4">
                          <Input type="password" placeholder="Current Password" className="bg-white border-none h-12 rounded-xl font-bold" />
                          <Input type="password" placeholder="New Password" className="bg-white border-none h-12 rounded-xl font-bold" />
                          <Input type="password" placeholder="Confirm New Password" className="bg-white border-none h-12 rounded-xl font-bold" />
                        </div>
                        <Button className="bg-[#1f1b12] text-white hover:bg-[#903f00] rounded-xl font-bold text-xs uppercase tracking-widest px-8 py-4">
                          Update Password
                        </Button>
                      </div>

                      <div className="p-8 bg-rose-50 rounded-[2rem] border border-rose-100 space-y-4">
                        <h4 className="font-black text-rose-600 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Danger Zone
                        </h4>
                        <p className="text-sm text-rose-600/70 font-bold italic">Once you delete your account, there is no going back. Please be certain.</p>
                        <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest px-8 py-4">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing and Help tabs would follow similar patterns */}
                {(activeTab === 'billing' || activeTab === 'help') && (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-[#fcf3e3] rounded-full flex items-center justify-center mx-auto">
                      <Sparkles className="w-10 h-10 text-[#903f00]" />
                    </div>
                    <h3 className="text-2xl font-black text-[#1f1b12]">Coming Soon</h3>
                    <p className="text-[#564338] font-bold italic opacity-60">This feature is currently being forged in our digital atelier.</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
