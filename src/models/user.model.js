import { mongoose } from '../db/connection.js'; // Import mongoose from connection.js
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 15
    },
    last_name: {
        type: String,
        required: true,
        minlength: 2,
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
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: 'admin',
        required: true
    },
    refreshToken: { type: String }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);