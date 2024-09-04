import express from 'express';
import dashboardController from '../controllers/dashboard.controller.js';
import verifyToken from '../middleware/auth.middleware.js';

const dashboardRoute = express.Router();
const { getCounts } = dashboardController;

// Route to get counts, protected by verifyToken middleware
dashboardRoute.get('/api/dashboard/counts', verifyToken, getCounts);

export default dashboardRoute;
