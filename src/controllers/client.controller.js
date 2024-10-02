import Client from '../models/client.model.js';
import Strategy from '../models/strategy.model.js';
import UserStrategy from '../models/userStrategy.model.js';
import TreadSetting from '../models/treadSetting.model.js';
import fs from 'fs';
import Joi from 'joi';

// Validation schemas
const clientSchema = Joi.object({
    name: Joi.string().min(4).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\d+$/).min(10).max(15).required(),
    entryBalance: Joi.number().required(),
    status: Joi.number().valid(0, 1).default(1),
    categoryId: Joi.string().optional(),
});

const strategySchema = Joi.object({
    tags: Joi.array().items(
        Joi.object({
            strategy_id: Joi.string().required(),
            label: Joi.string().required(),
            value: Joi.string().required(),
            parent_id: Joi.string().required()
        })
    ).required(),
    parent_id: Joi.string().required(),
});

const treadSettingSchema = Joi.object({
    userId: Joi.string().required(),
    pin: Joi.string().required(),
    userKey: Joi.string().required(),
    appKey: Joi.string().required(),
    parent_id: Joi.string().required(),
});

// Add a new client with profile image upload
const clientAdd = async (req, res) => {
    try {
        // Validate input data
        const { error } = clientSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

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
            categoryId: req.body.categoryId
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

// Get all clients with pagination
const getAllClients = async (req, res) => {
    try {
        const { page_no = 1, limit = 10, search = '' } = req.query;
        const skip = (Number(page_no) - 1) * Number(limit);

        // Create a search query
        const searchQuery = search
            ? { name: { $regex: search, $options: 'i' } }
            : {};

        // Get total count of clients matching the search criteria
        const totalClients = await Client.countDocuments(searchQuery);

        // Fetch clients with pagination and search
        const clients = await Client.find(searchQuery)
            .skip(skip)
            .limit(Number(limit));

        // Get client IDs for fetching related data
        const clientIds = clients.map(client => client._id);

        // Fetch related data
        const strategies = await Strategy.find();
        const userStrategy = await UserStrategy.find({ parent_id: { $in: clientIds } });
        const treadSetting = await TreadSetting.find({ parent_id: { $in: clientIds } });

        // Calculate total pages
        const totalPages = Math.ceil(totalClients / Number(limit));

        res.status(200).json({
            data: {
                clients,
                strategies,
                userStrategy,
                treadSetting
            },
                totalClients,
                totalPages,
                currentPage: Number(page_no),
                limit: Number(limit)
            
        });
    } catch (error) {
        console.error('Error in getAllClients:', error);
        res.status(400).json({
            message: "Error retrieving clients and related data",
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
        const { id, ...bodyWithoutId } = req.body;

        // Validate the rest of the input data (excluding "id")
        const { error } = clientSchema.validate(bodyWithoutId);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const updatedClient = await Client.findByIdAndUpdate(req.params.id, bodyWithoutId, { new: true });
        
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

// Update a client's strategy assignment
const updateAssignStrategy = async (req, res) => {
    try {
        const { error } = strategySchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { tags, parent_id } = req.body;

        let strategy = await UserStrategy.findOne({ parent_id });

        if (!strategy) {
            strategy = new UserStrategy({
                parent_id,
                label: 'Main Strategy',
                strategy_id: parent_id,
                assigned_stratagies: []
            });
        }

        strategy.assigned_stratagies = tags.map(tag => ({
            strategy_id: tag.strategy_id,
            label: tag.label,
            value: tag.value,
            parent_id: tag.parent_id
        }));

        await strategy.save();

        res.status(200).json({
            message: "Assign strategy updated successfully",
            data: strategy
        });
    } catch (error) {
        console.error('Error in Assign Strategy:', error);
        res.status(400).json({
            message: "Error Assign Strategy",
            error: error.message
        });
    }
};

// Add or update a tread setting
const addTreadSetting = async (req, res) => {
    try {
        const { error } = treadSettingSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { id } = req.params;
        const updateData = req.body;

        let treadSetting = await TreadSetting.findById(id);

        if (!treadSetting) {
            treadSetting = new TreadSetting({ _id: id, ...updateData });
            await treadSetting.save();
            res.status(201).json({
                message: "Tread Setting added successfully",
                data: treadSetting
            });
        } else {
            treadSetting = await TreadSetting.findByIdAndUpdate(id, updateData, { new: true });
            res.status(200).json({
                message: "Tread Setting updated successfully",
                data: treadSetting
            });
        }
    } catch (error) {
        console.error('Error in Tread Setting operation:', error);
        res.status(400).json({
            message: "Error in Tread Setting operation",
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
    updateAssignStrategy,
    addTreadSetting
};
