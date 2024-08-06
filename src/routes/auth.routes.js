import express from 'express';
import authController from '../controllers/auth.controller.js';

const authRoute = express.Router();
const { login } = authController;

authRoute.post('/api/login', login);

export default authRoute;
