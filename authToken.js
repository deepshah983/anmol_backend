import crypto from 'crypto';

const apiKey = 'ik9mapuv5o68w0j6';
const requestToken = 'QBiGWuw0FgWIqTXmWNUVhX0QVG5hFoNZ';
const apiSecret = '98klqevhneo78us2won45i8ifgpdvbhg';

const checksumString = apiKey + requestToken + apiSecret;
const checksum = crypto.createHash('sha256').update(checksumString).digest('hex');

console.log('Checksum:', checksum);