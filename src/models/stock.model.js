import { mongoose } from '../db/connection.js'; // Import mongoose from connection.js

const stockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

const Stock = mongoose.model('Stock', stockSchema);

export default Stock;
