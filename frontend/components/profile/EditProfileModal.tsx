import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export function EditProfileModal({ isOpen, onClose, userProfile, onSuccess }: any) {
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
