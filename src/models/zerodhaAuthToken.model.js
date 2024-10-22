import { mongoose } from '../db/connection.js'; // Import mongoose from connection.js

const tokenSchema = new mongoose.Schema({
    accessToken: String,
    apiKey: String,
    products: Array,
    orderTypes: Array,
    lastUpdated: { type: Date, default: Date.now }
});

const ZerodhaAuthToken = mongoose.model('Token', tokenSchema);

export default ZerodhaAuthToken;