
import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { X, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export const StatusViewer = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { posts, getUser } = useContext(AppContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<any>(null);

  const user = getUser(userId || '');
  
  // Get only status posts for this user
  const userStories = posts
    .filter(p => p.userId === userId && p.type === 'status')
    .sort((a, b) => a.createdAt - b.createdAt); // Oldest first

  const currentStory = userStories[currentIndex];

  useEffect(() => {
    if (!user || userStories.length === 0) {
      navigate('/');
      return;
    }
  }, [user, userStories, navigate]);

  // Timer Logic
  useEffect(() => {
    setProgress(0);
    clearInterval(progressInterval.current);

    const duration = 5000; // 5 seconds per slide
    const intervalTime = 50;
    const step = 100 / (duration / intervalTime);

    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(progressInterval.current);
  }, [currentIndex]); // Reset when index changes

  const handleNext = () => {
    if (currentIndex < userStories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      navigate('/'); // Close on finish
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      // Restart current or stay
      setProgress(0);
    }
  };

  if (!user || !currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Container to restrict width on desktop */}
      <div className="relative w-full h-full md:max-w-md md:h-[90vh] md:rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
        
        {/* Background (Gradient or Image) */}
        <div className={`absolute inset-0 flex items-center justify-center ${currentStory.background || 'bg-black'}`}>
           {currentStory.imageUrl && (
             <img src={currentStory.imageUrl} alt="Story" className="w-full h-full object-cover opacity-80" />
           )}
           <p className={`relative z-10 text-white font-bold text-2xl md:text-3xl text-center px-8 leading-relaxed drop-shadow-md ${currentStory.imageUrl ? 'bg-black/30 p-4 rounded-xl backdrop-blur-sm' : ''}`}>
             {currentStory.content}
           </p>
        </div>

        {/* Progress Bars */}
        <div className="absolute top-4 left-0 right-0 z-20 px-4 flex gap-1">
          {userStories.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-0 right-0 z-20 px-4 flex justify-between items-center">
           <div className="flex items-center space-x-3">
             <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-white/50" />
             <div>
               <p className="text-white text-sm font-semibold">{user.name}</p>
               <p className="text-white/70 text-xs">
                 {new Date(currentStory.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </p>
             </div>
           </div>
           <div className="flex items-center gap-4">
             <button className="text-white/80 hover:text-white">
                <MoreHorizontal className="w-5 h-5" />
             </button>
             <button onClick={() => navigate('/')} className="text-white hover:text-red-400">
                <X className="w-6 h-6" />
             </button>
           </div>
        </div>

        {/* Navigation Touch Areas */}
        <div className="absolute inset-0 z-10 flex">
          <div className="flex-1 h-full" onClick={handlePrev}></div>
          <div className="flex-1 h-full" onClick={handleNext}></div>
        </div>

        {/* Footer / Reply */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-3">
             <input 
               type="text" 
               placeholder="Reply..." 
               className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-white placeholder-white/60 focus:outline-none focus:bg-white/20 text-sm backdrop-blur-md"
             />
             <button className="text-white p-2">
               <ChevronRight className="w-6 h-6" />
             </button>
          </div>
        </div>

      </div>
      
      {/* Desktop Close Button (Outside the phone frame) */}
      <button 
        onClick={() => navigate('/')} 
        className="hidden md:block absolute top-6 right-6 text-white/50 hover:text-white"
      >
        <X className="w-8 h-8" />
      </button>
    </div>
  );
};
