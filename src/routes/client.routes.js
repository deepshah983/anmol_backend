import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import clientController from '../controllers/client.controller.js';
import verifyToken from '../middleware/auth.middleware.js';
import multer from 'multer';

// Set up multer for handling form-data (without file uploads)
const uploadNone = multer();
const router = express.Router();

const { clientAdd, getAllClients, getClientById, updateClient, deleteClient, updateAssignStrategy, addTreadSetting } = clientController;


router.post('/api/clients',verifyToken, upload.single('profileImage'), clientAdd);
router.get('/api/clients',verifyToken, getAllClients);
router.get('/api/clients/:id',verifyToken, getClientById);
router.put('/api/clients/:id',verifyToken, upload.single('profileImage'), updateClient);
router.post('/api/clients/tread-setting/:id',verifyToken, uploadNone.none(), addTreadSetting);
router.post('/api/client/assignStrategy',verifyToken, uploadNone.none(), updateAssignStrategy);
router.delete('/api/clients/:id',verifyToken, deleteClient);

export default router;