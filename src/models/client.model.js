import { mongoose } from '../db/connection.js'; // Import mongoose from connection.js

let clientSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        min: 4,
        max: 15
    },
    last_name: {
        type: String,
        required: true,
        min: 4,
        max: 15
    },
    email: {
        type: String,
        required: true,
        min: 4,
        max: 15
    },
    phone: {
        type: String,
        required: true,
        min: 10,
        max: 15
    }
}, {
    timestamps: true
});

const Client = mongoose.model('Client', clientSchema);

export default Client;
