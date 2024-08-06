import Stock from '../models/stock.model.js';

// Add a new stock
const stockAdd = (req, res) => {
    const stock = new Stock({
        name: req.body.name,
        price: req.body.price
    });

    stock.save()
    .then(stock => {
        res.status(200).json({
            msg: "Stock added successfully",
            data: stock
        });
    })
    .catch(error => {
        res.status(400).json({
            msg: "Stock not added",
            error
        });
    });
};

// Get all stocks
const getAllStocks = (req, res) => {
    Stock.find()
    .then(stocks => {
        res.status(200).json({
            data: stocks
        });
    })
    .catch(error => {
        res.status(400).json({
            msg: "Error retrieving stocks",
            error
        });
    });
};

// Get a single stock by ID
const getStockById = (req, res) => {
    Stock.findById(req.params.id)
    .then(stock => {
        if (stock) {
            res.status(200).json({
                data: stock
            });
        } else {
            res.status(404).json({
                msg: "Stock not found"
            });
        }
    })
    .catch(error => {
        res.status(400).json({
            msg: "Error retrieving stock",
            error
        });
    });
};

// Update a stock
const updateStock = (req, res) => {
    Stock.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(stock => {
        res.status(200).json({
            msg: "Stock updated successfully",
            data: stock
        });
    })
    .catch(error => {
        res.status(400).json({
            msg: "Error updating stock",
            error
        });
    });
};

// Delete a stock
const deleteStock = (req, res) => {
    Stock.findByIdAndDelete(req.params.id)
    .then(result => {
        if (result) {
            res.status(200).json({
                msg: "Stock deleted successfully"
            });
        } else {
            res.status(404).json({
                msg: "Stock not found"
            });
        }
    })
    .catch(error => {
        res.status(400).json({
            msg: "Error deleting stock",
            error
        });
    });
};

export default { stockAdd, getAllStocks, getStockById, updateStock, deleteStock };
