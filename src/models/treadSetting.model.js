import { mongoose } from '../db/connection.js'; // Import mongoose from connection.js

const clientSchema = new mongoose.Schema({
    parent_id: {
        type: String,
        required: true,
        minlength: 1
    },
    userId: {
        type: String,
        required: true,
        minlength: 1
    },
    pin: {
        type: String,
        required: true,
        minlength: 1
    },
    userKey: {
        type: String,
        required: true,
        minlength: 1
    },
    appKey: {
        type: String,
        required: true,
        minlength: 1
    },
   
}, {
    timestamps: true
});

const TreadSetting = mongoose.model('tread_setting', clientSchema);

export default TreadSetting;
