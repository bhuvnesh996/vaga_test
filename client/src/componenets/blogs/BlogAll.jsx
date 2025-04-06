import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BlogAll = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  
  const { user } = useAuth();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get('/api/blogs');
        setBlogs(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch blogs');
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  const handleViewDetails = async (id) => {
    try {
      const res = await axios.get(`/api/blogs/${id}`);
      setSelectedBlog(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch blog details');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    
    try {
      const res = await axios.post(`/api/blogs/${selectedBlog._id}/comments`, { text: commentText });
      
      setSelectedBlog({
        ...selectedBlog,
        comments: res.data
      });
      
      setCommentText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleAddReply = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim() || !user) return;
    
    try {
      const res = await axios.post(
        `/api/blogs/${selectedBlog._id}/comments/${commentId}/replies`, 
        { text: replyText }
      );
      
      // Update the comments with the new reply
      const updatedComments = selectedBlog.comments.map(comment => {
        if (comment._id === commentId) {
          return { ...comment, replies: res.data };
        }
        return comment;
      });
      
      setSelectedBlog({
        ...selectedBlog,
        comments: updatedComments
      });
      
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add reply');
    }
  };

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // If a blog is selected, show the blog detail view
  if (selectedBlog) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button 
          onClick={() => setSelectedBlog(null)}
          className="mb-6 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to blogs
        </button>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Blog header */}
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h1 className="text-2xl font-bold text-white">{selectedBlog.title}</h1>
            <p className="mt-1 text-sm text-indigo-100">
              By {selectedBlog.author?.name || 'Unknown'} 
              {selectedBlog.createdAt && ` • ${new Date(selectedBlog.createdAt).toLocaleDateString()}`}
            </p>
          </div>
          
          {/* Blog content */}
          <div className="px-4 py-5 sm:p-6">
            {selectedBlog.image && (
              <div className="mb-6">
                <img 
                  src={`http://localhost:5000/${selectedBlog.image}`} 
                  alt={selectedBlog.title}
                  className="w-full h-64 object-cover rounded-lg" 
                />
              </div>
            )}
            
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedBlog.description}</p>
              {selectedBlog.content && <p className="text-gray-700 whitespace-pre-wrap mt-4">{selectedBlog.content}</p>}
            </div>
          </div>
          
          {/* Comments section */}
          <div className="px-4 py-5 sm:p-6 bg-gray-50 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>
            
            {/* Comment form */}
            {user ? (
              <form onSubmit={handleAddComment} className="mb-8">
                <div className="mt-1">
                  <textarea
                    rows={3}
                    name="comment"
                    id="comment"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Leave a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Post Comment
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Please <Link to="/login" className="font-medium underline">sign in</Link> to leave a comment.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Comments list */}
            <div className="space-y-6">
              {selectedBlog.comments && selectedBlog.comments.length > 0 ? (
                selectedBlog.comments.map((comment) => (
                  <div key={comment._id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {comment.author?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {comment.author?.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>{comment.text}</p>
                    </div>
                    
                    {/* Reply button */}
                    {user && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                          className="text-sm text-indigo-600 hover:text-indigo-900"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                    
                    {/* Reply form */}
                    {replyingTo === comment._id && (
                      <form onSubmit={(e) => handleAddReply(e, comment._id)} className="mt-3">
                        <div className="mt-1">
                          <textarea
                            rows={2}
                            name="reply"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                        </div>
                        <div className="mt-2 flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Post Reply
                          </button>
                        </div>
                      </form>
                    )}
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="mt-3">
                            <div className="flex space-x-3">
                              <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 flex items-center justify-center">
                                  <span className="text-white font-medium text-xs">
                                    {reply.author?.name?.charAt(0) || 'U'}
                                  </span>
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {reply.author?.name || 'Unknown User'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(reply.createdAt).toLocaleString()}
                                </p>
                                <div className="mt-1 text-sm text-gray-700">
                                  <p>{reply.text}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Blog listing view
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-white">Explore Blogs</h3>
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search blogs by title or description..."
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "No blogs match your search criteria" : "There are no blogs to display yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredBlogs.map((blog) => (
                <div key={blog._id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-lg">
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    {blog.image ? (
                      <img
                        className="w-full h-full object-cover"
                        src={`http://localhost:5000/${blog.image}`}
                        alt={blog.title}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{blog.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      By {blog.author?.name || 'Unknown'} 
                      {blog.createdAt && ` • ${new Date(blog.createdAt).toLocaleDateString()}`}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{blog.description}</p>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 flex justify-between items-center border-t border-gray-200">
                    <button
                      onClick={() => handleViewDetails(blog._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Read Blog
                    </button>
                    {blog.comments && (
                      <span className="inline-flex items-center text-sm text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {blog.comments.length} {blog.comments.length === 1 ? 'comment' : 'comments'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogAll;