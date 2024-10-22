// In user.routes.js
import express from 'express';
import ZerodhaAuthToken from '../controllers/zerodhaAuthToken.controller.js';
import verifyToken from '../middleware/auth.middleware.js';
import multer from 'multer';

const uploadNone = multer();
const zerodhaAuthTokenRouter = express.Router();

const { processRequestToken } = ZerodhaAuthToken;
// Login callback endpoint
zerodhaAuthTokenRouter.post('/api/zerodhaAuthToken/auth-token', uploadNone.none(), processRequestToken);


// Manual refresh endpoint
//zerodhaAuthTokenRouter.get('/api/zerodhaAuthToken/token-status', ZerodhaAuthToken.getTokenStatus);

export default zerodhaAuthTokenRouter;