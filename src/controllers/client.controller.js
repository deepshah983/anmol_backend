import Client from '../models/client.model.js';
import Strategy from '../models/strategy.model.js';
import UserStrategy from '../models/userStrategy.model.js';
import TreadSetting from '../models/treadSetting.model.js';
import fs from 'fs';
import Joi from 'joi';
import axios from 'axios'; 
import speakeasy from 'speakeasy';


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

const getAllClients = async (req, res) => {
    try {
        const { page_no = 1, limit = 10, search = '', status = '' } = req.query;
        const skip = (Number(page_no) - 1) * Number(limit);

        // Create a search query
        let searchQuery = {};
        if (search) {
            searchQuery.name = { $regex: search, $options: 'i' };
        }
        if (status) {
            searchQuery.status = status;
        }

        // Get total count and fetch clients in parallel
        const [totalClients, clients] = await Promise.all([
            Client.countDocuments(searchQuery),
            Client.find(searchQuery)
                .skip(skip)
                .limit(Number(limit))
        ]);

        if (!clients || clients.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    clients: [],
                    strategies: [],
                    userStrategy: [],
                    treadSettings: []
                },
                totalClients: 0,
                totalAvailableCash: 0,
                totalPages: 0,
                currentPage: Number(page_no),
                limit: Number(limit),
            });
        }

        // Fetch related data in parallel
        const clientIds = clients.map(client => client._id);
        const [strategies, userStrategy, treadSettings] = await Promise.all([
            Strategy.find(),
            UserStrategy.find({ parent_id: { $in: clientIds } }),
            TreadSetting.find({ parent_id: { $in: clientIds } })
        ]);

        // Process clients with improved error handling and retries
        const clientsWithTreadSetting = await Promise.all(
            clients.map(async client => {
                const treadSetting = treadSettings.find(
                    setting => setting.parent_id.toString() === client._id.toString()
                );

                const clientData = {
                    ...client.toObject(),
                    treadSetting: treadSetting || null,
                    userKey: treadSetting?.userKey || null,
                    userId: treadSetting?.userId || null,
                    pin: treadSetting?.pin || null,
                    appKey: treadSetting?.appKey || null,
                    availableCash: '0.00'
                };

                if (treadSetting) {
                    try {
                        const rmsData = await loginAndGetRMSData(treadSetting);
                        if (rmsData?.data?.availablecash) {
                            clientData.availableCash = parseFloat(rmsData.data.availablecash).toFixed(2);
                        }
                    } catch (error) {
                        console.error(`Error fetching RMS data for client ${client._id}:`, error);
                        clientData.rmsError = error.message;
                    }
                }

                return clientData;
            })
        );

        // Calculate totals
        const totalAvailableCash = clientsWithTreadSetting.reduce((total, client) => {
            const availableCashValue = parseFloat(client.availableCash);
            return !isNaN(availableCashValue) ? total + availableCashValue : total;
        }, 0);

        const totalPages = Math.ceil(totalClients / Number(limit));

        res.status(200).json({
            success: true,
            data: {
                clients: clientsWithTreadSetting,
                strategies,
                userStrategy,
                treadSettings
            },
            totalClients,
            totalAvailableCash: parseFloat(totalAvailableCash.toFixed(2)),
            totalPages,
            currentPage: Number(page_no),
            limit: Number(limit),
        });
    } catch (error) {
        console.error('Error in getAllClients:', error);
        res.status(500).json({
            success: false,
            message: "Error retrieving clients and related data",
            error: error.message
        });
    }
};

// Improved helper functions with better error handling
const generateOTP = (secret) => {
    try {
        return speakeasy.totp({ secret, encoding: 'base32' });
    } catch (error) {
        console.error('Error generating OTP:', error);
        throw new Error(`Failed to generate OTP: ${error.message}`);
    }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const loginAndGetRMSData = async (treadSetting, maxRetries = 3) => {
    const { userKey, userId, pin, appKey } = treadSetting;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const otp = generateOTP(userKey);

            // Login request
            const loginResponse = await axios.post(
                'https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByPassword',
                {
                    clientcode: userId,
                    password: pin,
                    totp: otp
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-UserType': 'USER',
                        'X-SourceID': 'WEB',
                        'X-ClientLocalIP': 'CLIENT_LOCAL_IP',
                        'X-ClientPublicIP': 'CLIENT_PUBLIC_IP',
                        'X-MACAddress': 'MAC_ADDRESS',
                        'X-PrivateKey': appKey
                    },
                    timeout: 10000 // 10 second timeout
                }
            );

            if (!loginResponse.data?.data?.jwtToken) {
                throw new Error('Login failed: No JWT token received');
            }

            // RMS data request
            const rmsResponse = await axios.get(
                'https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/getRMS',
                {
                    headers: {
                        'Authorization': `Bearer ${loginResponse.data.data.jwtToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-UserType': 'USER',
                        'X-SourceID': 'WEB',
                        'X-ClientLocalIP': 'CLIENT_LOCAL_IP',
                        'X-ClientPublicIP': 'CLIENT_PUBLIC_IP',
                        'X-MACAddress': 'MAC_ADDRESS',
                        'X-PrivateKey': appKey
                    },
                    timeout: 10000
                }
            );

            return rmsResponse.data;

        } catch (error) {
            console.error(`Attempt ${attempt} failed for tread setting ${treadSetting._id}:`, error.message);
            
            if (attempt === maxRetries) {
                throw new Error(`All ${maxRetries} attempts failed: ${error.message}`);
            }

            // Exponential backoff
            await sleep(1000 * Math.pow(2, attempt - 1));
        }
    }
};

// Dashboard data controller with improved error handling
const getTotalFund = async (req, res) => {
    try {
        const treadSettings = await TreadSetting.find();
        let totalAvailableCash = 0;
        let processedSettings = 0;
        let failedSettings = 0;

        // Process in batches to avoid overwhelming the API
        const batchSize = 5;
        for (let i = 0; i < treadSettings.length; i += batchSize) {
            const batch = treadSettings.slice(i, i + batchSize);
            const results = await Promise.all(
                batch.map(async (treadSetting) => {
                    try {
                        const rmsData = await loginAndGetRMSData(treadSetting);
                        const availableCash = parseFloat(rmsData?.data?.availablecash || 0);
                        return { success: !isNaN(availableCash), cash: availableCash };
                    } catch (error) {
                        console.error(`Failed to get RMS data for setting ${treadSetting._id}:`, error);
                        return { success: false, error: error.message };
                    }
                })
            );

            results.forEach(result => {
                if (result.success) {
                    totalAvailableCash += result.cash;
                    processedSettings++;
                } else {
                    failedSettings++;
                }
            });

            // Add delay between batches
            if (i + batchSize < treadSettings.length) {
                await sleep(1000);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                totalAvailableCash: '₹' + totalAvailableCash.toFixed(2),
                processedSettings,
                failedSettings,
                totalSettings: treadSettings.length
            },
        });

    } catch (error) {
        console.error('Error in getTotalFund:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve total fund data',
            error: error.message,
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
