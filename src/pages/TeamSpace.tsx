import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  Plus, 
  Trash2, 
  Clock, 
  User, 
  ArrowLeft,
  Loader2,
  Save,
  MoreVertical,
  UserPlus,
  Mail,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { cn } from '../lib/utils';
import { useSidebar } from '../components/SidebarContext';

export default function TeamSpace() {
  const { ideaId } = useParams();
  const { user, profile } = useAuth();
  const { isOpen } = useSidebar();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);

  useEffect(() => {
    if (ideaId && user) {
      const fetchIdea = async () => {
        const docSnap = await getDoc(doc(db, 'ideas', ideaId));
        if (docSnap.exists()) {
          const ideaData = docSnap.data();
          setIdea({ id: docSnap.id, ...ideaData });
        }
        setLoading(false);
      };
      fetchIdea();

      const tasksQuery = query(collection(db, 'tasks'), where('ideaId', '==', ideaId), orderBy('createdAt', 'desc'));
      const unsubTasks = onSnapshot(tasksQuery, (snap) => {
        setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      const notesQuery = query(collection(db, 'notes'), where('ideaId', '==', ideaId), orderBy('updatedAt', 'desc'));
      const unsubNotes = onSnapshot(notesQuery, (snap) => {
        setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      const membersQuery = query(collection(db, 'teamMembers'), where('ideaId', '==', ideaId));
      const unsubMembers = onSnapshot(membersQuery, (snap) => {
        setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      const requestsQuery = query(collection(db, 'joinRequests'), where('ideaId', '==', ideaId), where('status', '==', 'pending'));
      const unsubRequests = onSnapshot(requestsQuery, (snap) => {
        setJoinRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      return () => {
        unsubTasks();
        unsubNotes();
        unsubMembers();
        unsubRequests();
      };
    }
  }, [ideaId, user]);

  const handleAddTask = async () => {
    if (!newTask.title) return;
    try {
      await addDoc(collection(db, 'tasks'), {
        ideaId,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: 'todo',
        assignedTo: user?.uid,
        assignedToName: profile?.displayName,
        createdAt: serverTimestamp()
      });
      toast.success('Task added!');
      setNewTask({ title: '', description: '', priority: 'medium' });
      setIsAddingTask(false);
    } catch (error) {
      toast.error('Failed to add task.');
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    try {
      await updateDoc(doc(db, 'tasks', taskId), { status: newStatus });
    } catch (error) {
      toast.error('Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      toast.success('Task deleted.');
    } catch (error) {
      toast.error('Failed to delete task.');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.title) return;
    try {
      await addDoc(collection(db, 'notes'), {
        ideaId,
        title: newNote.title,
        content: newNote.content,
        lastEditedBy: profile?.displayName,
        updatedAt: serverTimestamp()
      });
      toast.success('Note created!');
      setNewNote({ title: '', content: '' });
      setIsAddingNote(false);
    } catch (error) {
      toast.error('Failed to create note.');
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote) return;
    try {
      await updateDoc(doc(db, 'notes', selectedNote.id), {
        title: selectedNote.title,
        content: selectedNote.content,
        lastEditedBy: profile?.displayName,
        updatedAt: serverTimestamp()
      });
      toast.success('Note saved!');
    } catch (error) {
      toast.error('Failed to save note.');
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      await addDoc(collection(db, 'teamMembers'), {
        ideaId,
        email: inviteEmail,
        status: 'invited',
        role: 'member',
        invitedAt: serverTimestamp()
      });

      // Send notification (In a real app, this might be an email, but here we use our internal system)
      // We don't have the userId for an email-only invite yet, so we'll skip the internal notification 
      // unless we find a user with that email. For now, we'll just log it.
      console.log(`Invitation sent to ${inviteEmail}`);
      
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (error) {
      toast.error('Failed to send invitation.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateJoinRequest = async (requestId: string, applicantId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'joinRequests', requestId), {
        status,
        updatedAt: serverTimestamp()
      });

      if (status === 'accepted') {
        // Add to team members
        const applicantSnap = await getDoc(doc(db, 'profiles', applicantId));
        const applicantData = applicantSnap.data();
        
        await addDoc(collection(db, 'teamMembers'), {
          ideaId,
          uid: applicantId,
          email: applicantData?.email || '',
          displayName: applicantData?.displayName || 'Unknown',
          status: 'active',
          role: 'member',
          joinedAt: serverTimestamp()
        });
      }

      // Send notification to applicant
      const message = status === 'accepted' 
        ? `Your request to join "${idea?.title}" has been accepted!` 
        : `Your request to join "${idea?.title}" was declined.`;
      
      await addDoc(collection(db, 'notifications'), {
        userId: applicantId,
        type: 'team',
        title: status === 'accepted' ? 'Request Accepted' : 'Request Declined',
        message,
        link: `/idea/${ideaId}`,
        read: false,
        createdAt: serverTimestamp()
      });

      toast.success(`Request ${status}.`);
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error('Failed to update request.');
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#fff8f1] flex">
      <DashboardSidebar />
      
      <main className="flex-1 lg:ml-64 p-6 md:p-10 h-screen flex flex-col transition-all duration-300">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="text-[#564338]/60 hover:text-[#903f00] font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-black text-[#1f1b12]">{idea?.title} <span className="text-[#903f00]">Team Space</span></h1>
              <p className="text-[10px] font-bold text-[#564338]/40 uppercase tracking-widest">Collaborative Workspace</p>
            </div>
          </div>
        </header>

        <Tabs defaultValue="tasks" className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="bg-[#fcf3e3] p-1 rounded-2xl mb-8 self-start">
            <TabsTrigger value="tasks" className="rounded-xl data-[state=active]:bg-[#1f1b12] data-[state=active]:text-white font-bold px-8 py-3">
              <CheckSquare className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="notes" className="rounded-xl data-[state=active]:bg-[#1f1b12] data-[state=active]:text-white font-bold px-8 py-3">
              <FileText className="w-4 h-4 mr-2" />
              Shared Notes
            </TabsTrigger>
            <TabsTrigger value="members" className="rounded-xl data-[state=active]:bg-[#1f1b12] data-[state=active]:text-white font-bold px-8 py-3">
              <Users className="w-4 h-4 mr-2" />
              Team
            </TabsTrigger>
            {joinRequests.length > 0 && (
              <TabsTrigger value="requests" className="rounded-xl data-[state=active]:bg-[#1f1b12] data-[state=active]:text-white font-bold px-8 py-3 relative">
                <UserPlus className="w-4 h-4 mr-2" />
                Requests
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#903f00] text-white text-[10px] rounded-full flex items-center justify-center border-2 border-[#fff8f1]">
                  {joinRequests.length}
                </span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="tasks" className="flex-1 flex flex-col min-h-0 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1f1b12]">Team Roadmap</h2>
              <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
                <DialogTrigger asChild>
                  <Button className="bg-[#903f00] text-white hover:bg-[#b45309] rounded-xl font-bold shadow-lg shadow-[#903f00]/20">
                    <Plus className="w-4 h-4 mr-2" />
                    New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#fff8f1] border-none rounded-[2rem] shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-[#1f1b12]">Create Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input 
                      placeholder="Task title" 
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                      className="bg-white border-none rounded-xl shadow-sm focus-visible:ring-[#903f00]"
                    />
                    <Textarea 
                      placeholder="Description (optional)" 
                      value={newTask.description}
                      onChange={e => setNewTask({...newTask, description: e.target.value})}
                      className="bg-white border-none rounded-xl shadow-sm focus-visible:ring-[#903f00]"
                    />
                    <div className="flex gap-2">
                      {['low', 'medium', 'high'].map(p => (
                        <Button
                          key={p}
                          variant={newTask.priority === p ? 'default' : 'outline'}
                          onClick={() => setNewTask({...newTask, priority: p})}
                          className={cn(
                            "flex-1 rounded-xl font-bold capitalize transition-all",
                            newTask.priority === p 
                              ? "bg-[#1f1b12] text-white shadow-md" 
                              : "bg-white border-none text-[#564338] shadow-sm hover:bg-[#fcf3e3]"
                          )}
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                    <Button onClick={handleAddTask} className="w-full bg-[#903f00] text-white h-12 rounded-xl font-bold mt-4 shadow-lg shadow-[#903f00]/20">
                      Add Task
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <ScrollArea className="flex-1">
              <div className="grid gap-4 pr-4">
                {tasks.map((task) => (
                  <Card key={task.id} className={cn(
                    "bg-white border-[#111111]/5 rounded-2xl transition-all shadow-sm",
                    task.status === 'done' ? 'opacity-50' : ''
                  )}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <Checkbox 
                        checked={task.status === 'done'} 
                        onCheckedChange={() => handleToggleTask(task.id, task.status)}
                        className="w-6 h-6 rounded-lg border-2 border-[#111111]/10 data-[state=checked]:bg-[#903f00] data-[state=checked]:border-[#903f00]"
                      />
                      <div className="flex-1">
                        <h4 className={cn(
                          "font-bold text-lg",
                          task.status === 'done' ? 'line-through text-[#564338]/40' : 'text-[#1f1b12]'
                        )}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="secondary" className={cn(
                            "text-[10px] font-bold uppercase tracking-widest border-none",
                            task.priority === 'high' ? 'bg-rose-100 text-rose-600' : 
                            task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                          )}>
                            {task.priority}
                          </Badge>
                          <span className="text-[10px] font-bold text-[#564338]/40 uppercase tracking-widest flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {task.assignedToName}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="text-[#564338]/20 hover:text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {tasks.length === 0 && (
                  <div className="text-center py-20 bg-white/30 rounded-[2rem] border border-dashed border-[#903f00]/10">
                    <CheckSquare className="w-12 h-12 text-[#903f00]/10 mx-auto mb-4" />
                    <p className="font-bold text-[#564338]/40 italic">No tasks yet. Start planning!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="notes" className="flex-1 grid md:grid-cols-3 gap-8 min-h-0">
            <div className="flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-[#1f1b12]">Brainstorming</h2>
                <Button size="icon" onClick={() => setIsAddingNote(true)} className="bg-[#1f1b12] text-white rounded-xl w-8 h-8 hover:bg-[#903f00]">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-3">
                  {notes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => {
                        setSelectedNote(note);
                        setIsAddingNote(false);
                      }}
                      className={cn(
                        "w-full p-4 rounded-2xl text-left transition-all border shadow-sm",
                        selectedNote?.id === note.id 
                          ? "bg-white border-[#903f00] shadow-md" 
                          : "bg-white/50 border-transparent hover:bg-white"
                      )}
                    >
                      <h4 className="font-bold text-[#1f1b12] mb-1">{note.title}</h4>
                      <p className="text-xs text-[#564338]/60 truncate font-medium">{note.content || 'No content yet...'}</p>
                      <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-[#903f00] uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {note.updatedAt?.toDate().toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="md:col-span-2 flex flex-col min-h-0">
              {selectedNote || isAddingNote ? (
                <Card className="bg-white border-none rounded-[2rem] shadow-2xl flex-1 flex flex-col overflow-hidden">
                  <CardHeader className="border-b border-[#111111]/5 flex flex-row items-center justify-between">
                    <div className="flex-1">
                      <Input 
                        value={isAddingNote ? newNote.title : selectedNote.title}
                        onChange={e => isAddingNote ? setNewNote({...newNote, title: e.target.value}) : setSelectedNote({...selectedNote, title: e.target.value})}
                        placeholder="Note Title"
                        className="text-2xl font-black border-none bg-transparent p-0 focus-visible:ring-0 text-[#1f1b12]"
                      />
                      <p className="text-[10px] font-bold text-[#564338]/40 uppercase tracking-widest mt-1">
                        Last edited by {isAddingNote ? profile?.displayName : selectedNote.lastEditedBy}
                      </p>
                    </div>
                    <Button 
                      onClick={isAddingNote ? handleAddNote : handleUpdateNote}
                      className="bg-[#903f00] text-white hover:bg-[#b45309] rounded-xl font-bold shadow-lg shadow-[#903f00]/20"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isAddingNote ? 'Create' : 'Save'}
                    </Button>
                  </CardHeader>
                  <CardContent className="flex-1 p-0">
                    <Textarea 
                      value={isAddingNote ? newNote.content : selectedNote.content}
                      onChange={e => isAddingNote ? setNewNote({...newNote, content: e.target.value}) : setSelectedNote({...selectedNote, content: e.target.value})}
                      placeholder="Start writing..."
                      className="w-full h-full min-h-[400px] border-none bg-transparent p-8 text-lg font-bold text-[#1f1b12] leading-relaxed focus-visible:ring-0 resize-none"
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[#564338]/20 bg-white/30 rounded-[2rem] border border-dashed border-[#903f00]/10">
                  <FileText className="w-16 h-16 mb-4" />
                  <p className="font-bold text-xl italic text-[#1f1b12]">Select a note to start brainstorming</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="members" className="flex-1 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white border-none rounded-[2rem] shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-black text-[#1f1b12]">Invite New Member</CardTitle>
                  <CardDescription className="font-bold italic">Expand your founding team.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#564338]/40" />
                      <Input 
                        placeholder="email@example.com" 
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        className="pl-12 bg-[#fcf3e3]/30 border-none rounded-xl h-12 font-bold focus-visible:ring-[#903f00]"
                      />
                    </div>
                    <Button 
                      onClick={handleInvite}
                      disabled={isInviting || !inviteEmail}
                      className="bg-[#903f00] text-white hover:bg-[#b45309] rounded-xl font-bold px-6 h-12"
                    >
                      {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4 mr-2" /> Invite</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-none rounded-[2rem] shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-black text-[#1f1b12]">Team Roster</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#fcf3e3]/30 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#903f00] rounded-full flex items-center justify-center text-white font-black">
                          {profile?.displayName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-[#1f1b12]">{profile?.displayName} (You)</p>
                          <p className="text-[10px] font-bold text-[#903f00] uppercase tracking-widest">Founder</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-600 border-none font-bold uppercase tracking-widest text-[10px]">Active</Badge>
                    </div>

                    {members.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-white border border-[#111111]/5 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#564338]/10 rounded-full flex items-center justify-center text-[#564338] font-black">
                            {member.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-[#1f1b12]">{member.email}</p>
                            <p className="text-[10px] font-bold text-[#564338]/40 uppercase tracking-widest">{member.role}</p>
                          </div>
                        </div>
                        <Badge className={cn(
                          "border-none font-bold uppercase tracking-widest text-[10px]",
                          member.status === 'invited' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                        )}>
                          {member.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="flex-1 space-y-6">
            <h2 className="text-xl font-bold text-[#1f1b12]">Join Requests</h2>
            <div className="grid gap-4">
              {joinRequests.map((req) => (
                <Card key={req.id} className="bg-white border-[#111111]/5 rounded-2xl shadow-sm overflow-hidden">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#fcf3e3] rounded-xl flex items-center justify-center text-[#903f00] font-black">
                        {req.displayName?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-[#1f1b12]">{req.displayName}</h4>
                        <p className="text-sm text-[#564338]/60 font-medium">{req.message || 'No message provided.'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleUpdateJoinRequest(req.id, req.uid, 'rejected')}
                        variant="outline" 
                        className="rounded-xl border-none bg-[#fcf3e3] text-[#564338] font-bold hover:bg-rose-50 hover:text-rose-600"
                      >
                        Decline
                      </Button>
                      <Button 
                        onClick={() => handleUpdateJoinRequest(req.id, req.uid, 'accepted')}
                        className="rounded-xl bg-[#1f1b12] text-white font-bold hover:bg-[#903f00]"
                      >
                        Accept
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {joinRequests.length === 0 && (
                <div className="text-center py-20 bg-white/30 rounded-[2rem] border border-dashed border-[#903f00]/10">
                  <UserPlus className="w-12 h-12 text-[#903f00]/10 mx-auto mb-4" />
                  <p className="font-bold text-[#564338]/40 italic">No pending requests.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}


