import Strategy from '../models/strategy.model.js';

// Add a new strategy
const strategyAdd = (req, res) => {
    const strategy = new Strategy({
        name: req.body.name || '', // Default to an empty string if name is not provided
        maxOpenPos: req.body.maxOpenPos || 0,
        maxLongPos: req.body.maxLongPos || 0,
        maxShortPos: req.body.maxShortPos || 0,
        tradesPerDay: req.body.tradesPerDay || 0,
        ordersPerDay: req.body.ordersPerDay || 0,
        tradesPerScrip: req.body.tradesPerScrip || 0,
        quantityMultiplier: req.body.quantityMultiplier || 1
    });

    strategy.save()
    .then(strategy => {
        res.status(200).json({
            message: "Strategy added successfully",
            data: strategy
        });
    })
    .catch(error => {
        res.status(400).json({
            message: "Strategy not added",
            error
        });
    });
};

// Get all strategies
const getAllStrategies = (req, res) => {
    Strategy.find()
    .then(strategies => {
        res.status(200).json({
            data: strategies
        });
    })
    .catch(error => {
        res.status(400).json({
            message: "Error retrieving strategies",
            error
        });
    });
};

// Get a single strategy by ID
const getStrategyById = (req, res) => {
    Strategy.findById(req.params.id)
    .then(strategy => {
        if (strategy) {
            res.status(200).json({
                data: strategy
            });
        } else {
            res.status(404).json({
                message: "Strategy not found"
            });
        }
    })
    .catch(error => {
        res.status(400).json({
            message: "Error retrieving strategy",
            error
        });
    });
};

// Update a strategy
const updateStrategy = (req, res) => {
    Strategy.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(strategy => {
        res.status(200).json({
            message: "Strategy updated successfully",
            data: strategy
        });
    })
    .catch(error => {
        res.status(400).json({
            message: "Error updating strategy",
            error
        });
    });
};

// Delete a strategy
const deleteStrategy = (req, res) => {
    Strategy.findByIdAndDelete(req.params.id)
    .then(result => {
        if (result) {
            res.status(200).json({
                message: "Strategy deleted successfully"
            });
        } else {
            res.status(404).json({
                message: "Strategy not found"
            });
        }
    })
    .catch(error => {
        res.status(400).json({
            message: "Error deleting strategy",
            error
        });
    });
};

export default { strategyAdd, getAllStrategies, getStrategyById, updateStrategy, deleteStrategy };
