
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  bio?: string;
  followers: string[]; // Array of User IDs
  following: string[]; // Array of User IDs
  password?: string; // For mock authentication
  isPrivate?: boolean; // New: Profile lock feature
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  imageUrl?: string;
  createdAt: number;
  likes: string[]; // Array of user IDs
  comments: Comment[];
  aiEnhanced?: boolean;
  type?: 'regular' | 'status' | 'boomerang'; // New: Post types
  background?: string; // New: Gradient background for status posts
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  participants: string[]; // User IDs
  messages: Message[];
  updatedAt: number;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow';
  userId: string; // Actor
  userName: string;
  userAvatar: string;
  postId?: string;
  postPreview?: string;
  createdAt: number;
  read: boolean;
}

export interface AuthState {
  user: User | null;
  posts: Post[];
  loading: boolean;
}
