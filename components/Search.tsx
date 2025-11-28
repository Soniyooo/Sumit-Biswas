
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, User as UserIcon, Hash, Users, ArrowRight } from 'lucide-react';
import { Feed } from './Feed';

// Mock Groups Data (since we don't have a backend for groups yet)
const MOCK_GROUPS = [
  { id: 'g1', name: 'Photography Lovers', members: 1254, image: 'https://picsum.photos/seed/photo/200/200', desc: 'Share your best shots and get feedback!' },
  { id: 'g2', name: 'Tech Talk', members: 892, image: 'https://picsum.photos/seed/tech/200/200', desc: 'Discussing the latest in tech, AI, and gadgets.' },
  { id: 'g3', name: 'Hikers United', members: 543, image: 'https://picsum.photos/seed/hike/200/200', desc: 'Trails, gear, and adventures around the world.' },
  { id: 'g4', name: 'React Developers', members: 2100, image: 'https://picsum.photos/seed/react/200/200', desc: 'Components, hooks, and state management.' },
  { id: 'g5', name: 'Digital Art', members: 765, image: 'https://picsum.photos/seed/art/200/200', desc: 'For digital artists, illustrators and creators.' },
  { id: 'g6', name: 'Foodies', members: 3200, image: 'https://picsum.photos/seed/food/200/200', desc: 'Recipes, reviews, and delicious photos.' },
];

export const Search = () => {
  const { allUsers, posts } = useContext(AppContext);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'accounts' | 'posts' | 'hashtags' | 'groups'>('accounts');

  // Filter Users
  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(query.toLowerCase()) || 
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  // Filter Posts
  const filteredPosts = posts.filter(p => 
    p.content.toLowerCase().includes(query.toLowerCase())
  );

  // Extract and Filter Hashtags
  // 1. Get all hashtags from all posts
  const allHashtags = Array.from(new Set(
    posts.flatMap(p => p.content.match(/#[a-zA-Z0-9_]+/g) || [])
  ));
  // 2. Filter by query
  const filteredHashtags = allHashtags.filter(tag => 
    tag.toLowerCase().includes(query.toLowerCase())
  );

  // Filter Groups
  const filteredGroups = MOCK_GROUPS.filter(g => 
    g.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleHashtagClick = (tag: string) => {
    setQuery(tag);
    setActiveTab('posts');
  };

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
     <button
        onClick={() => setActiveTab(id)}
        className={`flex-1 min-w-[80px] pb-3 pt-2 text-sm font-medium transition-colors relative flex flex-col items-center justify-center gap-1 ${
          activeTab === id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Icon className={`w-5 h-5 ${activeTab === id ? 'stroke-2' : ''}`} />
        <span>{label}</span>
        {activeTab === id && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full mx-2" />
        )}
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Header */}
      <div className="bg-white sticky top-0 md:top-auto z-10 border-b border-slate-200 shadow-sm">
        <div className="px-4 py-3">
            <div className="relative">
            <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 placeholder-slate-500 transition-all"
            />
            </div>
        </div>
        
        <div className="flex overflow-x-auto no-scrollbar px-2">
            <TabButton id="accounts" label="People" icon={UserIcon} />
            <TabButton id="posts" label="Posts" icon={SearchIcon} />
            <TabButton id="hashtags" label="Hashtags" icon={Hash} />
            <TabButton id="groups" label="Groups" icon={Users} />
        </div>
      </div>

      <div className="pb-20">
        {/* ACCOUNTS TAB */}
        {activeTab === 'accounts' && (
          <div className="p-4 space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <Link 
                  key={user.id} 
                  to={`/user/${user.id}`}
                  className="flex items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                >
                  <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full bg-slate-200" />
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-slate-900">{user.name}</h3>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <p className="text-xs text-slate-400 mt-1">{user.followers.length} followers</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No people found matching "{query}"</p>
              </div>
            )}
          </div>
        )}

        {/* POSTS TAB */}
        {activeTab === 'posts' && (
           <Feed posts={filteredPosts} emptyMessage={`No posts found for "${query}"`} />
        )}

        {/* HASHTAGS TAB */}
        {activeTab === 'hashtags' && (
            <div className="p-4">
                {filteredHashtags.length > 0 ? (
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        {filteredHashtags.map((tag, index) => (
                            <button
                                key={index}
                                onClick={() => handleHashtagClick(tag)}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors text-left"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Hash className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-slate-800">{tag}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-400">
                        <Hash className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No hashtags found matching "{query}"</p>
                    </div>
                )}
            </div>
        )}

        {/* GROUPS TAB */}
        {activeTab === 'groups' && (
            <div className="p-4 space-y-4">
                {filteredGroups.length > 0 ? (
                    filteredGroups.map(group => (
                        <div key={group.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
                            <img src={group.image} alt={group.name} className="w-14 h-14 rounded-xl object-cover bg-slate-200" />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 truncate">{group.name}</h3>
                                <p className="text-xs text-slate-500 mb-1">{group.members.toLocaleString()} members</p>
                                <p className="text-sm text-slate-600 truncate">{group.desc}</p>
                            </div>
                            <button className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-100 transition-colors">
                                Join
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No groups found matching "{query}"</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
