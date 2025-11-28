
import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Feed } from './components/Feed';
import { CreatePost } from './components/CreatePost';
import { UserProfile } from './components/UserProfile';
import { Search } from './components/Search';
import { ChatList, ChatWindow } from './components/Chat';
import { SinglePost } from './components/SinglePost';
import { Notifications } from './components/Notifications';
import { StatusViewer } from './components/StatusViewer';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { user } = useContext(AppContext);
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const AppContent = () => {
  const { user, loading } = useContext(AppContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" replace />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Feed />} />
        <Route path="search" element={<Search />} />
        <Route path="create" element={<CreatePost />} />
        <Route path="chat" element={<ChatList />} />
        <Route path="chat/:chatId" element={<ChatWindow />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="user/:userId" element={<UserProfile />} />
        <Route path="post/:postId" element={<SinglePost />} />
      </Route>
      <Route path="/stories/:userId" element={<ProtectedRoute><StatusViewer /></ProtectedRoute>} />
    </Routes>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </HashRouter>
  );
}
