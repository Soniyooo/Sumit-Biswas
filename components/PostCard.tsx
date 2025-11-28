
import React, { useContext, useState } from 'react';
import { Post } from '../types';
import { AppContext } from '../context/AppContext';
import { Heart, MessageCircle, Share2, Sparkles, Send, Infinity as InfinityIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PostCard = ({ post }: { post: Post }) => {
  const { user, toggleLike, addComment } = useContext(AppContext);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [justShared, setJustShared] = useState(false);

  const isLiked = user ? post.likes.includes(user.id) : false;

  const handleLike = () => {
    toggleLike(post.id);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/#/post/${post.id}`;
    navigator.clipboard.writeText(shareUrl);
    setJustShared(true);
    setTimeout(() => setJustShared(false), 2000);
  };

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link to={`/user/${post.userId}`} className="flex items-center space-x-3 group">
          <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-full bg-slate-200 group-hover:opacity-90 transition-opacity" />
          <div>
            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{post.userName}</h3>
            <p className="text-xs text-slate-500">{formatDate(post.createdAt)}</p>
          </div>
        </Link>
        <div className="flex items-center space-x-2">
          {post.type === 'boomerang' && (
             <div className="flex items-center text-xs text-pink-600 bg-pink-50 px-2 py-1 rounded-full border border-pink-100" title="Boomerang">
              <InfinityIcon className="w-3 h-3 mr-1" />
              Boomerang
            </div>
          )}
          {post.aiEnhanced && (
            <div className="flex items-center text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100" title="Enhanced by Gemini AI">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Enhanced
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {post.type === 'status' && post.background ? (
         // Status Post Render
         <div className={`${post.background} p-10 min-h-[250px] flex items-center justify-center text-center`}>
           <p className="text-white text-2xl font-bold leading-relaxed shadow-sm drop-shadow-md">{post.content}</p>
         </div>
      ) : (
        // Regular & Boomerang Post Render
        <>
          <div className="px-4 pb-2">
            <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
          </div>

          {post.imageUrl && (
            <div className="mt-2 w-full bg-slate-50 relative overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt="Post content" 
                className={`w-full h-auto object-cover max-h-96 ${post.type === 'boomerang' ? 'animate-boomerang' : ''}`} 
              />
              {post.type === 'boomerang' && (
                <div className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full">
                  <InfinityIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between mt-2">
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-pink-600' : 'text-slate-500 hover:text-pink-500'}`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-pink-600' : ''}`} />
            <span className="font-medium">{post.likes.length}</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="font-medium">{post.comments.length}</span>
          </button>
        </div>
        
        <button 
          onClick={handleShare}
          className={`flex items-center space-x-1 ${justShared ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'}`}
          title="Copy Link"
        >
          <Share2 className="w-5 h-5" />
          {justShared && <span className="text-xs font-medium">Copied</span>}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-slate-50 p-4 border-t border-slate-100">
          <div className="space-y-4 mb-4">
            {post.comments.map(comment => (
              <div key={comment.id} className="flex space-x-3">
                <Link to={`/user/${comment.userId}`}>
                  <img src={comment.userAvatar} alt={comment.userName} className="w-8 h-8 rounded-full bg-white" />
                </Link>
                <div className="flex-1 bg-white p-3 rounded-r-xl rounded-bl-xl shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <Link to={`/user/${comment.userId}`} className="text-sm font-semibold text-slate-900 hover:text-indigo-600">{comment.userName}</Link>
                    <span className="text-xs text-slate-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-700">{comment.content}</p>
                </div>
              </div>
            ))}
            {post.comments.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-2">No comments yet. Be the first!</p>
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full" />
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full pl-4 pr-12 py-2 rounded-full border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              />
              <button 
                type="submit" 
                disabled={!commentText.trim()}
                className="absolute right-1 top-1 p-1.5 bg-indigo-600 text-white rounded-full disabled:opacity-50 hover:bg-indigo-700 transition-colors"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
