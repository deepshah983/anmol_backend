import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import clientController from '../controllers/client.controller.js';
import verifyToken from '../middleware/auth.middleware.js';

const router = express.Router();

const { clientAdd, getAllClients, getClientById, updateClient, deleteClient, updateAssignStrategy } = clientController;


router.post('/api/clients',verifyToken, upload.single('profileImage'), clientAdd);
router.get('/api/clients',verifyToken, getAllClients);
router.get('/api/clients/:id',verifyToken, getClientById);
router.put('/api/clients/:id',verifyToken, upload.single('profileImage'), updateAssignStrategy);
router.put('/api/client/assignStrategy/:id',verifyToken, updateAssignStrategy);
router.delete('/api/clients/:id',verifyToken, deleteClient);

export default router;