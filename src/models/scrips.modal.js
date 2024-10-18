// models/scrips.modal.js
import mongoose from 'mongoose';

const scripSchema = new mongoose.Schema({
    terminalSymbol: { type: String, required: true, unique: true },
    expiry: { type: String, required: false },
    strike: { type: Number, required: false }, // Ensure this is defined as Number
    instrument_type: { type: String, required: true },
    lot_size: { type: Number, required: true },
    exchange: { type: String, required: true },
    last_price: { type: Number, required: true },
    name: { type: String, required: true },
    tick_size: { type: Number, required: true },
}, { timestamps: true });

const Scrip = mongoose.model('Scrip', scripSchema);
export default Scrip;