import Client from '../models/client.model.js';
import TreadSetting from '../models/treadSetting.model.js';
import axios from 'axios';
import speakeasy from 'speakeasy';
import { promisify } from 'util';

const sleep = promisify(setTimeout);

// Helper function to generate OTP
const generateOTP = (secret) => {
    try {
        return speakeasy.totp({ secret, encoding: 'base32' });
    } catch (error) {
        console.error('Error generating OTP:', error);
        return null;
    }
};

// Function to login and get RMS data with retry mechanism
const loginAndGetRMSData = async (treadSetting, maxRetries = 3) => {
    const { userKey, userId, pin, appKey } = treadSetting;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const otp = generateOTP(userKey);
            if (!otp) {
                throw new Error('Failed to generate OTP');
            }

            const loginResponse = await axios.post(
                'https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByPassword',
                {
                    clientcode: userId,
                    password: pin,
                    totp: otp
                },
                {
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Accept': 'application/json', 
                        'X-UserType': 'USER', 
                        'X-SourceID': 'WEB', 
                        'X-ClientLocalIP': 'CLIENT_LOCAL_IP', 
                        'X-ClientPublicIP': 'CLIENT_PUBLIC_IP', 
                        'X-MACAddress': 'MAC_ADDRESS', 
                        'X-PrivateKey': appKey
                    }
                }
            );

            if (!loginResponse.data.data || !loginResponse.data.data.jwtToken) {
                throw new Error('Login failed: No JWT token received');
            }

            const rmsResponse = await axios.get(
                'https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/getRMS',
                {
                    headers: { 
                        'Authorization': `Bearer ${loginResponse.data.data.jwtToken}`,
                        'Content-Type': 'application/json', 
                        'Accept': 'application/json', 
                        'X-UserType': 'USER', 
                        'X-SourceID': 'WEB', 
                        'X-ClientLocalIP': 'CLIENT_LOCAL_IP', 
                        'X-ClientPublicIP': 'CLIENT_PUBLIC_IP', 
                        'X-MACAddress': 'MAC_ADDRESS', 
                        'X-PrivateKey': appKey
                    }
                }
            );

            return rmsResponse.data;
        } catch (error) {
            console.error(`Attempt ${attempt} failed for tread setting ${treadSetting._id}:`, error.message);
            if (attempt === maxRetries) {
                console.error(`All ${maxRetries} attempts failed for tread setting ${treadSetting._id}`);
                return null;
            }
            // Wait for a short time before retrying
            await sleep(1000 * attempt);
        }
    }
};

// Controller function to get dashboard data
const getCounts = async (req, res) => {
    try {
        const [clientCount, activeClientCount, inActiveClientCount] = await Promise.all([
            Client.countDocuments(),
            Client.countDocuments({ status: 1 }),
            Client.countDocuments({ status: 0 })
        ]);

        res.status(200).json({
            success: true,
            data: {
                clientCount,
                activeClientCount,
                inActiveClientCount
            },
        });
    } catch (error) {
        console.error('Error in getCounts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard data',
            error: error.message,
        });
    }
};

const getTotalFund = async (req, res) => {
    try {
        const treadSettings = await TreadSetting.find();

        let totalAvailableCash = 0;
        let processedSettings = 0;
        let failedSettings = 0;

        const results = await Promise.all(treadSettings.map(async (treadSetting) => {
            const rmsData = await loginAndGetRMSData(treadSetting);
            
            if (rmsData && rmsData.data && rmsData.data.availablecash) {
                const availableCash = parseFloat(rmsData.data.availablecash);
                if (!isNaN(availableCash)) {
                    return { success: true, cash: availableCash };
                }
            }
            return { success: false };
        }));

        results.forEach(result => {
            if (result.success) {
                totalAvailableCash += result.cash;
                processedSettings++;
            } else {
                failedSettings++;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalAvailableCash: '₹'+ totalAvailableCash.toFixed(2),
                processedSettings,
                failedSettings,
                totalSettings: treadSettings.length
            },
        });

    } catch (error) {
        console.error('Error in getTotalFund:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve total fund data',
            error: error.message,
        });
    }
};

export default {
    getCounts,
    getTotalFund
};