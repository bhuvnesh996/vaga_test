import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import SignUp from './componenets/auth/SignUp';
import Login from './componenets/auth/Login';
import PrivateRoute from './componenets/PrivateRoute';
import Dashboard from './componenets/Dashboard';
import BlogList from './componenets/blogs/BlogList';
import BlogForm from './componenets/blogs/BlogForm';
import BlogDetail from './componenets/blogs/BlogDetail';
import { AuthProvider } from './context/AuthContext';
import BlogAll from './componenets/blogs/BlogAll';
// import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<BlogList />} />
            </Route>
            <Route path="/blogs/new" element={<BlogForm />} />
            <Route path="/blogs/edit/:id" element={<BlogForm />} />
            <Route path="/blogs/:id" element={<BlogDetail />} />
            <Route path="/blogs" element={<BlogAll />} />
          </Route>
          
          {/* Redirect to dashboard by default */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
export default App;