import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, ExternalLink, Trash2, FolderCode, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link: string;
  imageURL?: string;
}

interface ProjectShowcaseProps {
  userId: string;
  projects: Project[];
  isOwnProfile: boolean;
}

export default function ProjectShowcase({ userId, projects = [], isOwnProfile }: ProjectShowcaseProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: '',
    link: '',
    imageURL: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for base64
        toast.error('Image too large. Please use an image under 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProject(prev => ({ ...prev, imageURL: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProject = async () => {
    if (!newProject.title.trim() || !newProject.description.trim()) {
      toast.error('Title and description are required.');
      return;
    }

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (newProject.link && !urlPattern.test(newProject.link)) {
      toast.error('Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      const project: Project = {
        id: crypto.randomUUID(),
        title: newProject.title,
        description: newProject.description,
        technologies: newProject.technologies.split(',').map(t => t.trim()).filter(t => t),
        link: newProject.link,
        imageURL: newProject.imageURL
      };

      await updateDoc(doc(db, 'profiles', userId), {
        projects: arrayUnion(project)
      });

      toast.success('Project added successfully!');
      setNewProject({ title: '', description: '', technologies: '', link: '', imageURL: '' });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding project:', error);
      toast.error('Failed to add project.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    try {
      await updateDoc(doc(db, 'profiles', userId), {
        projects: arrayRemove(project)
      });
      toast.success('Project removed.');
    } catch (error) {
      console.error('Error removing project:', error);
      toast.error('Failed to remove project.');
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-[#111111] flex items-center gap-2">
          <FolderCode className="w-6 h-6 text-[#B45309]" />
          Project Showcase
        </h2>
        {isOwnProfile && (
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="bg-[#111111] text-white hover:bg-[#111111]/90 rounded-xl font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#F5ECDD] border-none rounded-[2rem] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-[#111111]">Add New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#111111]/40">Project Title</label>
                  <Input 
                    value={newProject.title}
                    onChange={e => setNewProject({...newProject, title: e.target.value})}
                    placeholder="e.g. TeamForge"
                    className="bg-white border-none rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#111111]/40">Description</label>
                    <span className={cn(
                      "text-[10px] font-bold",
                      newProject.description.length > 500 ? "text-red-500" : "text-[#111111]/40"
                    )}>
                      {newProject.description.length}/500
                    </span>
                  </div>
                  <Textarea 
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                    placeholder="What did you build?"
                    className="bg-white border-none rounded-xl min-h-[100px]"
                    maxLength={500}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#111111]/40">Project Image</label>
                  {newProject.imageURL ? (
                    <div className="relative group rounded-xl overflow-hidden aspect-video">
                      <img src={newProject.imageURL} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setNewProject(prev => ({ ...prev, imageURL: '' }))}
                        className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#111111]/10 rounded-xl cursor-pointer hover:bg-white/50 transition-colors">
                      <ImageIcon className="w-8 h-8 text-[#111111]/20 mb-2" />
                      <span className="text-xs font-bold text-[#111111]/40">Upload Image (Max 1MB)</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#111111]/40">Technologies (comma separated)</label>
                  <Input 
                    value={newProject.technologies}
                    onChange={e => setNewProject({...newProject, technologies: e.target.value})}
                    placeholder="React, Firebase, Tailwind"
                    className="bg-white border-none rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#111111]/40">Project Link</label>
                  <Input 
                    value={newProject.link}
                    onChange={e => setNewProject({...newProject, link: e.target.value})}
                    placeholder="https://github.com/..."
                    className="bg-white border-none rounded-xl"
                  />
                </div>
                <Button 
                  onClick={handleAddProject}
                  disabled={loading || !newProject.title || !newProject.description}
                  className="w-full bg-[#B45309] text-white hover:bg-[#B45309]/90 h-12 rounded-xl font-bold mt-4"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Project'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="popLayout">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
            >
              <Card className="bg-white border-[#111111]/5 rounded-2xl overflow-hidden group hover:shadow-xl transition-all">
                {project.imageURL && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={project.imageURL} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#111111] group-hover:text-[#B45309] transition-colors">{project.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.technologies.map((tech, i) => (
                          <Badge key={i} variant="secondary" className="bg-[#F5ECDD] text-[#B45309] border-none text-[10px] font-bold">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {project.link && (
                        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-[#F5ECDD] text-[#B45309]">
                          <a href={project.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {isOwnProfile && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full hover:bg-red-50 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#F5ECDD] border-none rounded-[2rem]">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-black text-[#111111]">Delete Project?</AlertDialogTitle>
                              <AlertDialogDescription className="text-[#111111]/60 font-medium">
                                This action cannot be undone. This will permanently remove "{project.title}" from your profile.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel variant="outline" size="default" className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteProject(project)}
                                className="bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[#111111]/70 leading-relaxed">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {projects.length === 0 && (
          <div className="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-[#111111]/10">
            <p className="text-[#111111]/40 font-bold italic">No projects showcased yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
