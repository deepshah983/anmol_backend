import { mongoose } from '../db/connection.js'; // Import mongoose from connection.js

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 15
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 15,
        match: [/^\d+$/, 'Phone number must contain only digits']
    },
    status: {
        type: Number,
        required: true,
        enum: [0, 1],  // 0 for Inactive, 1 for Active
        default: 1     // Default to Active
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false
    },
    profileImage: {
        type: String,  // You can also use Buffer if you want to store the image binary data directly
        default: ''    // Default to an empty string if no image is provided
    }
}, {
    timestamps: true
});

const Client = mongoose.model('Client', clientSchema);

export default Client;
