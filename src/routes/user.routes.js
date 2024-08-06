// In user.routes.js
import express from 'express';
import userController from '../controllers/user.controller.js';
import verifyToken from '../middleware/auth.middleware.js';

const userRoute = express.Router();
const { userAdd, getAllUsers, getUserById, updateUser, deleteUser, loginUser } = userController;

userRoute.post('/api/login', loginUser);
userRoute.post('/api/add-user', userAdd);
userRoute.get('/api/users', verifyToken, getAllUsers);
userRoute.get('/api/users/:id', verifyToken, getUserById);
userRoute.put('/api/users/:id', verifyToken, updateUser);
userRoute.delete('/api/users/:id', verifyToken, deleteUser);

export default userRoute;