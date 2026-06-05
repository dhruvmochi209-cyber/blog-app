'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, LogOut, Image as ImageIcon, Calendar, FileText, Check, X, Camera, Loader2 } from 'lucide-react';
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

// ─── Edit Profile Modal Component ─────────────────────────────────────────────
function EditProfileModal({ isOpen, onClose, userProfile, onSuccess }: any) {
  const { accessToken } = useAuth();
  const [name, setName] = useState(userProfile?.name || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [avatar, setAvatar] = useState(userProfile?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(userProfile?.name || '');
      setBio(userProfile?.bio || '');
      setAvatar(userProfile?.avatar || '');
    }
  }, [isOpen, userProfile]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API}/uploads/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setAvatar(data.url);
      }
    } catch (err) {
      console.error('Image upload failed', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ name, bio, avatar })
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.user);
        onClose();
      }
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface w-full max-w-md rounded-3xl border border-outline-variant/30 shadow-xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
          <h2 className="font-headline-md font-bold text-lg text-on-surface">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-surface-container border-2 border-primary/20 group">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-display-xl text-4xl">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                {uploadingImage ? <Loader2 className="size-6 animate-spin" /> : <Camera className="size-6" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
            </div>
            <p className="text-xs font-label-caps uppercase tracking-wider text-on-surface-variant font-bold">Profile Picture</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                rows={3}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                placeholder="Tell us a little about yourself..."
              />
              <div className="text-right text-[10px] text-on-surface-variant mt-1 font-medium">
                {bio.length}/160
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3 bg-surface-container-lowest/50">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-label-caps text-xs font-bold tracking-widest uppercase hover:bg-surface-container text-on-surface transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="px-6 py-2.5 rounded-full font-label-caps text-xs font-bold tracking-widest uppercase bg-primary text-on-primary hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
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

      <div className="flex-1 flex w-full">
        <SideNavBar />

        <div className="flex-1 flex justify-center px-4 py-8 md:px-8">
          <main className="flex-1 max-w-[1100px] w-full min-h-[calc(100vh-61px)] flex flex-col">
            
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="size-10 text-primary animate-spin" />
              </div>
            ) : profileUser ? (
              <>
                {/* ─── Profile Header ─── */}
                <div className="mb-12 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
                  
                  {/* Decorative background blob */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

                  {/* Avatar */}
                  <div className="shrink-0 relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background overflow-hidden bg-surface-container shadow-md z-10 relative">
                      {profileUser.avatar ? (
                        <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-display-xl text-5xl font-bold">
                          {profileUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left z-10 space-y-4">
                    <div>
                      <h1 className="font-display-xl text-3xl md:text-4xl font-black text-on-surface tracking-tight mb-2">
                        {profileUser.name}
                      </h1>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-label-caps uppercase tracking-wider font-bold text-on-surface-variant">
                        {profileUser.role === 'CREATOR' && (
                          <span className="text-primary bg-primary/10 px-2 py-1 rounded-md">Creator</span>
                        )}
                        <span className="flex items-center gap-1.5"><Calendar className="size-4" /> Joined {formatDate(profileUser.createdAt)}</span>
                        <span className="flex items-center gap-1.5"><FileText className="size-4" /> {profileUser.postCount} Published</span>
                      </div>
                    </div>

                    {profileUser.bio && (
                      <p className="text-on-surface/80 text-base max-w-2xl leading-relaxed">
                        {profileUser.bio}
                      </p>
                    )}

                    {isOwner && (
                      <div className="pt-4">
                        <button 
                          onClick={() => setIsEditModalOpen(true)}
                          className="px-6 py-2.5 bg-surface text-on-surface border border-outline-variant/50 rounded-full font-label-caps text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-colors flex items-center gap-2 mx-auto md:mx-0 shadow-sm"
                        >
                          <Edit2 className="size-4" />
                          Edit Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>

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
