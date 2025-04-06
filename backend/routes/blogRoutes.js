
import express from 'express';
import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import Blog from '../models/Blog.js';
import upload from '../middleware/upload.js';

const router = Router();

router.post('/', protect, upload.single('image'), async (req, res) => {
  const { title, description ,author } = req.body;
  console.log("here it exexcutes",req.body)
  try {
    const blog = new Blog({
      title,
      description,
      image: req.file ? req.file.path : '',
      author: author
    });
    
    await blog.save();
    res.json(blog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().populate('author', 'email profileImage').sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


router.get('/getOne/:id', async (req, res) => {
    try {
      const blogs = await Blog.find({author:req.params.id}).populate('author', 'email profileImage').sort({ createdAt: -1 });
      res.json(blogs);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });


router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'email profileImage')
      .populate('comments.author', 'email profileImage')
      .populate('comments.replies.author', 'email profileImage');
      
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


router.put('/:id', protect, upload.single('image'), async (req, res) => {
  const { title, description } = req.body;
  
  try {
    console.log("here it exexcutes",req.body)
    let blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
 
    
    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.image = req.file ? req.file.path : blog.image;
    
    await blog.save();
    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete blog
router.delete('/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    

  
    res.json({ message: 'Blog removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/blogs/:id/comments
// @desc    Add comment to blog
router.post('/:id/comments', protect, async (req, res) => {
  const { text } = req.body;
  
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    const newComment = {
      text,
      author: req.user.id
    };
    
    blog.comments.unshift(newComment);
    await blog.save();
    
    res.json(blog.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/blogs/:id/comments/:commentId/replies
// @desc    Add reply to comment
router.post('/:id/comments/:commentId/replies', protect, async (req, res) => {
  const { text } = req.body;
  
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    const comment = blog.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const newReply = {
      text,
      author: req.user.id
    };
    
    comment.replies.unshift(newReply);
    await blog.save();
    
    res.json(comment.replies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;