import Strategy from '../models/strategy.model.js';
import UserStrategy from '../models/userStrategy.model.js';
import  mongoose from 'mongoose';
// Add a new strategy
const strategyAdd = async (req, res) => {
    try {
    
    const strategy = new Strategy({
        name: req.body.name || '', // Default to an empty string if name is not provided
        entryTime: req.body.entryTime || 0,
        exitTime: req.body.exitTime || 0,
        squareOffTime: req.body.squareOffTime || 0,
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
        // Find and delete the strategy by ID from the Strategy collection
        const result = await Strategy.findByIdAndDelete(req.params.id);

        if (result) {
            // Remove the deleted strategy from assigned_stratagies in UserStrategy collection
            await UserStrategy.updateMany(
                { "assigned_stratagies.strategy_id": req.params.id },
                { $pull: { assigned_stratagies: { strategy_id: req.params.id } } }
            );

            // After removing the strategy, delete UserStrategy documents where assigned_stratagies array is empty
            await UserStrategy.deleteMany({
                assigned_stratagies: { $size: 0 }
            });

            res.status(200).json({
                message: "Strategy deleted successfully and removed from assigned_stratagies"
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



const deleteSelectedStrategy = async (req, res) => {
    try {
        // Convert the comma-separated string of ids into an array
        // Convert the comma-separated string of ids into an array of ObjectIds
        let idsObj = req.params.id;
        const idsArray = idsObj.split(',').map(id => new mongoose.Types.ObjectId(id));
        const idsArrayAsStrings = idsArray.map(id => id.toString());
         
        //Delete the strategies from the Strategy collection
        const result = await Strategy.deleteMany({
            _id: { $in: idsArray }
        });

        if (result) {
               // Log the matched documents before the update
        const matchedDocuments = await UserStrategy.find({
            "assigned_stratagies.strategy_id": { $in: idsArrayAsStrings }
        });

        // Remove the corresponding strategies from assigned_stratagies in UserStrategy collection
        const updateResult = await UserStrategy.updateMany(
            { "assigned_stratagies.strategy_id": { $in: idsArrayAsStrings } },
            { $pull: { assigned_stratagies: { strategy_id: { $in: idsArrayAsStrings } } } },
            { multi: true }
        );

        // After pulling strategies, delete UserStrategy documents where assigned_stratagies array is empty
        const deleteResult = await UserStrategy.deleteMany({
            assigned_stratagies: { $size: 0 }
        });

        res.status(200).json({
            message: "Selected Strategies deleted successfully",
            updateResult,
            deleteResult
        });

    } else {
        res.status(404).json({
            message: "Strategy not found"
        });
    }
    } catch (error) {
        console.error('Error in deleteSelectedStrategy:', error);
        res.status(500).json({
            message: "Error deleting Selected Strategy",
            error: error.message
        });
    }
};



export default {
    strategyAdd,
    getAllStrategies,
    getStrategyById,
    updateStrategy,
    deleteStrategy,
    deleteSelectedStrategy
};
