import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Award, 
  Search, 
  Sparkles, 
  ChevronRight, 
  Rocket, 
  Palette, 
  Code, 
  TrendingUp,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  X,
  Maximize2,
  Minimize2,
  Map,
  Trophy,
  Lock
} from 'lucide-react';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { cn } from '../lib/utils';
import { useAuth } from '../components/AuthContext';
import { chatWithLearningAssistant } from '../lib/gemini';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'sonner';

const LEARNING_PATHS = [
  {
    id: 'path-1',
    title: 'Startup Essentials: MVP to Launch',
    description: 'Master the core skills needed to take an idea from concept to a validated MVP.',
    category: 'Startup Essentials',
    courses: ['1', '2', '6'],
    badge: { id: 'badge-mvp', name: 'MVP Architect', icon: Rocket }
  },
  {
    id: 'path-2',
    title: 'Creative Growth: Content & Design',
    description: 'Learn how to build a brand and drive growth through creative content.',
    category: 'Creative Skills',
    courses: ['3', '4'],
    badge: { id: 'badge-creative', name: 'Creative Catalyst', icon: Palette }
  },
  {
    id: 'path-3',
    title: 'Technical Founder: No-Code & AI',
    description: 'Build complex applications without deep coding knowledge using modern tools.',
    category: 'Technical Skills',
    courses: ['5', '6', '7'],
    badge: { id: 'badge-tech', name: 'No-Code Ninja', icon: Code }
  }
];

const COURSES = [
  {
    id: '1',
    category: 'Startup Essentials',
    title: 'MVP Building for Beginners',
    duration: '12 min',
    instructor: 'Startup School',
    thumbnail: 'https://picsum.photos/seed/startup/800/450',
    tags: ['MVP', 'Lean Startup'],
    completed: true,
    youtubeId: 'ZRj6S767XvU'
  },
  {
    id: '2',
    category: 'Startup Essentials',
    title: 'Customer Discovery Masterclass',
    duration: '15 min',
    instructor: 'Y Combinator',
    thumbnail: 'https://picsum.photos/seed/customer/800/450',
    tags: ['Discovery', 'Validation'],
    youtubeId: 'MT4Ig2uqjTc'
  },
  {
    id: '3',
    category: 'Creative Skills',
    title: 'Short-Form Video Strategy 2026',
    duration: '10 min',
    instructor: 'Content Lab',
    thumbnail: 'https://picsum.photos/seed/video/800/450',
    tags: ['TikTok', 'Reels', 'CapCut'],
    youtubeId: '8p_f9X0m8pE'
  },
  {
    id: '4',
    category: 'Creative Skills',
    title: 'Thumbnail Design with AI',
    duration: '8 min',
    instructor: 'Design Forge',
    thumbnail: 'https://picsum.photos/seed/design/800/450',
    tags: ['AI', 'Design'],
    youtubeId: 'uD4izuPDyXw'
  },
  {
    id: '5',
    category: 'Technical Skills',
    title: 'Building with Bubble & Webflow',
    duration: '20 min',
    instructor: 'NoCode Academy',
    thumbnail: 'https://picsum.photos/seed/nocode/800/450',
    tags: ['No-Code', 'Webflow'],
    youtubeId: 'c8_vS_M8o_w'
  },
  {
    id: '6',
    category: 'Technical Skills',
    title: 'AI Prompt Engineering for Founders',
    duration: '14 min',
    instructor: 'AI Studio',
    thumbnail: 'https://picsum.photos/seed/prompt/800/450',
    tags: ['AI', 'Prompts'],
    youtubeId: 'jC4v5AS4RIM'
  },
  {
    id: '7',
    category: 'Trending 2026',
    title: 'Agentic AI: The Next Frontier',
    duration: '18 min',
    instructor: 'Future Tech',
    thumbnail: 'https://picsum.photos/seed/agent/800/450',
    tags: ['Agents', 'Automation'],
    youtubeId: 'V_vj8V_vj8V' // Placeholder
  },
  {
    id: '8',
    category: 'Trending 2026',
    title: 'Solopreneur Tools for 2026',
    duration: '12 min',
    instructor: 'Solo Forge',
    thumbnail: 'https://picsum.photos/seed/solo/800/450',
    tags: ['Tools', 'Productivity'],
    youtubeId: 'V_vj8V_vj8V' // Placeholder
  }
];

