
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { PostCard } from './PostCard';
import { StatusBar } from './StatusBar';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Post } from '../types';

interface FeedProps {
  posts?: Post[];
  emptyMessage?: string;
}

export const Feed: React.FC<FeedProps> = ({ posts, emptyMessage }) => {
  const { posts: allPosts, user, getUser } = useContext(AppContext);
  
  // Use passed posts (e.g. from search/profile) OR default to all posts filtered by privacy
  // If posts are passed explicitly, we assume privacy checks were done by parent or it's a specific view
  const rawPosts = posts || allPosts;

  // Filter based on privacy
  const displayPosts = rawPosts.filter(post => {
    // If we are on a specific profile view (posts are passed as prop), assume visibility is handled by UserProfile component
    if (posts) return true;

    // For Main Feed:
    const author = getUser(post.userId);
    if (!author) return false;

    // 1. If it's my post, show it
    if (user && author.id === user.id) return true;

    // 2. If author is public, show it
    if (!author.isPrivate) return true;

    // 3. If author is private, only show if I follow them
    if (user && author.isPrivate && author.followers.includes(user.id)) return true;

    return false;
  });

  return (
    <div>
      {/* Show StatusBar only on the main feed (when no specific posts are passed) */}
      {!posts && <StatusBar />}

      <div className="space-y-6 p-4 md:p-6 pb-24 md:pb-6">
        {displayPosts.length > 0 ? (
          displayPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {emptyMessage || 'No posts yet'}
            </h3>
            <p className="text-slate-500 max-w-sm mb-6">
              Start following people or create your own content!
            </p>
            <Link 
              to="/create" 
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:bg-indigo-700 transition-colors"
            >
              Create Post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
