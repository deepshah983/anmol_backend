import express from 'express';
import { addInstrumentsHandler, fetchInstrumentsHandler } from '../controllers/scrips.controller.js';

const router = express.Router();

// Define the route for adding instruments to the database
router.get('/api/scrips/add-instruments', addInstrumentsHandler);
router.get('/api/scrips/fetch-instruments', fetchInstrumentsHandler);

export default router;