const CATEGORIES = [
  { name: 'Startup Essentials', icon: Rocket, color: 'text-[#903f00]', bg: 'bg-[#fcf3e3]' },
  { name: 'Creative Skills', icon: Palette, color: 'text-rose-600', bg: 'bg-rose-50' },
  { name: 'Technical Skills', icon: Code, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Trending 2026', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

export default function LearningHub() {
  const { user, profile } = useAuth();
  const [view, setView] = useState<'courses' | 'paths'>('courses');
  const [selectedCategory, setSelectedCategory] = useState('Startup Essentials');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedPath, setSelectedPath] = useState<any>(null);
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([
    { role: 'model', content: "Hi! I'm your AI Learning Assistant. What skills are you looking to develop today?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filteredCourses = COURSES.filter(course => 
    course.category === selectedCategory &&
    (course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     course.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMsg = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const history = chatMessages.map(m => ({
        role: m.role === 'model' ? 'assistant' as const : 'user' as const,
        content: m.content
      }));

      const userContext = {
        role: profile?.role || 'Founder',
        skills: profile?.skills || [],
        knowledgeGaps: profile?.knowledgeGaps || [],
        lastValidationScore: 'N/A',
        currentCourse: selectedCourse ? {
          title: selectedCourse.title,
          category: selectedCourse.category,
          instructor: selectedCourse.instructor
        } : null,
        currentPath: selectedPath ? selectedPath.title : null
      };

      const response = await chatWithLearningAssistant([...history, { role: 'user', content: userMsg }], userContext);
      setChatMessages(prev => [...prev, { role: 'model', content: response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const markCourseComplete = async (courseId: string) => {
    if (!user || !profile) return;
    if (profile.completedCourses?.includes(courseId)) return;

    try {
      await updateDoc(doc(db, 'profiles', user.uid), {
        completedCourses: arrayUnion(courseId)
      });
      toast.success("Course marked as complete!");

      // Check for path completion
      const completedCourses = [...(profile.completedCourses || []), courseId];
      LEARNING_PATHS.forEach(async (path) => {
        const isPathComplete = path.courses.every(id => completedCourses.includes(id));
        if (isPathComplete && !profile.badges?.includes(path.badge.id)) {
          await updateDoc(doc(db, 'profiles', user.uid), {
            badges: arrayUnion(path.badge.id)
          });
          toast.success(`Congratulations! You've earned the ${path.badge.name} badge!`, {
            icon: <Trophy className="w-5 h-5 text-yellow-500" />
          });
        }
      });
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  const getPathProgress = (path: any) => {
    if (!profile?.completedCourses) return 0;
    const completedInPath = path.courses.filter((id: string) => profile.completedCourses.includes(id));
    return Math.round((completedInPath.length / path.courses.length) * 100);
  };

  return (
    <div className="min-h-screen bg-[#fff8f1] flex">
      <DashboardSidebar />
      
      <main className="flex-1 ml-64 p-10 flex flex-col h-screen overflow-hidden">
        <header className="mb-10 shrink-0">
          <div className="flex justify-between items-end">
            <div>
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-bold text-[10px] uppercase tracking-[0.2em] text-[#903f00] mb-4 block"
              >
                Knowledge Forge
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl font-black text-[#1f1b12] tracking-tight leading-none"
              >
                Comprehensive <span className="text-[#903f00]">Learning Hub</span>
              </motion.h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white px-6 py-3 rounded-2xl border border-[#111111]/5 shadow-sm flex items-center gap-3">
                <Award className="w-5 h-5 text-[#903f00]" />
                <div>
                  <p className="text-[10px] font-bold text-[#564338] uppercase tracking-widest">Badges Earned</p>
                  <p className="text-lg font-black text-[#1f1b12]">{profile?.badges?.length || 0} / {LEARNING_PATHS.length}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center gap-4 mb-8 shrink-0">
          <button 
            onClick={() => setView('courses')}
            className={cn(
              "px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2",
              view === 'courses' ? "bg-[#1f1b12] text-white shadow-lg" : "bg-white text-[#564338] hover:bg-white/80"
            )}
          >
            <BookOpen className="w-4 h-4" />
            All Courses
          </button>
          <button 
            onClick={() => setView('paths')}
            className={cn(
              "px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2",
              view === 'paths' ? "bg-[#1f1b12] text-white shadow-lg" : "bg-white text-[#564338] hover:bg-white/80"
            )}
          >
            <Map className="w-4 h-4" />
            Learning Paths
          </button>
        </div>

        <div className="flex-1 flex gap-10 min-h-0 overflow-hidden">
          {/* Left Column: Course Library */}
          <div className="flex-1 flex flex-col min-h-0">
            {view === 'courses' ? (
              <>
                <div className="flex items-center gap-4 mb-8 shrink-0">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#564338]/40" />
                    <Input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search courses, skills, or topics..."
                      className="pl-12 bg-white border-none rounded-2xl h-14 font-bold text-[#1f1b12] shadow-sm focus-visible:ring-[#903f00]"
                    />
                  </div>
                  <div className="flex gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={cn(
                          "p-3 rounded-2xl transition-all duration-300 flex items-center gap-2",
                          selectedCategory === cat.name 
                            ? cn(cat.bg, cat.color, "shadow-sm ring-1 ring-current")
                            : "bg-white text-[#564338] hover:bg-white/80"
                        )}
                      >
                        <cat.icon className="w-5 h-5" />
                        <span className="text-xs font-black whitespace-nowrap">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar">
                  {selectedCourse ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      <Button 
                        variant="ghost" 
                        onClick={() => setSelectedCourse(null)}
                        className="text-[#564338]/60 hover:text-[#903f00] font-bold"
                      >
                        <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                        Back to Library
                      </Button>
                      
                      <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-black">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${selectedCourse.youtubeId}?autoplay=1`}
                          title={selectedCourse.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      
                      <div className="bg-white p-10 rounded-[2.5rem] border border-[#111111]/5 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#903f00] mb-2 block">{selectedCourse.category}</span>
                            <h2 className="text-3xl font-black text-[#1f1b12]">{selectedCourse.title}</h2>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <Badge className="bg-[#fcf3e3] text-[#903f00] font-black px-4 py-2 rounded-xl border-none">
                              {selectedCourse.duration}
                            </Badge>
                            {!profile?.completedCourses?.includes(selectedCourse.id) && (
                              <Button 
                                onClick={() => markCourseComplete(selectedCourse.id)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl"
                              >
                                Mark as Complete
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-[#564338] font-medium leading-relaxed mb-8">
                          In this session, we dive deep into {selectedCourse.title.toLowerCase()}. 
                          Learn the core methodologies used by top founders in 2026 to scale their visions with intentionality and precision.
                        </p>
                        <div className="flex items-center gap-4 pt-8 border-t border-[#111111]/5">
                          <div className="w-12 h-12 rounded-xl bg-[#fcf3e3] flex items-center justify-center">
                            <Award className="w-6 h-6 text-[#903f00]" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-[#1f1b12]">Instructor: {selectedCourse.instructor}</p>
                            <p className="text-[10px] font-bold text-[#564338]/40 uppercase tracking-widest">Verified Expert</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredCourses.map((course) => (
                        <motion.div
                          key={course.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => setSelectedCourse(course)}
                          className="group bg-white rounded-[2rem] border border-[#111111]/5 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer"
                        >
                        <div className="relative aspect-video overflow-hidden">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-500">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl transform scale-50 group-hover:scale-100 transition-transform duration-500">
                              <Play className="w-6 h-6 text-[#903f00] fill-[#903f00] ml-1" />
                            </div>
                          </div>
                          {(course.completed || profile?.completedCourses?.includes(course.id)) && (
                            <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg">
                              <CheckCircle2 className="w-3 h-3" /> COMPLETED
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#903f00]">{course.category}</span>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-[#564338]/60">
                              <Clock className="w-3 h-3" /> {course.duration}
                            </div>
                          </div>
                          <h3 className="text-lg font-black text-[#1f1b12] mb-4 group-hover:text-[#903f00] transition-colors leading-tight">
                            {course.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {course.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="bg-[#fcf3e3] text-[#903f00] text-[8px] font-black border-none">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-[10px] font-bold text-[#564338]/40 italic">by {course.instructor}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto pr-4 space-y-8 custom-scrollbar">
                {selectedPath ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedPath(null)}
                      className="text-[#564338]/60 hover:text-[#903f00] font-bold"
                    >
                      <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                      Back to Paths
                    </Button>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-[#111111]/5 shadow-sm">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <h2 className="text-4xl font-black text-[#1f1b12] mb-2">{selectedPath.title}</h2>
                          <p className="text-[#564338] font-medium max-w-2xl">{selectedPath.description}</p>
                        </div>
                        <div className="text-center">
                          <div className={cn(
                            "w-20 h-20 rounded-3xl flex items-center justify-center mb-2 shadow-lg",
                            profile?.badges?.includes(selectedPath.badge.id) ? "bg-[#903f00] text-white" : "bg-[#fcf3e3] text-[#903f00]/20"
                          )}>
                            <selectedPath.badge.icon className="w-10 h-10" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#1f1b12]">{selectedPath.badge.name}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-black text-[#1f1b12]">Path Progress</span>
                          <span className="text-sm font-black text-[#903f00]">{getPathProgress(selectedPath)}%</span>
                        </div>
                        <Progress value={getPathProgress(selectedPath)} className="h-3 bg-[#fcf3e3]" />
                      </div>

                      <div className="mt-12 space-y-4">
                        <h3 className="text-xl font-black text-[#1f1b12] mb-6">Curriculum</h3>
                        {selectedPath.courses.map((courseId: string, index: number) => {
                          const course = COURSES.find(c => c.id === courseId);
                          const isCompleted = profile?.completedCourses?.includes(courseId);
                          const isLocked = index > 0 && !profile?.completedCourses?.includes(selectedPath.courses[index - 1]);

                          return (
                            <div 
                              key={courseId}
                              className={cn(
                                "flex items-center justify-between p-6 rounded-2xl border transition-all",
                                isCompleted ? "bg-emerald-50 border-emerald-100" : "bg-white border-[#111111]/5",
                                isLocked && "opacity-50 grayscale pointer-events-none"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center font-black",
                                  isCompleted ? "bg-emerald-500 text-white" : "bg-[#fcf3e3] text-[#903f00]"
                                )}>
                                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : index + 1}
                                </div>
                                <div>
                                  <h4 className="font-black text-[#1f1b12]">{course?.title}</h4>
                                  <p className="text-xs font-bold text-[#564338]/60">{course?.duration} • {course?.instructor}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {isLocked ? (
                                  <Lock className="w-5 h-5 text-[#564338]/40" />
                                ) : (
                                  <Button 
                                    onClick={() => {
                                      setSelectedCourse(course);
                                      setView('courses');
                                    }}
                                    className={cn(
                                      "rounded-xl font-black text-xs",
                                      isCompleted ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-[#1f1b12] text-white hover:bg-[#903f00]"
                                    )}
                                  >
                                    {isCompleted ? "Rewatch" : "Start Module"}
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 gap-8">
                    {LEARNING_PATHS.map((path) => (
                      <motion.div
                        key={path.id}
                        whileHover={{ y: -5 }}
                        onClick={() => setSelectedPath(path)}
                        className="bg-white p-10 rounded-[2.5rem] border border-[#111111]/5 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-8">
                          <div className="flex-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#903f00] mb-2 block">{path.category}</span>
                            <h3 className="text-3xl font-black text-[#1f1b12] group-hover:text-[#903f00] transition-colors">{path.title}</h3>
                            <p className="text-[#564338] font-medium mt-4 max-w-xl">{path.description}</p>
                          </div>
                          <div className={cn(
                            "w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform",
                            profile?.badges?.includes(path.badge.id) ? "bg-[#903f00] text-white" : "bg-[#fcf3e3] text-[#903f00]/20"
                          )}>
                            <path.badge.icon className="w-12 h-12" />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-8">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-[#1f1b12]">Path Progress</span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-[#903f00]">{getPathProgress(path)}%</span>
                            </div>
                            <Progress value={getPathProgress(path)} className="h-2 bg-[#fcf3e3]" />
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <p className="text-[10px] font-black text-[#1f1b12] uppercase tracking-widest">{path.courses.length} Modules</p>
                              <p className="text-[10px] font-bold text-[#564338]/40 uppercase tracking-widest">Curated Path</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#1f1b12] text-white flex items-center justify-center group-hover:bg-[#903f00] transition-colors">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: AI Assistant */}
          <div className={cn(
            "transition-all duration-500 flex flex-col min-h-0",
            isChatExpanded ? "w-[600px]" : "w-96"
          )}>
            <div className="bg-white rounded-[2.5rem] border border-[#111111]/5 shadow-2xl flex-1 flex flex-col overflow-hidden">
              <div className="p-8 border-b border-[#111111]/5 shrink-0 bg-[#fcf3e3]/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#903f00] rounded-2xl flex items-center justify-center shadow-lg shadow-[#903f00]/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-[#1f1b12]">Learning Assistant</h3>
                    <p className="text-[10px] font-bold text-[#903f00] uppercase tracking-widest">Powered by Gemini</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatExpanded(!isChatExpanded)}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-[#564338]/40 hover:text-[#903f00]"
                >
                  {isChatExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex flex-col max-w-[85%]",
                      msg.role === 'user' ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-2xl text-sm font-medium leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-[#1f1b12] text-white rounded-tr-none" 
                        : "bg-[#fcf3e3] text-[#1f1b12] rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                    <span className="text-[8px] font-bold text-[#564338]/40 mt-1 uppercase tracking-widest">
                      {msg.role === 'user' ? 'You' : 'Gemini'}
                    </span>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex items-start gap-2">
                    <div className="bg-[#fcf3e3] p-4 rounded-2xl rounded-tl-none">
                      <Loader2 className="w-4 h-4 animate-spin text-[#903f00]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-6 border-t border-[#111111]/5 bg-[#fcf3e3]/10">
                <div className="relative">
                  <Input 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your question..."
                    className="pr-12 bg-white border-none rounded-2xl h-12 text-sm font-bold shadow-sm focus-visible:ring-[#903f00]"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#1f1b12] text-white rounded-xl flex items-center justify-center hover:bg-[#903f00] transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
