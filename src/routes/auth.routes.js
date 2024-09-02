import express from 'express';
import authController from '../controllers/auth.controller.js';

const authRoute = express.Router();
const { login } = authController;

authRoute.post('/api/authorization/login', login);

export default authRoute;
