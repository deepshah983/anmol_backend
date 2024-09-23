import Client from '../models/client.model.js';
import Strategy from '../models/strategy.model.js';
import fs from 'fs';
import path from 'path';

// Add a new client with profile image upload
const clientAdd = async (req, res) => {
    try {
        // Check if a client with the same email already exists
        const existingClient = await Client.findOne({ email: req.body.email });
        if (existingClient) {
            return res.status(400).json({
                message: "A client with this email already exists"
            });
        }
        
        const client = new Client({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            status: req?.body?.status,
            entryBalance: req?.body?.entryBalance,
            categoryId: req.body.categoryId,
           profileImage: req.file ? req.file.path: '',
           assignedstrategy: ''
        });

        const savedClient = await client.save();
        res.status(201).json({
            message: "Client added successfully",
            data: savedClient
        });
    } catch (error) {
        console.error('Error in clientAdd:', error);
        res.status(400).json({
            message: "Client not added",
            error: error.message
        });
    }
};

// Get all clients
const getAllClients = async (req, res) => {
    try {
        //const clients = await Client.find().populate('categoryId');
        const clients = await Client.find();
        const strategies = await Strategy.find();
        res.status(200).json({
            data: {clients, strategies}
        });
    } catch (error) {
        console.error('Error in getAllClients:', error);
        res.status(400).json({
            message: "Error retrieving clients",
            error: error.message
        });
    }
};

// Get a single client by ID
const getClientById = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id).populate('categoryId');
        if (client) {
            res.status(200).json({
                data: client
            });
        } else {
            res.status(404).json({
                message: "Client not found"
            });
        }
    } catch (error) {
        console.error('Error in getClientById:', error);
        res.status(400).json({
            message: "Error retrieving client",
            error: error.message
        });
    }
};

// Update a client
const updateClient = async (req, res) => {
    try {
        let updateData = req.body;

        if (req.file) {
            updateData.profileImage = req.file.path;
            
            // Delete old image if exists
            const oldClient = await Client.findById(req.params.id);
            if (oldClient.profileImage) {
                fs.unlink(oldClient.profileImage, (err) => {
                    if (err) console.error('Error deleting old image:', err);
                });
            }
        }

        const updatedClient = await Client.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        if (updatedClient) {
            res.status(200).json({
                message: "Client updated successfully",
                data: updatedClient
            });
        } else {
            res.status(404).json({
                message: "Client not found"
            });
        }
    } catch (error) {
        console.error('Error in updateClient:', error);
        res.status(400).json({
            message: "Error updating client",
            error: error.message
        });
    }
};

// Delete a client
const deleteClient = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({
                message: "Client not found"
            });
        }

        // Delete associated image if it exists
        if (client.profileImage) {
            fs.unlink(client.profileImage, (err) => {
                if (err) console.error('Error deleting image:', err);
            });
        }

        await Client.findByIdAndDelete(req.params.id);
        res.status(200).json({
            message: "Client deleted successfully"
        });
    } catch (error) {
        console.error('Error in deleteClient:', error);
        res.status(400).json({
            message: "Error deleting client",
            error: error.message
        });
    }
};

// Update a client
const updateAssignStrategy = async (req, res) => {
    try {
        let updateData = req.body;

        const updatedClient = await Client.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        if (updatedClient) {
            res.status(200).json({
                message: "Assign strategy successfully",
                data: updatedClient
            });
        } else {
            res.status(404).json({
                message: "not found"
            });
        }
    } catch (error) {
        console.error('Error in Assign Strategy:', error);
        res.status(400).json({
            message: "Error Assign Strategy",
            error: error.message
        });
    }
};

export default {
    clientAdd,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient,
    updateAssignStrategy
};