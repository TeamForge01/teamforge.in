import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, FirebaseUser } from '../lib/firebase';
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: any | null;
  userData: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, userData: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Explicitly set persistence
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      // Don't set loading back to true if we already have some data - helps with "fast" feel
      // though snapshots are fast from persistent cache
      let profileResolved = false;
      let userResolved = false;

      const checkDone = () => {
        if (profileResolved && userResolved) {
          setLoading(false);
        }
      };

      // Use a timeout as a fail-safe for loading screen if Firestore is slow
      // This ensures the app becomes interactive even if metadata is still syncing
      const timeout = setTimeout(() => {
        if (loading) setLoading(false);
      }, 3000); 

      const unsubscribeProfile = onSnapshot(doc(db, 'profiles', user.uid), (doc) => {
        if (doc.exists()) {
          setProfile(doc.data());
        } else {
          setProfile(null);
        }
        profileResolved = true;
        checkDone();
      }, (error) => {
        console.error("Error fetching profile:", error);
        profileResolved = true;
        checkDone();
      });

      const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        } else {
          setUserData(null);
        }
        userResolved = true;
        checkDone();
      }, (error) => {
        console.error("Error fetching user data:", error);
        userResolved = true;
        checkDone();
      });

      return () => {
        clearTimeout(timeout);
        unsubscribeProfile();
        unsubscribeUser();
      };
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
