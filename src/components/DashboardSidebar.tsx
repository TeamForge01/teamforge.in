import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Search, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut,
  Plus,
  Home,
  MessageSquare,
  BookOpen,
  Briefcase,
  ShieldCheck,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';
import { Logo } from './Logo';
import { Button } from './ui/button';
import { useAuth } from './AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '../lib/utils';
import { useSidebar } from './SidebarContext';

export const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen, toggle, close } = useSidebar();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Sparkles, label: 'Create', path: '/create-idea' },
    { icon: ShieldCheck, label: 'Validation', path: '/validate' },
    { icon: BookOpen, label: 'Learning', path: '/learning' },
    { icon: Search, label: 'The Forge', path: '/hub' },
    { icon: Users, label: 'Founders', path: '/founders' },
    { icon: Briefcase, label: 'Investors', path: '/investor-hub' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Toggle Button (Mobile & Closed Desktop) */}
      <button
        onClick={toggle}
        className={cn(
          "fixed top-6 left-6 z-50 p-3 bg-white rounded-2xl shadow-xl border border-[#111111]/5 text-[#1f1b12] transition-all duration-300 hover:bg-[#fcf3e3] lg:hidden",
          isOpen && "opacity-0 pointer-events-none"
        )}
      >
        <Menu className="w-6 h-6" />
      </button>

      <aside 
        className={cn(
          "h-screen w-64 fixed left-0 top-0 bg-[#f6edde] border-r border-[#111111]/5 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
          !isOpen && "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo showText={false} className="scale-75" />
            <div>
              <h1 className="text-lg font-bold text-[#1f1b12] leading-none">Team Forge</h1>
              <p className="text-[10px] text-[#564338] tracking-widest uppercase mt-1 font-bold">Founder Studio</p>
            </div>
          </div>
          <button 
            onClick={close}
            className="p-2 hover:bg-white/50 rounded-xl text-[#564338] lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
          <Link to="/create-idea" className="block mb-6" onClick={() => window.innerWidth < 1024 && close()}>
            <Button className="w-full bg-[#903f00] text-white py-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#903f00]/20 hover:bg-[#b45309] transition-all active:scale-95">
              <Plus className="w-4 h-4" />
              <span className="font-bold">New Project</span>
            </Button>
          </Link>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && close()}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                    isActive 
                      ? "bg-white text-[#903f00] shadow-sm translate-x-1" 
                      : "text-[#564338] hover:text-[#1f1b12] hover:bg-white/50"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-[#903f00]" : "text-[#564338] group-hover:text-[#1f1b12]")} />
                  <span className="text-sm font-bold">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-[#111111]/5 space-y-2">
          <Link 
            to="/support" 
            onClick={() => window.innerWidth < 1024 && close()}
            className="flex items-center gap-3 px-4 py-2 text-[#564338] hover:text-[#1f1b12] transition-all group"
          >
            <HelpCircle className="w-5 h-5 group-hover:text-[#1f1b12]" />
            <span className="text-sm font-bold">Support</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-[#564338] hover:text-[#ba1a1a] transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:text-[#ba1a1a]" />
            <span className="text-sm font-bold">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
