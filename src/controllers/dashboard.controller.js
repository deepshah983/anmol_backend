import Client from '../models/client.model.js';
import TreadSetting from '../models/treadSetting.model.js';
import axios from 'axios';
import speakeasy from 'speakeasy';

// Helper function to generate OTP
const generateOTP = (secret) => speakeasy.totp({ secret, encoding: 'base32' });

// Function to login and get RMS data
const loginAndGetToken = async (treadSetting) => {
    const { userKey, userId, pin, appKey } = treadSetting;

    const data = JSON.stringify({
        clientcode: userId,
        password: pin,
        totp: generateOTP(userKey)
    });

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByPassword',
        headers: { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json', 
            'X-UserType': 'USER', 
            'X-SourceID': 'WEB', 
            'X-ClientLocalIP': 'CLIENT_LOCAL_IP', 
            'X-ClientPublicIP': 'CLIENT_PUBLIC_IP', 
            'X-MACAddress': 'MAC_ADDRESS', 
            'X-PrivateKey': appKey
        },
        data
    };

    try {
        const { data: responseData } = await axios.request(config);
        
        if (responseData.data && responseData.data.jwtToken) {
            return await getRMSData(responseData.data.jwtToken, appKey);
        } else {
            console.error('Login failed: No JWT token received');
            return null;
        }
    } catch (error) {
        console.error('Error during login:', error.response ? error.response.data : error.message);
        return null;
    }
};

// Function to get RMS data
const getRMSData = async (jwtToken, appKey) => {
    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/getRMS',
        headers: { 
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json', 
            'Accept': 'application/json', 
            'X-UserType': 'USER', 
            'X-SourceID': 'WEB', 
            'X-ClientLocalIP': 'CLIENT_LOCAL_IP', 
            'X-ClientPublicIP': 'CLIENT_PUBLIC_IP', 
            'X-MACAddress': 'MAC_ADDRESS', 
            'X-PrivateKey': appKey
        }
    };

    try {
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        console.error('Error retrieving RMS data:', error.response ? error.response.data : error.message);
        return null;
    }
};

// Controller function to get dashboard data
const getCounts = async (req, res) => {
    try {
        // Get client counts
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
            message: 'Failed to retrieve dashboard data',
            error: error.message,
        });
    }
};

const getTotalFund = async (req, res) => {
  try {
     // Get all tread settings
     const treadSettings = await TreadSetting.find();

     let totalAvailableCash = 0;

     // Process each tread setting
     for (const treadSetting of treadSettings) {
         const rmsData = await loginAndGetToken(treadSetting);
         if (rmsData && rmsData.data) {
             // Assuming 'availablecash' is the correct field in RMS data
             totalAvailableCash += parseFloat(rmsData.data.availablecash || 0);
         }
     }

     res.status(200).json({
        success: true,
        data: {
            totalAvailableCash
        },
    });

  } catch (error) {
    res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard data',
        error: error.message,
    });
  }
}

export default {
    getCounts,
    getTotalFund
};