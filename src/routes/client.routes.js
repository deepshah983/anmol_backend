// routes/client.routes.js
import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import clientController from '../controllers/client.controller.js';

const router = express.Router();

router.post('/api/clients', upload.single('profileImage'), clientController.clientAdd);
router.get('/api/clients', clientController.getAllClients);
router.get('/api/clients/:id', clientController.getClientById);
router.put('/api/clients/:id', upload.single('profileImage'), clientController.updateClient);
router.delete('/api/clients/:id', clientController.deleteClient);

export default router;