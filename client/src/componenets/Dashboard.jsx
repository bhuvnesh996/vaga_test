import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Blog Platform</h1>
              </div>
            </div>
            <div className="ml-6 flex items-center">
              {user && (
                <div className="flex items-center space-x-4">

                
                  <Link
                    to="/blogs"
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Browse blogs
                  </Link>
                  
                  {/* Profile dropdown */}
                  <div className="relative ml-3">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 focus:outline-none"
                    >
                      {user.profileImage ? (
                        <img
                          className="h-8 w-8 rounded-full object-cover"
                          src={`http://localhost:5000/${user.profileImage}`}
                          alt="Profile"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-700">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700 hidden md:inline">
                        {user.email}
                      </span>
                      <svg
                        className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                          isProfileOpen ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {isProfileOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.email}</p>
                          <p className="text-xs text-gray-500">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Your Blogs
                        </Link>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Profile Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.email.split('@')[0]}!</h2>
          <p className="text-gray-500 mt-1">Here's what's happening with your blogs today.</p>
          
          <div className="mt-8 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Blog cards or list will go here */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Your Blog Stats</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Blogs</p>
                  <p className="text-2xl font-semibold">XXXX</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Created</p>
                  <p className="text-md">XX days ago</p>
                </div>
              </div>
            </div>
            {/* Add more cards or your blog list component here */}
          </div>
        </div>
        <div>
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;