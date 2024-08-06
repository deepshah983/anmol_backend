import express from 'express';
import stockController from '../controllers/stock.controller.js';
import verifyToken from '../middleware/auth.middleware.js';

const stockRoute = express.Router();
const { stockAdd, getAllStocks, getStockById, updateStock, deleteStock } = stockController;

stockRoute.post('/api/add-stock',verifyToken, stockAdd);
stockRoute.get('/api/stocks',verifyToken, getAllStocks);
stockRoute.get('/api/stocks/:id',verifyToken, getStockById);
stockRoute.put('/api/stocks/:id',verifyToken, updateStock);
stockRoute.delete('/api/stocks/:id',verifyToken, deleteStock);

export default stockRoute;
