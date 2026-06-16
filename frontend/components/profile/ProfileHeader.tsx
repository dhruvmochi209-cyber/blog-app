import { Edit2, Calendar, FileText, User, Sparkles } from 'lucide-react';

export function ProfileHeader({ profileUser, isOwner, onEditClick }: any) {

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mb-12 bg-surface-container-lowest border border-outline-variant/30 rounded-[32px] overflow-hidden shadow-sm relative">
      
      {/* ── COVER BANNER ── */}
      <div className="h-48 md:h-64 w-full relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
      </div>

      {/* ── PROFILE INFO CONTAINER ── */}
      <div className="px-6 md:px-10 pb-8">
        
        {/* Avatar & Actions Row */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end -mt-16 md:-mt-20 mb-6 gap-4">
          
          {/* Avatar */}
          <div className="relative z-10">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-surface-container-lowest overflow-hidden bg-surface-container shadow-xl">
              {profileUser.avatar ? (
                <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-white font-display-xl text-5xl font-black">
                  {profileUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {profileUser.role === 'CREATOR' && (
              <div className="absolute bottom-2 right-2 bg-background p-1.5 rounded-full shadow-md border border-outline-variant/30">
                <Sparkles className="size-5 text-primary fill-primary/20" />
              </div>
            )}
          </div>

          {/* Edit Button */}
          {isOwner && (
            <button
              onClick={onEditClick}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-label-caps text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Edit2 className="size-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* User Details */}
        <div className="text-center md:text-left space-y-4">
          <div>
            <h1 className="font-display-xl text-4xl font-black text-on-surface tracking-tight mb-2">
              {profileUser.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-sm font-label-caps uppercase tracking-wider font-bold text-on-surface-variant">
              {profileUser.role === 'CREATOR' && (
                <span className="text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Creator</span>
              )}
              <span className="flex items-center gap-1.5"><Calendar className="size-4" /> Joined {formatDate(profileUser.createdAt)}</span>
              <span className="flex items-center gap-1.5"><FileText className="size-4" /> {profileUser.postCount} Stories</span>
            </div>
          </div>

          {profileUser.bio ? (
            <p className="text-on-surface/80 text-base md:text-lg max-w-3xl leading-relaxed mt-4 font-light">
              {profileUser.bio}
            </p>
          ) : (
            <p className="text-on-surface-variant/50 text-base italic max-w-3xl leading-relaxed mt-4">
              No bio provided.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
