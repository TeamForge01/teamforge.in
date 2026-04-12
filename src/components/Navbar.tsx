import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import NotificationCenter from './NotificationCenter';
import { Logo } from './Logo';
import { LayoutDashboard, Search, MessageSquare, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboardRoute = location.pathname.startsWith('/dashboard') || 
                          location.pathname.startsWith('/create-idea') ||
                          location.pathname.startsWith('/hub') ||
                          location.pathname.startsWith('/messages') ||
                          location.pathname.startsWith('/profile') ||
                          location.pathname.startsWith('/idea') ||
                          location.pathname.startsWith('/founders');

  if (isDashboardRoute && user) {
    return null;
  }

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-[#fff8f1]/70 backdrop-blur-xl border-b border-[#111111]/5 z-50 px-8 flex items-center justify-between shadow-[0px_20px_40px_rgba(17,17,17,0.06)]">
      <Link to="/" className="hover:opacity-80 transition-opacity">
        <Logo className="scale-90 origin-left" />
      </Link>

      {user ? (
        <>
          <div className="hidden md:flex items-center gap-10">
            <Link to="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-[#564338] hover:text-[#903f00] transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link to="/hub" className="flex items-center gap-2 text-sm font-semibold text-[#564338] hover:text-[#903f00] transition-colors">
              <Search className="w-4 h-4" />
              Idea Hub
            </Link>
            <Link to="/messages" className="flex items-center gap-2 text-sm font-semibold text-[#564338] hover:text-[#903f00] transition-colors">
              <MessageSquare className="w-4 h-4" />
              Messages
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/create-idea">
              <Button className="hidden sm:flex bg-[#903f00] text-white hover:bg-[#b45309] rounded-xl font-bold text-xs px-4 h-9 shadow-sm transition-transform active:scale-95">
                New Idea
              </Button>
            </Link>
            <NotificationCenter />
            <Link to={`/profile/${user?.uid}`}>
              <Avatar className="w-9 h-9 border border-[#111111]/10 shadow-sm">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback className="bg-[#903f00] text-white text-xs font-bold">
                  {user?.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-[#564338]/60 hover:text-[#903f00] hover:bg-[#903f00]/5 rounded-xl">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="hidden md:flex items-center gap-10 font-headline font-semibold text-sm tracking-tight">
            <Link to="/" className="text-[#903f00] border-b-2 border-[#903f00] pb-1">Platform</Link>
            <Link to="/hub" className="text-[#564338] hover:text-[#1f1b12] transition-colors">Ideas</Link>
            <Link to="/founders" className="text-[#564338] hover:text-[#1f1b12] transition-colors">Founders</Link>
            <Link to="/pricing" className="text-[#564338] hover:text-[#1f1b12] transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-bold text-[#564338] hover:text-[#903f00] hover:bg-[#903f00]/5 rounded-xl px-6">
                Login
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-gradient-to-br from-[#903f00] to-[#b45309] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-transform active:scale-95">
                Get Started
              </Button>
            </Link>
          </div>
        </>
      )}
    </nav>
  );
}
