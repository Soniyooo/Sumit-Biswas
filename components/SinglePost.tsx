import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { PostCard } from './PostCard';
import { ArrowLeft } from 'lucide-react';

export const SinglePost = () => {
  const { postId } = useParams();
  const { posts } = useContext(AppContext);
  const navigate = useNavigate();

  const post = posts.find(p => p.id === postId);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-slate-500 mb-4">Post not found</p>
        <button 
          onClick={() => navigate('/')}
          className="text-indigo-600 font-medium hover:underline"
        >
          Go back home
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-4 flex items-center text-slate-600 hover:text-indigo-600 transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Back
      </button>
      <PostCard post={post} />
    </div>
  );
};