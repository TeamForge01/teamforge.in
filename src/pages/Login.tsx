import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { Logo } from '../components/Logo';
import { Chrome } from 'lucide-react';

export default function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F5ECDD] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[40px] p-12 shadow-2xl border border-[#111111]/5 text-center"
      >
        <Logo className="justify-center mb-10 scale-125" showText={false} />
        <h1 className="font-serif text-4xl font-black text-[#111111] mb-4">WELCOME BACK</h1>
        <p className="text-[#111111]/60 font-medium mb-10">
          Sign in to continue forging your startup journey.
        </p>

        <Button 
          onClick={handleLogin}
          className="w-full h-14 bg-[#111111] text-white hover:bg-[#111111]/90 rounded-full text-lg font-bold flex items-center justify-center gap-3"
        >
          <Chrome className="w-5 h-5" />
          Continue with Google
        </Button>

        <p className="mt-8 text-[10px] font-bold text-[#111111]/30 uppercase tracking-widest leading-relaxed">
          By continuing, you agree to TeamForge's <br />
          <a href="#" className="underline hover:text-[#B45309]">Terms of Service</a> and <a href="#" className="underline hover:text-[#B45309]">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
