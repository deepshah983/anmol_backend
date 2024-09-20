import Strategy from '../models/strategy.model.js';

// Add a new strategy
const strategyAdd = async (req, res) => {
    try {
        const strategy = new Strategy({
            name: req.body.name || '',
            maxOpenPos: req.body.maxOpenPos || 0,
            maxLongPos: req.body.maxLongPos || 0,
            maxShortPos: req.body.maxShortPos || 0,
            tradesPerDay: req.body.tradesPerDay || 0,
            ordersPerDay: req.body.ordersPerDay || 0,
            tradesPerScrip: req.body.tradesPerScrip || 0,
            quantityMultiplier: req.body.quantityMultiplier || 1
        });

        const savedStrategy = await strategy.save();
        res.status(201).json({
            message: "Strategy added successfully",
            data: savedStrategy
        });
    } catch (error) {
        console.error('Error in strategyAdd:', error);
        res.status(400).json({
            message: "Strategy not added",
            error: error.message
        });
    }
};

// Get all strategies
const getAllStrategies = async (req, res) => {
    try {
        const strategies = await Strategy.find();
        res.status(200).json({
            data: strategies
        });
    } catch (error) {
        console.error('Error in getAllStrategies:', error);
        res.status(400).json({
            message: "Error retrieving strategies",
            error: error.message
        });
    }
};

// Get a single strategy by ID
const getStrategyById = async (req, res) => {
    try {
        const strategy = await Strategy.findById(req.params.id);
        if (strategy) {
            res.status(200).json({
                data: strategy
            });
        } else {
            res.status(404).json({
                message: "Strategy not found"
            });
        }
    } catch (error) {
        console.error('Error in getStrategyById:', error);
        res.status(400).json({
            message: "Error retrieving strategy",
            error: error.message
        });
    }
};

// Update a strategy
const updateStrategy = async (req, res) => {
    try {
        const updatedStrategy = await Strategy.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedStrategy) {
            res.status(200).json({
                message: "Strategy updated successfully",
                data: updatedStrategy
            });
        } else {
            res.status(404).json({
                message: "Strategy not found"
            });
        }
    } catch (error) {
        console.error('Error in updateStrategy:', error);
        res.status(400).json({
            message: "Strategy not updated",
            error: error.message
        });
    }
};

// Delete a strategy
const deleteStrategy = async (req, res) => {
    try {
        const result = await Strategy.findByIdAndDelete(req.params.id);
        if (result) {
            res.status(200).json({
                message: "Strategy deleted successfully"
            });
        } else {
            res.status(404).json({
                message: "Strategy not found"
            });
        }
    } catch (error) {
        console.error('Error in deleteStrategy:', error);
        res.status(400).json({
            message: "Error deleting strategy",
            error: error.message
        });
    }
};

export default {
    strategyAdd,
    getAllStrategies,
    getStrategyById,
    updateStrategy,
    deleteStrategy
};
