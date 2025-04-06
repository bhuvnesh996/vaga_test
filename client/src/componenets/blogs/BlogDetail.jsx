import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const BlogDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [reply, setReply] = useState({ text: '', commentId: '' });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`/api/blogs/${id}`);
        setBlog(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch blog');
        setLoading(false);
      }
    };
    
    fetchBlog();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await axios.delete(`/api/blogs/${id}`);
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete blog');
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    try {
      const res = await axios.post(`/api/blogs/${id}/comments`, { text: comment });
      setBlog({ ...blog, comments: res.data });
      setComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    if (!reply.text.trim()) return;
    
    try {
      const res = await axios.post(`/api/blogs/${id}/comments/${commentId}/replies`, { text: reply.text });
      const updatedComments = blog.comments.map(c => 
        c._id === commentId ? { ...c, replies: res.data } : c
      );
      setBlog({ ...blog, comments: updatedComments });
      setReply({ text: '', commentId: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add reply');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!blog) return <div>Blog not found</div>;

  return (
    <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">{blog.title}</h2>
            {user && user.email === blog.author.email && (
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/blogs/edit/${blog._id}`)}
                  className="px-3 py-1 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          
          {blog.image && (
            <div className="mb-6">
              <img
                src={`http://localhost:5000/${blog.image}`}
                alt={blog.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}
          
          <div className="prose max-w-none mb-8">
            <p className="whitespace-pre-line">{blog.description}</p>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>
            
            {user && (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Post
                  </button>
                </div>
              </form>
            )}
            
            <div className="space-y-4">
              {blog.comments.map((comment) => (
                <div key={comment._id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-start space-x-3">
                    {comment.author.profileImage ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={`http://localhost:5000/${comment.author.profileImage}`}
                        alt={comment.author.email}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {comment.author.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {comment.author.email}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {comment.text}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </div>
                      
                      {/* Replies */}
                      <div className="mt-2 pl-4 border-l-2 border-gray-200 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="pt-2">
                            <div className="flex items-start space-x-3">
                              {reply.author.profileImage ? (
                                <img
                                  className="h-6 w-6 rounded-full"
                                  src={`http://localhost:5000/${reply.author.profileImage}`}
                                  alt={reply.author.email}
                                />
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    {reply.author.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="text-xs font-medium text-gray-900">
                                  {reply.author.email}
                                </div>
                                <div className="text-xs text-gray-700 mt-1">
                                  {reply.text}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(reply.createdAt).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {user && (reply.commentId !== comment._id) && (
                          <button
                            onClick={() => setReply({ text: '', commentId: comment._id })}
                            className="text-xs text-indigo-600 hover:text-indigo-900 mt-1"
                          >
                            Reply
                          </button>
                        )}
                        
                        {reply.commentId === comment._id && (
                          <form onSubmit={(e) => handleReplySubmit(e, comment._id)} className="mt-2">
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={reply.text}
                                onChange={(e) => setReply({ ...reply, text: e.target.value })}
                                placeholder="Write a reply..."
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                              />
                              <button
                                type="submit"
                                className="px-2 py-1 rounded-md text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                              >
                                Post
                              </button>
                              <button
                                type="button"
                                onClick={() => setReply({ text: '', commentId: '' })}
                                className="px-2 py-1 rounded-md text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;