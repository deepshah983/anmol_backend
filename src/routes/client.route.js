import express from 'express';
import clientController from '../controllers/client.controller.js'; // Adjust path if necessary

const clientRoute = express.Router();
const { clientAdd } = clientController;

clientRoute.post('/api/add-client', clientAdd);

export default clientRoute; // Default export
