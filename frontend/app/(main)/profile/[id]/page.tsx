'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Image as ImageIcon, Calendar, FileText, Check, X, Camera, Loader2 } from 'lucide-react';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import TopNavBar from '@/components/layout/TopNavBar';
import SideNavBar from '@/components/layout/SideNavBar';
import { useAuth } from '@/lib/auth-context';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calculateReadingTime(htmlContent: string = '') {
  const text = htmlContent.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}



// ─── Main Profile Page Component ──────────────────────────────────────────────
export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isOwner = currentUser?._id === id;

  // Fetch Profile & Posts
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Fetch User Info
        const userRes = await fetch(`${API}/users/${id}`);
        const userData = await userRes.json();
        
        if (userData.success) {
          setProfileUser(userData.user);
        } else {
          router.push('/404');
          return;
        }

        // Fetch User Posts
        const postsRes = await fetch(`${API}/posts?authorId=${id}&limit=20`);
        const postsData = await postsRes.json();
        
        if (postsData.success) {
          setPosts(postsData.data);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, router]);

  const handleProfileUpdated = (updatedUser: any) => {
    setProfileUser((prev: any) => ({ ...prev, ...updatedUser }));
    // Note: We don't update AuthContext globally here because AuthContext fetches on its own, 
    // or we could force a reload. A page refresh is easiest or just letting AuthContext sync.
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative font-body-md transition-colors duration-300">
      <TopNavBar />

      <div className="flex-1 flex w-full pt-16">
        <SideNavBar />

        <div className="flex-1 flex justify-center px-4 py-8 md:px-8">
          <main className="flex-1 max-w-[1100px] w-full min-h-[calc(100vh-61px)] flex flex-col">
            
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="size-10 text-primary animate-spin" />
              </div>
            ) : profileUser ? (
              <>
                <ProfileHeader 
                  profileUser={profileUser} 
                  isOwner={isOwner} 
                  onEditClick={() => setIsEditModalOpen(true)} 
                />

                {/* ─── User's Posts ─── */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                    <h2 className="font-headline-md text-xl font-bold text-on-surface">Published Stories</h2>
                  </div>

                  {posts.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-4">
                        <FileText className="size-8" />
                      </div>
                      <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2">No stories yet</h3>
                      <p className="text-on-surface-variant text-sm max-w-sm">
                        {isOwner ? "You haven't published any stories yet. Start writing today!" : `${profileUser.name} hasn't published anything yet.`}
                      </p>
                      {isOwner && (
                        <button 
                          onClick={() => router.push('/write')}
                          className="mt-6 px-6 py-2.5 bg-primary text-on-primary rounded-full font-label-caps font-bold tracking-widest text-xs uppercase hover:opacity-90 transition-opacity"
                        >
                          Write a Story
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                      {posts.map(post => {
                        const readTime = calculateReadingTime(post.htmlContent);
                        return (
                          <motion.article
                            key={post._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => router.push(`/feed/${post.slug}`)}
                            className="bg-surface border border-outline-variant/30 hover:border-outline-variant/60 rounded-2xl overflow-hidden flex flex-col group cursor-pointer shadow-xs hover:shadow-md transition-all duration-300"
                          >
                            <div className="h-48 bg-surface-container-low overflow-hidden relative">
                              {post.coverImage ? (
                                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 group-hover:scale-105 transition-transform duration-500">
                                  <ImageIcon className="size-10 mb-2 opacity-50" />
                                </div>
                              )}
                              {post.category && (
                                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md text-on-surface font-label-caps text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-md shadow-sm">
                                  {post.category}
                                </div>
                              )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                              <h2 className="font-headline-md text-[17px] font-bold text-on-surface leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {post.title}
                              </h2>
                              <p className="font-body-md text-sm text-on-surface-variant line-clamp-2 mb-4 flex-1 font-light">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center justify-between text-[11px] font-label-caps font-bold tracking-widest uppercase text-on-surface-variant mt-auto pt-4 border-t border-outline-variant/20">
                                <span>{formatDate(post.createdAt)}</span>
                                <span>{readTime} MIN READ</span>
                              </div>
                            </div>
                          </motion.article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : null}
            
          </main>
        </div>
      </div>

      <AnimatePresence>
        {isEditModalOpen && (
          <EditProfileModal 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            userProfile={profileUser}
            onSuccess={handleProfileUpdated}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
