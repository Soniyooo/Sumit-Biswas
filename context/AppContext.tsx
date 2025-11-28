
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Post, Comment, Chat, Message, Notification } from '../types';

interface AppContextType {
  user: User | null;
  allUsers: User[];
  posts: Post[];
  chats: Chat[];
  notifications: Notification[];
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  addPost: (content: string, imageUrl?: string, aiEnhanced?: boolean, type?: Post['type'], background?: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  toggleFollow: (targetUserId: string) => void;
  togglePrivacy: () => void;
  startChat: (targetUserId: string) => string;
  sendMessage: (chatId: string, content: string) => void;
  getUser: (userId: string) => User | undefined;
  getStoriesForUser: (userId: string) => Post[];
  markNotificationsAsRead: () => void;
}

export const AppContext = createContext<AppContextType>({
  user: null,
  allUsers: [],
  posts: [],
  chats: [],
  notifications: [],
  loading: false,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  resetPassword: async () => ({ success: false }),
  logout: () => {},
  addPost: () => {},
  toggleLike: () => {},
  addComment: () => {},
  toggleFollow: () => {},
  togglePrivacy: () => {},
  startChat: () => "",
  sendMessage: () => {},
  getUser: () => undefined,
  getStoriesForUser: () => [],
  markNotificationsAsRead: () => {},
});

const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'You',
    email: 'you@sphere.com',
    password: 'password',
    avatar: 'https://picsum.photos/seed/you/200/200',
    bio: 'Photography enthusiast & tech lover.',
    followers: ['user-2', 'user-3'],
    following: ['user-2', 'user-3'],
    isPrivate: false
  },
  {
    id: 'user-2',
    name: 'Alice Wonder',
    email: 'alice@sphere.com',
    password: 'password',
    avatar: 'https://picsum.photos/seed/alice/200/200',
    bio: 'Chasing sunsets and coffee cups. ☕️🌅',
    followers: ['user-1', 'user-3'],
    following: ['user-1'],
    isPrivate: true
  },
  {
    id: 'user-3',
    name: 'Bob Builder',
    email: 'bob@sphere.com',
    password: 'password',
    avatar: 'https://picsum.photos/seed/bob/200/200',
    bio: 'Building dreams one brick at a time.',
    followers: ['user-1'],
    following: ['user-2'],
    isPrivate: false
  }
];

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    userId: 'user-2',
    userName: 'Alice Wonder',
    userAvatar: 'https://picsum.photos/seed/alice/200/200',
    content: 'Just discovered the most amazing coffee shop downtown! ☕️ The atmosphere is electric. #coffee #vibes #citylife',
    createdAt: Date.now() - 3600000,
    likes: ['user-1'],
    comments: [
      {
        id: 'c1',
        userId: 'user-3',
        userName: 'Bob Builder',
        userAvatar: 'https://picsum.photos/seed/bob/200/200',
        content: 'Where is it? I need caffeine!',
        createdAt: Date.now() - 1800000
      }
    ],
    type: 'regular'
  },
  {
    id: '8',
    userId: 'user-1',
    userName: 'You',
    userAvatar: 'https://picsum.photos/seed/you/200/200',
    content: 'Ideas are flowing! 💡 Time to build something amazing today. #motivation #buildinpublic',
    createdAt: Date.now() - 4000000,
    likes: [],
    comments: [],
    type: 'status',
    background: 'bg-gradient-to-r from-blue-400 to-emerald-400'
  },
  {
    id: '2',
    userId: 'user-3',
    userName: 'Bob Builder',
    userAvatar: 'https://picsum.photos/seed/bob/200/200',
    content: 'Working on a new project using React and Gemini. The possibilities are endless! 🚀 #coding #AI #react',
    imageUrl: 'https://picsum.photos/seed/tech/800/600',
    createdAt: Date.now() - 7200000,
    likes: ['user-2', 'user-1'],
    comments: [],
    type: 'regular'
  },
  {
    id: '9',
    userId: 'user-3',
    userName: 'Bob Builder',
    userAvatar: 'https://picsum.photos/seed/bob/200/200',
    content: 'Late night coding session... who else is up? 🦉💻 #nightowl #developer',
    createdAt: Date.now() - 12000000,
    likes: ['user-1'],
    comments: [],
    type: 'status',
    background: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
  },
  {
    id: '3',
    userId: 'user-1',
    userName: 'You',
    userAvatar: 'https://picsum.photos/seed/you/200/200',
    content: 'Sunday morning hikes are the best therapy. 🏔️ #nature #hiking #weekend',
    imageUrl: 'https://picsum.photos/seed/mountains/800/800',
    createdAt: Date.now() - 86400000,
    likes: ['user-2', 'user-3'],
    comments: [
      {
        id: 'c2',
        userId: 'user-2',
        userName: 'Alice Wonder',
        userAvatar: 'https://picsum.photos/seed/alice/200/200',
        content: 'This view is incredible! Take me next time.',
        createdAt: Date.now() - 85000000
      }
    ],
    type: 'regular'
  },
  {
    id: '10',
    userId: 'user-2',
    userName: 'Alice Wonder',
    userAvatar: 'https://picsum.photos/seed/alice/200/200',
    content: 'Summer vibes only! ☀️🌊 #summer #beach',
    createdAt: Date.now() - 100000000,
    likes: ['user-3'],
    comments: [],
    type: 'status',
    background: 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500'
  },
  {
    id: '4',
    userId: 'user-1',
    userName: 'You',
    userAvatar: 'https://picsum.photos/seed/you/200/200',
    content: 'Tried a new recipe today. Homemade pasta from scratch! 🍝 #foodie #cooking #italian',
    imageUrl: 'https://picsum.photos/seed/pasta/800/600',
    createdAt: Date.now() - 172800000,
    likes: ['user-2'],
    comments: [],
    aiEnhanced: true,
    type: 'boomerang'
  },
  {
    id: '5',
    userId: 'user-2',
    userName: 'Alice Wonder',
    userAvatar: 'https://picsum.photos/seed/alice/200/200',
    content: 'Feeling grateful today! ✨ #grateful #blessed',
    createdAt: Date.now() - 200000000,
    likes: ['user-1', 'user-3'],
    comments: [],
    type: 'status',
    background: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  {
    id: '6',
    userId: 'user-3',
    userName: 'Bob Builder',
    userAvatar: 'https://picsum.photos/seed/bob/200/200',
    content: 'Minimalist workspace setup. Finally complete. #setup #minimalism',
    imageUrl: 'https://picsum.photos/seed/setup/800/500',
    createdAt: Date.now() - 250000000,
    likes: ['user-1'],
    comments: [
      {
        id: 'c3',
        userId: 'user-1',
        userName: 'You',
        userAvatar: 'https://picsum.photos/seed/you/200/200',
        content: 'Clean! What keyboard is that?',
        createdAt: Date.now() - 240000000
      }
    ],
    type: 'regular'
  },
  {
    id: '7',
    userId: 'user-1',
    userName: 'You',
    userAvatar: 'https://picsum.photos/seed/you/200/200',
    content: 'Just finished reading "Project Hail Mary". Highly recommend it to any sci-fi fans out there! 📚👽 #books #scifi #reading',
    createdAt: Date.now() - 300000000,
    likes: ['user-3'],
    comments: [],
    aiEnhanced: true,
    type: 'regular'
  },
  {
    id: '11',
    userId: 'user-1',
    userName: 'You',
    userAvatar: 'https://picsum.photos/seed/you/200/200',
    content: 'Chasing the golden hour. 🌇 #sunset #goldenhour',
    createdAt: Date.now() - 350000000,
    likes: ['user-2'],
    comments: [],
    type: 'status',
    background: 'bg-gradient-to-r from-orange-400 to-rose-400'
  },
  {
    id: '12',
    userId: 'user-3',
    userName: 'Bob Builder',
    userAvatar: 'https://picsum.photos/seed/bob/200/200',
    content: 'Sometimes you just need to disconnect. #offline',
    createdAt: Date.now() - 400000000,
    likes: [],
    comments: [],
    type: 'status',
    background: 'bg-gradient-to-r from-gray-700 via-gray-900 to-black'
  },
  {
    id: '13',
    userId: 'user-2',
    userName: 'Alice Wonder',
    userAvatar: 'https://picsum.photos/seed/alice/200/200',
    content: 'Adventure awaits! #travel',
    createdAt: Date.now() - 450000000,
    likes: ['user-1'],
    comments: [],
    type: 'status',
    background: 'bg-gradient-to-r from-green-400 to-blue-500'
  }
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'like',
    userId: 'user-2',
    userName: 'Alice Wonder',
    userAvatar: 'https://picsum.photos/seed/alice/200/200',
    postId: '4',
    postPreview: 'Tried a new recipe today...',
    createdAt: Date.now() - 1800000,
    read: false
  },
  {
    id: 'n2',
    type: 'comment',
    userId: 'user-3',
    userName: 'Bob Builder',
    userAvatar: 'https://picsum.photos/seed/bob/200/200',
    postId: '6',
    postPreview: 'Minimalist workspace setup...',
    createdAt: Date.now() - 3600000,
    read: false
  },
  {
    id: 'n3',
    type: 'follow',
    userId: 'user-2',
    userName: 'Alice Wonder',
    userAvatar: 'https://picsum.photos/seed/alice/200/200',
    createdAt: Date.now() - 7200000,
    read: true
  }
];

