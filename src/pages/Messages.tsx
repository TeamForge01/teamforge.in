import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import { db, sendNotification } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  Send, 
  MessageSquare, 
  Search, 
  Video, 
  Phone, 
  MoreVertical, 
  PlusCircle, 
  Smile, 
  Sparkles,
  CheckCheck,
  ArrowLeft
} from 'lucide-react';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Messages() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'profiles'), where('uid', '!=', user.uid));
      const unsub = onSnapshot(q, (snap) => {
        setChats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedChat) {
      const chatId = [user.uid, selectedChat.uid].sort().join('_');
      const q = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        orderBy('createdAt', 'asc')
      );
      const unsub = onSnapshot(q, (snap) => {
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }
  }, [user, selectedChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedChat || !newMessage.trim()) return;

    const chatId = [user.uid, selectedChat.uid].sort().join('_');
    const text = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'messages'), {
        chatId,
        senderId: user.uid,
        receiverId: selectedChat.uid,
        text,
        createdAt: serverTimestamp()
      });

      await sendNotification(
        selectedChat.uid,
        'message',
        'New Message',
        `${user.displayName}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
        '/messages'
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fff8f1] flex overflow-hidden">
      <DashboardSidebar />
      
      <main className="flex-1 ml-64 h-screen flex flex-row overflow-hidden bg-[#fff8f1]">
        {/* Conversation List (Left Panel) */}
        <section className="w-[400px] flex flex-col bg-[#f6edde]/50 relative z-10 border-r border-[#111111]/5">
          <div className="px-8 pt-12 pb-8">
            <h2 className="text-4xl font-black tracking-tighter text-[#1f1b12] mb-8">Messages</h2>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#564338]/40 group-focus-within:text-[#903f00] transition-colors w-4 h-4" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border-none rounded-2xl py-7 pl-12 pr-4 text-sm font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-[#903f00]/20 transition-all" 
                placeholder="Search conversations..." 
              />
            </div>
          </div>

          <ScrollArea className="flex-1 px-4 pb-8">
            <div className="space-y-2">
              {filteredChats.map((chat) => (
                <button
                  key={chat.uid}
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    "w-full p-5 rounded-[2rem] cursor-pointer group transition-all flex gap-4 text-left",
                    selectedChat?.uid === chat.uid 
                      ? "bg-white shadow-[0px_20px_40px_rgba(17,17,17,0.06)] border-l-4 border-[#903f00]" 
                      : "hover:bg-white/50"
                  )}
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-[#111111]/5">
                    <Avatar className="w-full h-full rounded-none">
                      <AvatarImage src={chat.photoURL} className="object-cover" />
                      <AvatarFallback className="bg-[#903f00] text-white font-black text-lg">
                        {chat.displayName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-black text-[#1f1b12] truncate tracking-tight">{chat.displayName}</h3>
                      {selectedChat?.uid === chat.uid && (
                        <span className="text-[10px] font-black text-[#903f00] uppercase tracking-widest">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-xs text-[#564338] font-bold italic opacity-60 truncate">
                      {chat.role || 'Venture Partner'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </section>

        {/* Active Chat (Right Panel) */}
        <section className="flex-1 flex flex-col bg-white relative">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <header className="h-20 px-8 flex items-center justify-between bg-white border-b border-[#111111]/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#111111]/5">
                    <Avatar className="w-full h-full rounded-none">
                      <AvatarImage src={selectedChat.photoURL} className="object-cover" />
                      <AvatarFallback className="bg-[#903f00] text-white font-black text-sm">
                        {selectedChat.displayName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h2 className="font-black text-lg text-[#1f1b12] tracking-tight leading-none">{selectedChat.displayName}</h2>
                    <p className="text-[10px] font-bold text-[#903f00] uppercase tracking-widest mt-1">
                      {selectedChat.role || 'Founding Partner'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-[#fcf3e3] text-[#564338]">
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-[#fcf3e3] text-[#564338]">
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-[#fcf3e3] text-[#564338]">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </header>

              {/* Chat Content */}
              <ScrollArea className="flex-1" viewportRef={scrollRef}>
                <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
                  <div className="flex flex-col items-center">
                    <div className="px-4 py-1 bg-[#fcf3e3] rounded-full text-[10px] font-black text-[#903f00] uppercase tracking-widest">
                      Conversation Started
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {messages.map((msg, i) => {
                      const isMe = msg.senderId === user?.uid;
                      const showAvatar = i === 0 || messages[i-1].senderId !== msg.senderId;

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "flex gap-4 group",
                            isMe ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-[#111111]/5 mt-1">
                            {showAvatar ? (
                              <Avatar className="w-full h-full rounded-none">
                                <AvatarImage src={isMe ? user?.photoURL : selectedChat.photoURL} />
                                <AvatarFallback className={cn(
                                  "text-[10px] font-black",
                                  isMe ? "bg-[#1f1b12] text-white" : "bg-[#903f00] text-white"
                                )}>
                                  {(isMe ? user?.displayName : selectedChat.displayName)?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            ) : <div className="w-full h-full" />}
                          </div>
                          
                          <div className={cn(
                            "flex flex-col gap-1.5 max-w-[80%]",
                            isMe ? "items-end" : "items-start"
                          )}>
                            <div className={cn(
                              "px-6 py-4 rounded-3xl text-sm font-bold leading-relaxed transition-all",
                              isMe 
                                ? "bg-[#1f1b12] text-white shadow-lg shadow-[#1f1b12]/5" 
                                : "bg-[#fcf3e3] text-[#1f1b12]"
                            )}>
                              <p>{msg.text}</p>
                            </div>
                            <div className={cn(
                              "flex items-center gap-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity",
                              isMe ? "flex-row-reverse" : "flex-row"
                            )}>
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#564338]/40">
                                {msg.createdAt ? format(msg.createdAt.toDate(), 'h:mm a') : '...'}
                              </span>
                              {isMe && <CheckCheck className="w-3 h-3 text-[#903f00]" />}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* AI Context Indicator */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center pt-8"
                  >
                    <div className="bg-white border border-[#903f00]/10 px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm">
                      <Sparkles className="w-4 h-4 text-[#903f00] fill-[#903f00]" />
                      <span className="text-[10px] font-black text-[#903f00] uppercase tracking-[0.2em]">Contextual Synthesis Active</span>
                    </div>
                  </motion.div>
                </div>
              </ScrollArea>

              {/* Message Input - Gemini Style */}
              <footer className="p-6 bg-white">
                <div className="max-w-3xl mx-auto">
                  <form 
                    onSubmit={handleSendMessage}
                    className="relative bg-[#fcf3e3]/50 rounded-[2rem] border border-[#111111]/5 focus-within:border-[#903f00]/20 focus-within:bg-white transition-all p-2"
                  >
                    <div className="flex items-end gap-2">
                      <Button type="button" variant="ghost" size="icon" className="w-12 h-12 rounded-full text-[#564338] hover:text-[#903f00] hover:bg-[#fcf3e3]">
                        <PlusCircle className="w-6 h-6" />
                      </Button>
                      <textarea 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e as any);
                          }
                        }}
                        rows={1}
                        className="flex-1 bg-transparent border-none focus:ring-0 py-3.5 text-[#1f1b12] text-base font-bold placeholder:text-[#564338]/40 resize-none min-h-[48px] max-h-[200px]" 
                        placeholder="Message your partner..." 
                      />
                      <div className="flex items-center gap-1">
                        <Button type="button" variant="ghost" size="icon" className="w-12 h-12 rounded-full text-[#564338] hover:text-[#903f00] hover:bg-[#fcf3e3]">
                          <Smile className="w-6 h-6" />
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={!newMessage.trim()}
                          className="w-12 h-12 bg-[#1f1b12] hover:bg-[#903f00] text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all shrink-0"
                        >
                          <Send className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </form>
                  <p className="text-center mt-3 text-[9px] font-black text-[#564338]/30 uppercase tracking-[0.2em]">
                    TeamForge uses AI to enhance your collaboration
                  </p>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#fff8f1]/30">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-24 h-24 bg-white rounded-[3rem] flex items-center justify-center mx-auto shadow-xl border border-[#111111]/5">
                  <MessageSquare className="w-10 h-10 text-[#903f00]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#1f1b12] tracking-tight">Select a conversation</h3>
                  <p className="text-sm text-[#564338] font-bold italic opacity-40 mt-2">Start forging connections with other founders.</p>
                </div>
              </motion.div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
