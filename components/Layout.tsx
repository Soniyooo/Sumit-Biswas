
import React, { useContext } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, PlusSquare, User, LogOut, Hexagon, Search, MessageCircle, Bell } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export const Layout = () => {
  const { user, logout, notifications } = useContext(AppContext);
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.read).length;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 shadow-sm z-10">
        <div className="p-6 flex items-center space-x-3">
          <Hexagon className="w-8 h-8 text-indigo-600 fill-indigo-100" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sphere</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem to="/" icon={<Home />} label="Home" active={isActive('/')} />
          <NavItem to="/search" icon={<Search />} label="Search" active={isActive('/search')} />
          <NavItem to="/create" icon={<PlusSquare />} label="Create" active={isActive('/create')} />
          <NavItem to="/chat" icon={<MessageCircle />} label="Messages" active={isActive('/chat')} />
          <NavItem 
            to="/notifications" 
            icon={
              <div className="relative">
                <Bell />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
              </div>
            } 
            label="Notifications" 
            active={isActive('/notifications')} 
          />
          <NavItem to={`/user/${user?.id}`} icon={<User />} label="Profile" active={isActive(`/user/${user?.id}`)} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link to={`/user/${user?.id}`} className="flex items-center space-x-3 mb-4 px-2 hover:bg-slate-50 p-2 rounded-lg transition-colors">
            <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-full bg-slate-200" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </Link>
          <button 
            onClick={logout}
            className="flex items-center w-full px-2 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative w-full" id="main-scroll">
        <div className="max-w-2xl mx-auto pb-20 md:pb-0 min-h-full">
           {/* Mobile Header */}
           <div className="md:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center">
             
             {/* Left: Create Post + Logo */}
             <div className="flex items-center gap-3">
               <Link to="/create" className="text-slate-600 hover:text-indigo-600 transition-colors">
                 <PlusSquare className="w-6 h-6" />
               </Link>
               <div className="flex items-center space-x-2">
                 <Hexagon className="w-6 h-6 text-indigo-600 fill-indigo-100" />
                 <span className="font-bold text-lg text-slate-900">Sphere</span>
               </div>
             </div>

             {/* Right: Notifications + Messages */}
             <div className="flex items-center gap-3">
                <Link to="/notifications" className="text-slate-600 hover:text-indigo-600 transition-colors relative">
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                </Link>
                <Link to="/chat" className="text-slate-600 hover:text-indigo-600 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </Link>
             </div>
           </div>
           
           <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-30 pb-safe">
        <MobileNavItem to="/" icon={<Home />} active={isActive('/')} />
        <MobileNavItem to="/search" icon={<Search />} active={isActive('/search')} />
        <MobileNavItem to="/create" icon={<PlusSquare />} active={isActive('/create')} />
        <MobileNavItem to="/chat" icon={<MessageCircle />} active={isActive('/chat')} />
        <MobileNavItem to={`/user/${user?.id}`} icon={<User />} active={isActive(`/user/${user?.id}`)} />
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) => {
  const IconElement = React.cloneElement(icon as React.ReactElement<{ className?: string }>, { 
    className: `w-5 h-5 mr-3 ${active ? 'stroke-2' : ''}` 
  });
  
  return (
    <Link 
      to={to} 
      className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-indigo-50 text-indigo-700 font-semibold' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {IconElement}
      {label}
    </Link>
  );
};

const MobileNavItem = ({ to, icon, active }: { to: string, icon: React.ReactNode, active: boolean }) => {
  const IconElement = React.cloneElement(icon as React.ReactElement<{ className?: string }>, { 
    className: `w-6 h-6 ${active ? 'stroke-2' : ''}` 
  });

  return (
    <Link 
      to={to} 
      className={`p-3 rounded-full transition-all ${
        active 
          ? 'bg-indigo-100 text-indigo-700' 
          : 'text-slate-500'
      }`}
    >
      {IconElement}
    </Link>
  );
};
