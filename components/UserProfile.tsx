
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, List, MessageCircle, UserPlus, UserCheck, Settings, Lock, Unlock, LogOut } from 'lucide-react';
import { Feed } from './Feed';

export const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser, getUser, posts, toggleFollow, togglePrivacy, startChat, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const profileUser = getUser(userId || '');
  const isSelf = currentUser?.id === profileUser?.id;
  
  if (!profileUser) return <div className="p-8 text-center">User not found</div>;

  const isFollowing = currentUser?.following.includes(profileUser.id);
  
  // Privacy Logic
  const canViewContent = isSelf || !profileUser.isPrivate || isFollowing;

  const userPosts = canViewContent 
    ? posts.filter(p => p.userId === profileUser.id)
    : [];

  const handleMessage = () => {
    if (isSelf) return;
    const chatId = startChat(profileUser.id);
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Profile Header */}
      <div className="bg-white border-b border-slate-200 pb-4">
        <div className="p-6 flex flex-col items-center md:flex-row md:items-start md:space-x-8 max-w-2xl mx-auto">
          <div className="relative">
             <img 
               src={profileUser.avatar} 
               alt={profileUser.name} 
               className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md object-cover" 
             />
             {profileUser.isPrivate && !isSelf && (
               <div className="absolute bottom-1 right-1 bg-slate-100 p-1.5 rounded-full border border-white shadow-sm" title="Private Account">
                 <Lock className="w-4 h-4 text-slate-500" />
               </div>
             )}
          </div>

          <div className="flex-1 mt-4 md:mt-0 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:justify-between mb-4">
               <div className="flex items-center gap-2">
                 <h1 className="text-2xl font-bold text-slate-900">{profileUser.name}</h1>
                 {profileUser.isPrivate && isSelf && (
                   <span title="Your profile is locked" className="flex items-center">
                     <Lock className="w-4 h-4 text-slate-400" />
                   </span>
                 )}
               </div>
               
               <div className="flex items-center space-x-2 mt-3 md:mt-0">
                 {isSelf ? (
                   <>
                     <button 
                       onClick={togglePrivacy}
                       className={`px-4 py-1.5 font-semibold rounded-lg text-sm border transition-colors flex items-center ${
                         profileUser.isPrivate 
                           ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                           : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                       }`}
                       title={profileUser.isPrivate ? "Unlock Profile" : "Lock Profile"}
                     >
                       {profileUser.isPrivate ? <Lock className="w-4 h-4 mr-1.5" /> : <Unlock className="w-4 h-4 mr-1.5" />}
                       {profileUser.isPrivate ? 'Locked' : 'Public'}
                     </button>
                     <button onClick={logout} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-colors" title="Logout">
                       <LogOut className="w-5 h-5" />
                     </button>
                   </>
                 ) : (
                   <>
                     <button 
                       onClick={() => toggleFollow(profileUser.id)}
                       className={`px-6 py-1.5 rounded-lg text-sm font-semibold flex items-center transition-colors ${
                         isFollowing 
                           ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                           : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                       }`}
                     >
                       {isFollowing ? (
                         <>
                           <UserCheck className="w-4 h-4 mr-1.5" />
                           Following
                         </>
                       ) : (
                         <>
                           <UserPlus className="w-4 h-4 mr-1.5" />
                           Follow
                         </>
                       )}
                     </button>
                     <button 
                       onClick={handleMessage}
                       className="px-4 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg text-sm border border-slate-200 hover:bg-slate-200 transition-colors"
                     >
                       Message
                     </button>
                   </>
                 )}
               </div>
            </div>

            <div className="flex justify-center md:justify-start space-x-8 mb-4">
              <div className="text-center md:text-left">
                <span className="font-bold text-slate-900">{profileUser.isPrivate && !isSelf && !isFollowing ? '-' : posts.filter(p => p.userId === profileUser.id).length}</span>
                <span className="text-slate-500 ml-1">posts</span>
              </div>
              <div className="text-center md:text-left">
                <span className="font-bold text-slate-900">{profileUser.followers.length}</span>
                <span className="text-slate-500 ml-1">followers</span>
              </div>
              <div className="text-center md:text-left">
                <span className="font-bold text-slate-900">{profileUser.following.length}</span>
                <span className="text-slate-500 ml-1">following</span>
              </div>
            </div>

            <div className="max-w-md">
              <p className="text-sm font-medium text-slate-900">{profileUser.name}</p>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{profileUser.bio || 'No bio yet.'}</p>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        {canViewContent && (
          <div className="flex border-t border-slate-100 mt-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex-1 py-3 flex justify-center items-center ${viewMode === 'grid' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button 
               onClick={() => setViewMode('list')}
               className={`flex-1 py-3 flex justify-center items-center ${viewMode === 'list' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto pb-20">
        {!canViewContent ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200">
              <Lock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">This Account is Private</h3>
            <p className="text-slate-500 mt-1 max-w-xs">Follow this account to see their photos and videos.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-0.5 md:gap-4 md:p-4">
            {userPosts.map(post => (
              <div key={post.id} className="aspect-square relative group bg-slate-200 overflow-hidden cursor-pointer md:rounded-xl">
                 {post.type === 'status' && post.background ? (
                   <div className={`w-full h-full ${post.background} flex items-center justify-center p-2 text-center`}>
                     <span className="text-white font-bold text-xs truncate w-full">{post.content}</span>
                   </div>
                 ) : post.imageUrl ? (
                   <img src={post.imageUrl} alt="" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                 ) : (
                   <div className="w-full h-full p-2 flex items-center justify-center bg-indigo-50 text-slate-500 text-xs text-center">
                     {post.content.slice(0, 50)}...
                   </div>
                 )}
                 {post.aiEnhanced && (
                   <div className="absolute top-1 right-1">
                     <div className="bg-black/50 p-1 rounded-full">
                       <span className="block w-2 h-2 bg-indigo-400 rounded-full"></span>
                     </div>
                   </div>
                 )}
              </div>
            ))}
            {userPosts.length === 0 && (
              <div className="col-span-3 py-10 text-center text-slate-400">
                No posts yet
              </div>
            )}
          </div>
        ) : (
          <Feed posts={userPosts} emptyMessage="No posts yet" />
        )}
      </div>
    </div>
  );
};
