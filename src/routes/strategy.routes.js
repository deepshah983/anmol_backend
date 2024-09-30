import express from 'express';
import strategyController from '../controllers/strategy.controller.js';
import verifyToken from '../middleware/auth.middleware.js';
import multer from 'multer';

// Set up multer for handling form-data (without file uploads)
const upload = multer();

const strategyRoute = express.Router();
const { strategyAdd, getAllStrategies, getStrategyById, updateStrategy, deleteStrategy, deleteSelectedStrategy } = strategyController;

strategyRoute.post('/api/strategy', verifyToken, upload.none(), strategyAdd);
strategyRoute.get('/api/strategies', verifyToken, getAllStrategies);
strategyRoute.get('/api/strategy/:id', verifyToken, getStrategyById);
strategyRoute.put('/api/strategy/:id', verifyToken, upload.none(), updateStrategy);
strategyRoute.delete('/api/strategy/:id', verifyToken, deleteStrategy);
strategyRoute.delete('/api/strategies/selectedDataErase/:id', verifyToken, deleteSelectedStrategy);

export default strategyRoute;