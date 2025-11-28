import React, { useState, useRef, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { enhancePostContent, generateImageCaption } from '../services/geminiService';
import { Image as ImageIcon, Sparkles, X, Send, Loader2, Type, Infinity as InfinityIcon, Trash2, Save } from 'lucide-react';

type PostMode = 'post' | 'status' | 'boomerang';

const GRADIENTS = [
  'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500',
  'bg-gradient-to-r from-blue-400 to-emerald-400',
  'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
  'bg-gradient-to-r from-cyan-500 to-blue-500',
  'bg-gradient-to-r from-rose-400 to-red-500',
  'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
];

const DRAFT_KEY = 'sphere_post_draft';

export const CreatePost = () => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const [mode, setMode] = useState<PostMode>('post');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref to hold current state for the interval closure
  const stateRef = useRef({ content, selectedImage, mode, selectedGradient });

  const { addPost } = useContext(AppContext);
  const navigate = useNavigate();

  // Update ref whenever state changes
  useEffect(() => {
    stateRef.current = { content, selectedImage, mode, selectedGradient };
  }, [content, selectedImage, mode, selectedGradient]);

  // Restore draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Only restore if there is meaningful content
        if (parsed.content || parsed.selectedImage) {
          setContent(parsed.content || '');
          setSelectedImage(parsed.selectedImage || null);
          if (parsed.mode) setMode(parsed.mode as PostMode);
          if (parsed.selectedGradient) setSelectedGradient(parsed.selectedGradient);
          setLastSaved(parsed.timestamp || Date.now());
        }
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  // Auto-save interval (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const { content, selectedImage, mode, selectedGradient } = stateRef.current;
      
      if (content.trim() || selectedImage) {
        const draft = {
          content,
          selectedImage,
          mode,
          selectedGradient,
          timestamp: Date.now()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setLastSaved(Date.now());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setContent('');
    setSelectedImage(null);
    setMode('post');
    setSelectedGradient(GRADIENTS[0]);
    setLastSaved(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        
        // Auto-generate caption only in normal post mode
        if (mode === 'post' && !content) {
          handleGenerateCaption(base64, file.type);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateCaption = async (base64: string, mimeType: string) => {
    setIsGeneratingCaption(true);
    // Strip prefix for API
    const base64Data = base64.split(',')[1]; 
    const caption = await generateImageCaption(base64Data, mimeType);
    if (caption) {
      setContent(caption);
      setAiUsed(true);
    }
    setIsGeneratingCaption(false);
  };

  const handleEnhance = async () => {
    if (!content) return;
    setIsEnhancing(true);
    const improved = await enhancePostContent(content);
    setContent(improved);
    setAiUsed(true);
    setIsEnhancing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'status' && !content) return;
    if ((mode === 'post' || mode === 'boomerang') && !content && !selectedImage) return;
    
    addPost(
      content, 
      selectedImage || undefined, 
      aiUsed, 
      mode === 'post' ? 'regular' : mode, // Map mode to Post['type']
      mode === 'status' ? selectedGradient : undefined
    );
    
    // Clear draft after successful post
    localStorage.removeItem(DRAFT_KEY);
    
    navigate('/');
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Create</h2>
        {(content || selectedImage) && (
          <button 
            onClick={clearDraft}
            className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Clear Draft
          </button>
        )}
      </div>
      
      {/* Mode Switcher */}
      <div className="flex space-x-4 mb-4 border-b border-slate-200">
        <button
          onClick={() => { setMode('post'); }}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${mode === 'post' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
        >
          Post
        </button>
        <button
          onClick={() => { setMode('status'); }}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${mode === 'status' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
        >
          Status
        </button>
        <button
          onClick={() => { setMode('boomerang'); }}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${mode === 'boomerang' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
        >
          Boomerang
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Input Area */}
        <div className={`p-4 ${mode === 'status' ? selectedGradient + ' min-h-[250px] flex items-center justify-center' : ''}`}>
          
          {mode === 'status' ? (
             <textarea
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="Type something..."
               className="w-full text-center bg-transparent border-none focus:ring-0 text-2xl font-bold text-white placeholder-white/70 resize-none"
               rows={4}
             />
          ) : (
            <>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={mode === 'boomerang' ? "Caption your boomerang..." : "What's on your mind?"}
                className="w-full min-h-[100px] resize-none border-none focus:ring-0 text-lg text-slate-800 placeholder-slate-400"
                disabled={isEnhancing || isGeneratingCaption}
              />
              
              {selectedImage ? (
                <div className="relative mt-4 rounded-xl overflow-hidden bg-slate-100 max-h-80 w-full group">
                  <img src={selectedImage} alt="Preview" className={`w-full h-full object-contain ${mode === 'boomerang' ? 'animate-pulse' : ''}`} />
                  {mode === 'boomerang' && (
                     <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                       <InfinityIcon className="w-3 h-3 mr-1" />
                       BOOMERANG
                     </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : mode === 'boomerang' ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors text-slate-400"
                >
                  <InfinityIcon className="w-10 h-10 mb-2" />
                  <span className="text-sm font-medium">Upload for Boomerang Effect</span>
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Status Gradient Picker */}
        {mode === 'status' && (
          <div className="px-4 py-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto">
            {GRADIENTS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGradient(g)}
                className={`w-8 h-8 rounded-full ${g} ${selectedGradient === g ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
              />
            ))}
          </div>
        )}

        {/* AI Tools Bar (Only for regular posts/images) */}
        {mode !== 'status' && (content || selectedImage) && (
           <div className="px-4 py-2 bg-indigo-50 border-y border-indigo-100 flex items-center gap-3">
             <Sparkles className="w-4 h-4 text-indigo-600" />
             <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">AI Tools</span>
             
             {content && (
               <button
                 type="button"
                 onClick={handleEnhance}
                 disabled={isEnhancing}
                 className="text-xs flex items-center bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50"
               >
                 {isEnhancing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                 Magic Polish
               </button>
             )}
             
             {selectedImage && !content && mode === 'post' && (
                <button
                  type="button"
                  onClick={() => selectedImage && handleGenerateCaption(selectedImage, 'image/jpeg')}
                  disabled={isGeneratingCaption}
                  className="text-xs flex items-center bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50"
                >
                  {isGeneratingCaption ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                  Generate Caption
                </button>
             )}
           </div>
        )}

        {/* Bottom Actions */}
        <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
          <div className="flex items-center space-x-2">
            {mode !== 'status' && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Add Image"
                >
                  <ImageIcon className="w-6 h-6" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </>
            )}
            
            {lastSaved && (
              <div className="hidden md:flex text-xs text-slate-400 items-center ml-2">
                 <Save className="w-3 h-3 mr-1" />
                 Draft saved {new Date(lastSaved).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile draft indicator */}
            {lastSaved && (
              <div className="md:hidden text-xs text-slate-400">
                 Saved {new Date(lastSaved).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            )}
            <button
              type="submit"
              disabled={(!content && !selectedImage && mode !== 'status') || isEnhancing}
              className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>{mode === 'status' ? 'Share Status' : 'Post'}</span>
              <Send className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};