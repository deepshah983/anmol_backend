import { mongoose } from '../db/connection.js'; // Import mongoose from connection.js

const strategySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    entryTime: {
        type: String,
        required: true,
        min: 0
    },
    exitTime: {
        type: String,
        required: true,
        min: 0
    },
    squareOffTime: {
        type: String,
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
