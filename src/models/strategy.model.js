import { mongoose } from '../db/connection.js'; // Import mongoose from connection.js

const strategySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    maxOpenPos: {
        type: Number,
        required: true,
        min: 0
    },
    maxLongPos: {
        type: Number,
        required: true,
        min: 0
    },
    maxShortPos: {
        type: Number,
        required: true,
        min: 0
    },
    tradesPerDay: {
        type: Number,
        required: true,
        min: 0
    },
    ordersPerDay: {
        type: Number,
        required: true,
        min: 0
    },
    tradesPerScrip: {
        type: Number,
        required: true,
        min: 0
    },
    quantityMultiplier: {
        type: Number,
        required: true,
        min: 1 // Assuming multiplier must be at least 1
    }
}, {
    timestamps: true
});

const Strategy = mongoose.model('strategy', strategySchema);

export default Strategy;
