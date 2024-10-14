import TradingForm from '../models/trading.model.js';
import  mongoose from 'mongoose';

// Add a new Trading form
const createTradingForm = async (req, res) => {
    try {
    
        const tradingForm = new TradingForm({
            terminalSymbol: req.body.terminalSymbol || '',
            optionType: req.body.optionType || '',
            dynamicExpiry: req.body.dynamicExpiry || '',
            dynamicStrike: req.body.dynamicStrike || '',
            qtyType: req.body.qtyType || '',
            prodType: req.body.prodType || '',
            entryOrder: req.body.entryOrder || '',
            exitOrder: req.body.exitOrder || '',
            exitTime: req.body.exitTime || '',
            strategy: req.body.strategy || '',
        });
        
        // Add fields based on entryOrder
        if (req.body.entryOrder === 'SLL') {
            tradingForm.price = req.body.price || undefined;
            tradingForm.triggerPrice = req.body.triggerPrice || undefined;
        } else if (req.body.entryOrder === 'market') {
            tradingForm.priceBufferType = req.body.priceBufferType || undefined;
            tradingForm.priceBuffer = req.body.priceBuffer || undefined;
            
        }

        const savedTradingForm = await tradingForm.save();
        res.status(201).json({
            message: "Trading data added successfully",
            data: savedTradingForm
        });
    } catch (error) {
        console.error('Error in createTradingForm:', error);
        res.status(400).json({
            message: "Trading data not added",
            error: error.message
        });
    }
};

// Get all Trading data
const getAllTradingForm = async (req, res) => {
    try {
        const { limit = 10, page_no = 1, search = '' } = req.query;
        const skip = (Number(page_no) - 1) * Number(limit);

        // Create a search query
        // Assuming you want to search in a 'name' field. Adjust this as needed.
        const searchQuery = search
            ? { name: { $regex: search, $options: 'i' } }
            : {};

        // Get total count
        const totalCount = await TradingForm.countDocuments(searchQuery);

        // Get trading forms with pagination and search
        const tradingForms = await TradingForm.find(searchQuery)
            .limit(Number(limit))
            .skip(skip);

        res.status(200).json({
            data: tradingForms,
            totalCount,
            currentPage: Number(page_no),
            totalPages: Math.ceil(totalCount / Number(limit))
        });
    } catch (error) {
        console.error('Error in getAllTradingForm:', error);
        res.status(400).json({
            message: "Error retrieving Trading data",
            error: error.message
        });
    }
};

// Update a Trading form
const updateTradingForm = async (req, res) => {
    try {
        const updatedTradingForm = await TradingForm.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedTradingForm) {
            res.status(200).json({
                message: "Trading data updated successfully",
                data: updatedTradingForm
            });
        } else {
            res.status(404).json({
                message: "Trading data not found"
            });
        }
    } catch (error) {
        console.error('Error in updateTradingForm:', error);
        res.status(400).json({
            message: "Trading data not updated",
            error: error.message
        });
    }
};

// Delete a Trading data
const deleteTradingForm = async (req, res) => {
    try {
        const result = await TradingForm.findByIdAndDelete(req.params.id);
        if (result) {
            res.status(200).json({
                message: "Trading data deleted successfully"
            });
        } else {
            res.status(404).json({
                message: "Trading data not found"
            });
        }
    } catch (error) {
        console.error('Error in deleteTradingForm:', error);
        res.status(400).json({
            message: "Error deleting Trading data",
            error: error.message
        });
    }
};

const deleteSelectedTradingForm = async (req, res) => {
    try {
        
        let idsObj = req.params.id;

        // Convert the string into an array of ObjectId
        const idsArray = idsObj.split(',').map(id => new mongoose.Types.ObjectId(id));

        // Delete documents with the matching IDs
        const result = await TradingForm.deleteMany({
        _id: { $in: idsArray }
        });
        
        res.status(200).json({
            message: "All Trading data deleted successfully",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error in deleteTradingFormAll:', error);
        res.status(500).json({
            message: "Error deleting Trading data",
            error: error.message
        });
    }
};

export const exportTradingData = async (req, res) => {
    try {
        const tradingData = await TradingForm.find({});
        res.status(200).json({
            message: "Trading data exported successfully",
            data: tradingData
        });
    } catch (error) {
        console.error('Error in exportTradingData:', error);
        res.status(500).json({
            message: "Error exporting Trading data",
            error: error.message
        });
    }
};

export const importTradingData = async (req, res) => {
    try {
        const importedData = req.body;
        
        if (!Array.isArray(importedData)) {
            return res.status(400).json({
                message: "Invalid data format. Expected an array of trading form data."
            });
        }

        const results = {
            success: [],
            errors: []
        };

        await Promise.all(importedData.map(async (item, index) => {
            try {
                const tradingForm = new TradingForm(item);
                await tradingForm.save();
                results.success.push({ index, id: tradingForm._id });
            } catch (error) {
                results.errors.push({
                    index,
                    message: error.message,
                    details: error.errors ? Object.keys(error.errors).map(key => ({
                        field: key,
                        message: error.errors[key].message
                    })) : []
                });
            }
        }));

        res.status(207).json({
            message: "Trading data import completed",
            totalProcessed: importedData.length,
            successCount: results.success.length,
            errorCount: results.errors.length,
            successfulImports: results.success,
            errors: results.errors
        });
    } catch (error) {
        console.error('Error in importTradingData:', error);
        res.status(500).json({
            message: "Error processing Trading data import",
            error: error.message
        });
    }
};

export default {
    createTradingForm,
    getAllTradingForm,
    updateTradingForm,
    deleteTradingForm,
    deleteSelectedTradingForm,
    exportTradingData,
    importTradingData
};
