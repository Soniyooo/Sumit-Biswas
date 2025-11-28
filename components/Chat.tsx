import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';

export const ChatList = () => {
  const { chats, user, getUser } = useContext(AppContext);
  const navigate = useNavigate();

  const userChats = chats.filter(chat => user && chat.participants.includes(user.id));

  if (userChats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] text-center p-6">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Messages Yet</h2>
        <p className="text-slate-500 mt-2 max-w-xs">Connect with others by visiting their profile and tapping Message.</p>
        <button 
           onClick={() => navigate('/search')}
           className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Find People
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="p-4 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
      </div>
      <div className="divide-y divide-slate-100">
        {userChats.map(chat => {
          const otherUserId = chat.participants.find(id => id !== user?.id);
          const otherUser = otherUserId ? getUser(otherUserId) : null;
          const lastMessage = chat.messages[chat.messages.length - 1];

          if (!otherUser) return null;

          return (
            <div 
              key={chat.id} 
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="flex items-center p-4 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <img src={otherUser.avatar} alt={otherUser.name} className="w-12 h-12 rounded-full" />
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-slate-900 truncate">{otherUser.name}</h3>
                  {lastMessage && (
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                      {new Date(lastMessage.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate">
                  {lastMessage ? lastMessage.content : <span className="italic text-slate-400">Drafting...</span>}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ChatWindow = () => {
  const { chatId } = useParams();
  const { chats, user, getUser, sendMessage } = useContext(AppContext);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const chat = chats.find(c => c.id === chatId);
  const otherUserId = chat?.participants.find(id => id !== user?.id);
  const otherUser = otherUserId ? getUser(otherUserId) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatId && inputText.trim()) {
      sendMessage(chatId, inputText);
      setInputText('');
    }
  };

  if (!chat || !otherUser) return <div>Chat not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center space-x-3 shadow-sm bg-white z-10">
        <button onClick={() => navigate('/chat')} className="md:hidden text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <img src={otherUser.avatar} alt={otherUser.name} className="w-10 h-10 rounded-full" />
        <div>
          <h3 className="font-semibold text-slate-900">{otherUser.name}</h3>
          <p className="text-xs text-slate-500">Active now</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {chat.messages.map(msg => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                 isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-none'
               }`}>
                 <p className="text-sm">{msg.content}</p>
                 <span className={`text-[10px] block mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                   {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </span>
               </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 pb-safe">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 border-none"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};