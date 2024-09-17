import express from 'express';
import strategyController from '../controllers/strategy.controller.js';
import verifyToken from '../middleware/auth.middleware.js';

const strategyRoute = express.Router();
const { strategyAdd, getAllStrategies, getStrategyById, updateStrategy, deleteStrategy } = strategyController;

strategyRoute.post('/api/add-strategy', verifyToken, strategyAdd);
strategyRoute.get('/api/strategies', verifyToken, getAllStrategies);
strategyRoute.get('/api/strategy/:id', verifyToken, getStrategyById);
strategyRoute.put('/api/strategy/:id', verifyToken, updateStrategy);
strategyRoute.delete('/api/strategy/:id', verifyToken, deleteStrategy);

export default strategyRoute;
