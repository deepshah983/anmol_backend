import express from 'express';
import dashboardController from '../controllers/dashboard.controller.js';
import verifyToken from '../middleware/auth.middleware.js';

const dashboardRoute = express.Router();
const { getCounts, getTotalFund } = dashboardController;

// Route to get counts, protected by verifyToken middleware
dashboardRoute.get('/api/dashboard/counts', verifyToken, getCounts);
dashboardRoute.get('/api/dashboard/totalFund', verifyToken, getTotalFund);
export default dashboardRoute;
