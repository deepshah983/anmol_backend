import TradingForm from '../models/trading.model.js';

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
            tradingForm.target = req.body.target || undefined;
            tradingForm.stopLoss = req.body.stopLoss || undefined;
        } else if (req.body.entryOrder === 'market') {
            tradingForm.priceBufferType = req.body.priceBufferType || undefined;
            if (req.body.priceBufferType === 'fixed') {
                tradingForm.priceBuffer = req.body.priceBuffer || undefined;
            }
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
        const tradingForm = await TradingForm.find();
        res.status(200).json({
            data: tradingForm
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

const deleteTradingFormAll = async (req, res) => {
    try {
        //console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh", req.body);
        
        let idsObj = req.params.id
        // Delete all documents
        const result = await TradingForm.deleteMany({});
        
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

export default {
    createTradingForm,
    getAllTradingForm,
    updateTradingForm,
    deleteTradingForm,
    deleteTradingFormAll
};
