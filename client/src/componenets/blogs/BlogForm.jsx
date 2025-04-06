import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const BlogForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  });
  const [errors, setErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
    const { user } = useAuth();
console.log("user",user)

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      const fetchBlog = async () => {
        try {
          const res = await axios.get(`/api/blogs/${id}`);
          setFormData({
            title: res.data.title,
            description: res.data.description,
            image: null
          });
        } catch (err) {
          console.error(err);
          navigate('/dashboard');
        }
      };
      fetchBlog();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('author', user.id); 
      if (formData.image) {
        data.append('image', formData.image);
      }
      
      if (isEdit) {
        await axios.put(`/api/blogs/${id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('/api/blogs', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.response?.data?.message || 'An error occurred' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {isEdit ? 'Edit Blog' : 'Create New Blog'}
          </h2>
          
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-700">{errors.submit}</div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                className={`mt-1 block w-full rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows="4"
                className={`mt-1 block w-full rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                value={formData.description}
                onChange={handleChange}
              ></textarea>
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Blog Image
              </label>
              <input
                type="file"
                name="image"
                id="image"
                accept="image/*"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                onChange={handleChange}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isEdit ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogForm;