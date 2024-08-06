import express from 'express';
import categoryController from '../controllers/category.controller.js';
import verifyToken from '../middleware/auth.middleware.js';

const categoryRoute = express.Router();
const { categoryAdd, getAllCategories, getCategoryById, updateCategory, deleteCategory } = categoryController;

categoryRoute.post('/api/add-category', verifyToken, categoryAdd);
categoryRoute.get('/api/categories',verifyToken, getAllCategories);
categoryRoute.get('/api/categories/:id',verifyToken, getCategoryById);
categoryRoute.put('/api/categories/:id',verifyToken, updateCategory);
categoryRoute.delete('/api/categories/:id', verifyToken, deleteCategory);

export default categoryRoute;
