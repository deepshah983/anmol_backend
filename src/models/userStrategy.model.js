import { mongoose } from '../db/connection.js'; // Import mongoose from connection.js

const strategySchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    strategy_id: {
        type: String,
        required: false,
        min: 0
    },
    parent_id: {
        type: String,
        required: true,
        min: 0
    },
    assigned_stratagies: {
        type: Array,
        required: true,
        min: 0
    },
}, {
    timestamps: true
});

const UserStrategy = mongoose.model('user_strategy', strategySchema);

export default UserStrategy;
