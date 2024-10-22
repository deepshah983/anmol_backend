import axios from 'axios';
import crypto from 'crypto';
import qs from 'qs';
import moment from 'moment-timezone';
import Token from '../models/zerodhaAuthToken.model.js';

// Zerodha API Configuration
const API_KEY = 'ik9mapuv5o68w0j6';
const API_SECRET = '98klqevhneo78us2won45i8ifgpdvbhg';

class ZerodhaAuthToken {
    generateChecksum(requestToken) {
        const checksumString = API_KEY + requestToken + API_SECRET;
        return crypto.createHash('sha256').update(checksumString).digest('hex');
    }

    async getAccessToken(requestToken, checksum) {
        try {
            const data = qs.stringify({
                'api_key': API_KEY,
                'request_token': requestToken,
                'checksum': checksum
            });

            const config = {
                method: 'post',
                url: 'https://api.kite.trade/session/token?X-Kite-Version=3',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: data
            };

            const response = await axios.request(config);
            return response.data;
        } catch (error) {
            console.error('Error getting access token:', error.response?.data || error.message);
            throw error;
        }
    }

    async saveToken(accessToken, products, order_types) {
        try {
            await Token.findOneAndUpdate(
                { apiKey: API_KEY,   products: products,
                    orderTypes: order_types, },
                {
                    accessToken: accessToken,
                    apiKey: API_KEY,
                    products: products,
                    orderTypes: order_types,
                    lastUpdated: new Date()
                },
                { upsert: true, new: true }
            );
           
            return true;
        } catch (error) {
            console.error('Error saving token:', error);
            throw error;
        }
    }

    async processRequestTokenForChecksum(requestToken) {
        try {
            const checksum = this.generateChecksum(requestToken);
          

            const tokenData = await this.getAccessToken(requestToken, checksum);
          

            if (tokenData.data?.access_token) {
                await this.saveToken(tokenData.data.access_token, tokenData.data.products, tokenData.data.order_types);
                return {
                    success: true,
                    message: 'Token processed and saved successfully',
                    timestamp: moment().tz('Asia/Kolkata').format()
                };
            } else {
                throw new Error('No access token received');
            }
        } catch (error) {
            console.error('Error processing request token:', error);
            throw error;
        }
    }

    async getTokenStatus(req, res) {
        try {
            const token = await Token.findOne({ apiKey: API_KEY });
            if (!token) {
                return res.json({
                    success: false,
                    message: 'No token found'
                });
            }

            return res.json({
                success: true,
                lastUpdated: moment(token.lastUpdated).tz('Asia/Kolkata').format(),
                hasValidToken: !!token.accessToken
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching token status: ' + error.message
            });
        }
    }
}


const processRequestToken = async (req, res) => {
    try {
 
        const { request_token } = req.body;
        
        if (!request_token) {
            return res.status(400).json({
                success: false,
                message: 'Request token is required'
            });
        }

        const auth = new ZerodhaAuthToken();
        const result = await auth.processRequestTokenForChecksum(request_token);
        return res.status(500).json({
            success: true,
            message: 'Successfull get token',
            data: result
        });
        //return res.json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error processing token: ' + error.message
        });
    }
}
export default {
    processRequestToken
    //getTokenStatus: new ZerodhaAuthToken().getTokenStatus.bind(new ZerodhaAuthToken())
};