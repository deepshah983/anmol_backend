import express from 'express';
import categoryController from '../controllers/category.controller.js'; // Adjust path if necessary

const categoryRoute = express.Router();
const { categoryAdd, getAllCategories, getCategoryById, updateCategory, deleteCategory } = categoryController;

categoryRoute.post('/api/add-category', categoryAdd);
categoryRoute.get('/api/categories', getAllCategories);
categoryRoute.get('/api/categories/:id', getCategoryById);
categoryRoute.put('/api/categories/:id', updateCategory);
categoryRoute.delete('/api/categories/:id', deleteCategory);

export default categoryRoute; // Default export
