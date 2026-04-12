import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, deleteDoc, limit } from 'firebase/firestore';
import { Button, buttonVariants } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Bell, MessageSquare, UserPlus, CheckCircle2, XCircle, Info, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const unsub = onSnapshot(q, (snap) => {
        const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: any) => !n.read).length);
      });
      return () => unsub();
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'join_request': return <UserPlus className="w-4 h-4 text-[#B45309]" />;
      case 'request_accepted': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'request_rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative rounded-full hover:bg-[#F5ECDD]")}>
        <Bell className="w-5 h-5 text-[#111111]" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-[#B45309] text-white border-2 border-[#F5ECDD] text-[10px] font-bold">
            {unreadCount}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white border-[#111111]/5 rounded-2xl shadow-2xl mr-4" align="end">
        <div className="p-4 border-b border-[#111111]/5 flex items-center justify-between">
          <h3 className="font-black text-[#111111]">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B45309]">
              {unreadCount} New
            </span>
          )}
        </div>
        <ScrollArea className="h-80">
          <div className="divide-y divide-[#111111]/5">
            <AnimatePresence initial={false}>
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 flex gap-3 group transition-colors ${notif.read ? 'bg-transparent' : 'bg-[#F5ECDD]/30'}`}
                >
                  <div className="mt-1">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={notif.link || '#'} 
                      onClick={() => markAsRead(notif.id)}
                      className="block"
                    >
                      <p className="text-sm font-bold text-[#111111] leading-tight mb-1">{notif.title}</p>
                      <p className="text-xs text-[#111111]/60 line-clamp-2">{notif.message}</p>
                    </Link>
                    <p className="text-[9px] font-bold text-[#111111]/30 uppercase tracking-widest mt-2">
                      {notif.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteNotification(notif.id)}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            {notifications.length === 0 && (
              <div className="p-12 text-center">
                <Bell className="w-8 h-8 text-[#111111]/10 mx-auto mb-2" />
                <p className="text-sm font-bold text-[#111111]/30 italic">All caught up!</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-2 border-t border-[#111111]/5">
          <Button variant="ghost" className="w-full text-xs font-bold text-[#111111]/40 hover:text-[#B45309] rounded-xl">
            Clear All
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
