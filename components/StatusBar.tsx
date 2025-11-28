
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export const StatusBar = () => {
  const { user, allUsers, posts } = useContext(AppContext);
  const navigate = useNavigate();

  if (!user) return null;

  // Helper to check if a user has recent status posts (last 24h)
  // For demo purposes, we consider all posts of type 'status' as active stories
  const hasStories = (userId: string) => {
    return posts.some(p => p.userId === userId && p.type === 'status');
  };

  const usersWithStories = allUsers
    .filter(u => u.id !== user.id) // Exclude self (handled separately)
    .filter(u => hasStories(u.id));

  const myStories = hasStories(user.id);

  const handleMyStoryClick = () => {
    if (myStories) {
      navigate(`/stories/${user.id}`);
    } else {
      navigate('/create');
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 py-4 mb-4">
      <div className="flex overflow-x-auto no-scrollbar px-4 space-x-4">
        
        {/* Current User Item */}
        <div className="flex flex-col items-center flex-shrink-0 cursor-pointer" onClick={handleMyStoryClick}>
          <div className={`relative p-[3px] rounded-full ${myStories ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' : 'bg-transparent'}`}>
            <div className="bg-white p-[2px] rounded-full">
               <img 
                 src={user.avatar} 
                 alt="Your Story" 
                 className="w-16 h-16 rounded-full object-cover border border-slate-100" 
               />
            </div>
            {!myStories && (
              <div className="absolute bottom-1 right-1 bg-indigo-600 text-white rounded-full p-1 border-2 border-white">
                <Plus className="w-3 h-3" />
              </div>
            )}
          </div>
          <span className="text-xs text-slate-600 mt-1 font-medium">Your story</span>
        </div>

        {/* Other Users */}
        {usersWithStories.map(u => (
          <Link key={u.id} to={`/stories/${u.id}`} className="flex flex-col items-center flex-shrink-0">
            <div className="p-[3px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 transition-transform hover:scale-105">
              <div className="bg-white p-[2px] rounded-full">
                <img 
                  src={u.avatar} 
                  alt={u.name} 
                  className="w-16 h-16 rounded-full object-cover border border-slate-100" 
                />
              </div>
            </div>
            <span className="text-xs text-slate-600 mt-1 max-w-[70px] truncate">{u.name.split(' ')[0].toLowerCase()}</span>
          </Link>
        ))}
        
        {/* Placeholder for no stories */}
        {usersWithStories.length === 0 && !myStories && (
           <div className="flex items-center text-xs text-slate-400 italic px-2">
             Share a status update to see it here!
           </div>
        )}
      </div>
    </div>
  );
};
