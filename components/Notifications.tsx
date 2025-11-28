
import React, { useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';

export const Notifications = () => {
  const { notifications, markNotificationsAsRead } = useContext(AppContext);

  useEffect(() => {
    markNotificationsAsRead();
  }, []); // Mark as read on mount

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Notifications</h2>
        <p className="text-slate-500 mt-2">Activity on your posts and account will show up here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="p-4 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
      </div>
      <div className="divide-y divide-slate-100">
        {notifications.map(notif => (
          <div key={notif.id} className="p-4 flex items-start space-x-3 hover:bg-slate-50 transition-colors">
             <Link to={`/user/${notif.userId}`}>
                <img src={notif.userAvatar} alt={notif.userName} className="w-10 h-10 rounded-full bg-slate-200" />
             </Link>
             
             <div className="flex-1 min-w-0">
               <div className="flex justify-between items-start">
                  <p className="text-sm text-slate-900 leading-snug">
                    <Link to={`/user/${notif.userId}`} className="font-semibold hover:text-indigo-600 mr-1">{notif.userName}</Link>
                    {notif.type === 'like' && `liked your post.`}
                    {notif.type === 'comment' && `commented on your post.`}
                    {notif.type === 'follow' && `started following you.`}
                  </p>
                  <span className="text-xs text-slate-400 ml-2 whitespace-nowrap">{formatDate(notif.createdAt)}</span>
               </div>
               
               {notif.postPreview && (
                 <Link to={`/post/${notif.postId}`} className="block mt-1 text-xs text-slate-500 truncate hover:text-slate-800">
                   "{notif.postPreview}"
                 </Link>
               )}
             </div>

             <div className="pt-1">
               {notif.type === 'like' && <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />}
               {notif.type === 'comment' && <MessageCircle className="w-4 h-4 text-indigo-500 fill-indigo-100" />}
               {notif.type === 'follow' && <UserPlus className="w-4 h-4 text-green-500" />}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
