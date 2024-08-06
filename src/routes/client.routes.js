import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import clientController from '../controllers/client.controller.js';
import verifyToken from '../middleware/auth.middleware.js';

const router = express.Router();

const { clientAdd, getAllClients, getClientById, updateClient, deleteClient } = clientController;


router.post('/api/clients',verifyToken, upload.single('profileImage'), clientAdd);
router.get('/api/clients',verifyToken, getAllClients);
router.get('/api/clients/:id',verifyToken, getClientById);
router.put('/api/clients/:id',verifyToken, upload.single('profileImage'), updateClient);
router.delete('/api/clients/:id',verifyToken, deleteClient);

export default router;