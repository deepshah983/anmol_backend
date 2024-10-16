import express from 'express';
import tradingFormController from '../controllers/trading.controller.js';
import verifyToken from '../middleware/auth.middleware.js';
import multer from 'multer';

// Set up multer for handling form-data (without file uploads)
const upload = multer();

const tradingFormRoute = express.Router();
const { createTradingForm, getAllTradingForm, updateTradingForm, deleteTradingForm, deleteSelectedTradingForm, exportTradingData, importTradingData } = tradingFormController;

tradingFormRoute.post('/api/tradingForm', verifyToken, upload.none(), createTradingForm);
tradingFormRoute.get('/api/tradingForm', verifyToken, getAllTradingForm);
tradingFormRoute.put('/api/tradingForm/:id', verifyToken, upload.none(), updateTradingForm);
tradingFormRoute.delete('/api/tradingForm/:id', verifyToken, deleteTradingForm);
tradingFormRoute.delete('/api/tradingForm/selectedDataErase/:id', verifyToken, deleteSelectedTradingForm);
tradingFormRoute.get('/api/tradingForm/export', verifyToken, exportTradingData);
tradingFormRoute.post('/api/tradingForm/import', verifyToken, importTradingData);

export default tradingFormRoute;