// Helper to safely parse JSON from localStorage
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage`, e);
    return defaultValue;
  }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Use lazy initialization for state. This ensures we read from localStorage 
  // BEFORE the initial render, preventing data flashes or resets.
  
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const storedUsers = getFromStorage<User[]>('sphere_users_db', MOCK_USERS);
    
    // MIGRATION FIX:
    // If we have stored users but they are missing passwords (from older version of the app),
    // we need to patch them with a default password so login works.
    return storedUsers.map(u => {
      if (!u.password) {
        return { ...u, password: 'password' };
      }
      return u;
    });
  });
  
  const [posts, setPosts] = useState<Post[]>(() => 
    getFromStorage('sphere_posts', MOCK_POSTS)
  );
  
  const [chats, setChats] = useState<Chat[]>(() => 
    getFromStorage('sphere_chats', [])
  );
  
  const [notifications, setNotifications] = useState<Notification[]>(() => 
    getFromStorage('sphere_notifications', MOCK_NOTIFICATIONS)
  );
  
  // We try to restore the session immediately
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = getFromStorage<User | null>('sphere_user', null);
    if (!storedUser) return null;
    
    // Validate that the stored user still exists in our 'database'
    // This handles the edge case where the database might be cleared but session remains
    // We also use the 'allUsers' logic (mock users + stored users)
    const currentDb = getFromStorage<User[]>('sphere_users_db', MOCK_USERS);
    const dbUser = currentDb.find((u: User) => u.id === storedUser.id);
    return dbUser || null;
  });

  const [loading, setLoading] = useState(false);

  // Persistence Effects: Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('sphere_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('sphere_users_db', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('sphere_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('sphere_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sphere_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sphere_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
    
    if (!existingUser) {
      setLoading(false);
      return { success: false, message: 'Account not found. Please sign up.' };
    }

    if (existingUser.password && existingUser.password !== password) {
      setLoading(false);
      return { success: false, message: 'Incorrect password.' };
    }
    
    setUser(existingUser);
    setLoading(false);
    return { success: true };
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
    
    if (existingUser) {
      setLoading(false);
      return { success: false, message: 'Account already exists. Please log in.' };
    }

    const newUser: User = {
      id: 'user-' + Date.now(),
      email: cleanEmail,
      password,
      name,
      avatar: `https://picsum.photos/seed/${name.replace(/\s+/g, '')}/200/200`,
      bio: 'New to Sphere!',
      followers: [],
      following: [],
      isPrivate: false
    };
    
    setAllUsers(prev => [...prev, newUser]);
    setUser(newUser);
    setLoading(false);
    return { success: true };
  };

  const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const cleanEmail = email.trim().toLowerCase();
    const userIndex = allUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);
    
    if (userIndex === -1) {
      setLoading(false);
      return { success: false, message: 'User not found' };
    }

    const updatedUsers = [...allUsers];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newPassword };
    setAllUsers(updatedUsers);
    
    setLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const addPost = (content: string, imageUrl?: string, aiEnhanced?: boolean, type: Post['type'] = 'regular', background?: string) => {
    if (!user) return;
    const newPost: Post = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content,
      imageUrl,
      createdAt: Date.now(),
      likes: [],
      comments: [],
      aiEnhanced,
      type,
      background
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const toggleLike = (postId: string) => {
    if (!user) return;
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      const isLiked = post.likes.includes(user.id);
      
      // If liking (not unliking), create notification
      if (!isLiked && post.userId !== user.id) {
        const notif: Notification = {
          id: 'notif-' + Date.now(),
          type: 'like',
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          postId: post.id,
          postPreview: post.content.substring(0, 30),
          createdAt: Date.now(),
          read: false
        };
        setNotifications(prev => [notif, ...prev]);
      }

      return {
        ...post,
        likes: isLiked ? post.likes.filter(id => id !== user.id) : [...post.likes, user.id]
      };
    }));
  };

  const addComment = (postId: string, content: string) => {
    if (!user) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content,
      createdAt: Date.now()
    };
    
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      
      // Create notification for post owner
      if (post.userId !== user.id) {
         const notif: Notification = {
          id: 'notif-' + Date.now(),
          type: 'comment',
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          postId: post.id,
          postPreview: post.content.substring(0, 30),
          createdAt: Date.now(),
          read: false
        };
        setNotifications(prev => [notif, ...prev]);
      }

      return {
        ...post,
        comments: [...post.comments, newComment]
      };
    }));
  };

  const toggleFollow = (targetUserId: string) => {
    if (!user || user.id === targetUserId) return;

    const isFollowing = user.following.includes(targetUserId);

    // Update the "Database" of users
    setAllUsers(prev => prev.map(u => {
      // Update Me
      if (u.id === user.id) {
        return {
          ...u,
          following: isFollowing 
            ? u.following.filter(id => id !== targetUserId)
            : [...u.following, targetUserId]
        };
      }
      // Update Them
      if (u.id === targetUserId) {
        return {
          ...u,
          followers: isFollowing
            ? u.followers.filter(id => id !== user.id)
            : [...u.followers, user.id]
        };
      }
      return u;
    }));

    // Create Notification if following
    if (!isFollowing) {
        const notif: Notification = {
          id: 'notif-' + Date.now(),
          type: 'follow',
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          createdAt: Date.now(),
          read: false
        };
        setNotifications(prev => [notif, ...prev]);
    }

    // Update the session user state to match
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        following: isFollowing 
          ? prev.following.filter(id => id !== targetUserId)
          : [...prev.following, targetUserId]
      };
    });
  };

  const togglePrivacy = () => {
    if (!user) return;
    const newStatus = !user.isPrivate;
    
    setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, isPrivate: newStatus } : u));
    setUser(prev => prev ? { ...prev, isPrivate: newStatus } : null);
  };

  const startChat = (targetUserId: string) => {
    if (!user) return "";
    
    const existingChat = chats.find(c => 
      c.participants.includes(user.id) && c.participants.includes(targetUserId)
    );

    if (existingChat) return existingChat.id;

    const newChat: Chat = {
      id: 'chat-' + Date.now(),
      participants: [user.id, targetUserId],
      messages: [],
      updatedAt: Date.now()
    };

    setChats(prev => [newChat, ...prev]);
    return newChat.id;
  };

  const sendMessage = (chatId: string, content: string) => {
    if (!user) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      content,
      createdAt: Date.now()
    };

    setChats(prev => prev.map(chat => {
      if (chat.id !== chatId) return chat;
      return {
        ...chat,
        messages: [...chat.messages, newMessage],
        updatedAt: Date.now()
      };
    }).sort((a, b) => b.updatedAt - a.updatedAt));
  };

  const getUser = (userId: string) => allUsers.find(u => u.id === userId);
  
  const getStoriesForUser = (userId: string) => {
    return posts.filter(p => p.userId === userId && p.type === 'status');
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider value={{ 
      user, allUsers, posts, chats, notifications, loading, 
      login, signup, resetPassword, logout, addPost, toggleLike, addComment, 
      toggleFollow, togglePrivacy, startChat, sendMessage, getUser, getStoriesForUser, markNotificationsAsRead 
    }}>
      {children}
    </AppContext.Provider>
  );
};
