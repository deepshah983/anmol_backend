import Client from '../models/client.model.js';  // Assuming you have a User model


// Controller function to get counts
const getCounts = async (req, res) => {
    try {
        const clientCount = await Client.countDocuments();
        const activeClientCount = await Client.countDocuments({ status: 1 });
        const inActiveClientCount = await Client.countDocuments({ status: 0 });

        res.status(200).json({
            success: true,
            data: {
                clientCount,
                activeClientCount,
                inActiveClientCount
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve counts',
            error: error.message,
        });
    }
};

export default {
    getCounts,
};