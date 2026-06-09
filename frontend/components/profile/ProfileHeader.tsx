import { Edit2, Calendar, FileText, User } from 'lucide-react';

export function ProfileHeader({ profileUser, isOwner, onEditClick }: any) {

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
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
              onClick={onEditClick}
              className="px-6 py-2.5 bg-surface text-on-surface border border-outline-variant/50 rounded-full font-label-caps text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-colors flex items-center gap-2 mx-auto md:mx-0 shadow-sm"
            >
              <Edit2 className="size-4" />
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
