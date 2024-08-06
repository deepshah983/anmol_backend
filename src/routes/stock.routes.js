import express from 'express';
import stockController from '../controllers/stock.controller.js'; // Adjust path if necessary

const stockRoute = express.Router();
const { stockAdd, getAllStocks, getStockById, updateStock, deleteStock } = stockController;

stockRoute.post('/api/add-stock', stockAdd);
stockRoute.get('/api/stocks', getAllStocks);
stockRoute.get('/api/stocks/:id', getStockById);
stockRoute.put('/api/stocks/:id', updateStock);
stockRoute.delete('/api/stocks/:id', deleteStock);

export default stockRoute; // Default export
