import Scrip from "../models/scrips.modal.js"; // Import the Scrip model
import { KiteConnect } from "kiteconnect";
import cron from 'node-cron';

// Initialize Kite Connect instance with your API key
const kc = new KiteConnect({
    api_key: "ik9mapuv5o68w0j6" // Use your actual API key
});

// Handler to fetch instruments from Kite Connect and save them
export const addInstrumentsHandler = async (req, res) => {
    try {
        // Truncate the Scrip collection (delete all documents)
        await Scrip.deleteMany({});
        console.log("Scrip collection truncated (all documents deleted)");

        // Fetch all instruments from the Kite Connect API
        const instruments = await kc.getInstruments();

        // Filter instruments for NSE and NFO exchanges and map them to the Scrip schema format
        const filteredSymbols = instruments
            .filter(instrument => 
                (instrument.exchange === 'NSE' || instrument.exchange === 'NFO') && 
                instrument.tradingsymbol) // Ensure tradingsymbol is not null
            .map(instrument => ({
                terminalSymbol: instrument.tradingsymbol,
                expiry: instrument.expiry,
                strike: instrument.strike,
                instrument_type: instrument.instrument_type || null,
                lot_size: instrument.lot_size || null,
                exchange: instrument.exchange || null,
                last_price: instrument.last_price || 0,
                name: instrument.name || null,
                tick_size: instrument.tick_size || null,
                expiration: instrument.expiry ? new Date(instrument.expiry) : null // Add expiration date if available
            }));

        console.log(`Total NSE and NFO symbols fetched: ${filteredSymbols.length}`);

        if (filteredSymbols.length > 0) {
            // Log excluded count
            const excludedCount = instruments.length - filteredSymbols.length;
            console.log(`Excluded items (not NSE/NFO or missing tradingsymbol): ${excludedCount}`);
        
            // Insert the filtered symbols into the database
            const savedInstruments = await Scrip.insertMany(filteredSymbols, { ordered: false })
                .then(result => {
                    console.log(`Inserted ${result.length} new instruments`);
                    return result;
                })
                .catch(err => {
                    if (err.code === 11000) {
                        // Log duplicates
                        console.log('Duplicate symbols detected, skipping those:', filteredSymbols.filter(symbol => {
                            return Scrip.exists({ terminalSymbol: symbol.terminalSymbol });
                        }));
                    } else {
                        console.error('Error inserting instruments:', err); // Log detailed error
                        throw err;
                    }
                });
        
            // Check the number of items in the database after insertion
            const finalCount = await Scrip.countDocuments();
            console.log(`Final items in the database: ${finalCount}`);
        } else {
            res.status(400).json({
                message: "No valid NSE or NFO symbols found for insertion."
            });
        }
    } catch (error) {
        console.error('Error in addInstrumentsHandler:', error);
        res.status(500).json({
            message: "Error fetching instruments",
            error: error.message
        });
    }
};

// Function to fetch instruments from the database
export const fetchInstrumentsHandler = async (req, res) => {
    try {
        // Get the search query from request query parameters
        const { search } = req.query;

        // Build the search filter
        const filter = search ? {
            $or: [
                {name: {$regex: search, $options: 'i'}},
                {terminalSymbol: {$regex: search, $options: 'i'}}
            ]
        } : {};

        // Fetch instruments from the database, sort them, limit to 50 records, and apply search filter
        const instruments = await Scrip.find(filter)
            .sort({ name: 1 })  // Change 'name' to the field you want to sort by
            .limit(50);

        // Get the total count of instruments for pagination
        const totalCount = await Scrip.countDocuments(filter); // Count documents based on the filter

        // Prepare the response data
        res.status(200).json({
            message: "Instruments fetched successfully",
            data: {
                instruments,
                totalCount,
            }
        });
    } catch (error) {
        console.error('Error fetching instruments from DB:', error);
        res.status(500).json({
            message: "Error fetching instruments from database",
            error: error.message
        });
    }
};

// Schedule the cron job to run at 8:30 AM every day
cron.schedule('30 11 * * *', async () => {
    try {
        console.log("Starting daily instrument update at 11:00 AM...");
        // Simulate a request and response for calling the handler directly
        const req = {}; // You can pass an empty req object or populate it as needed
        const res = {
            status: (statusCode) => ({
                json: (data) => console.log(`Response:`, data)
            })
        };

        // Call the handler
        await addInstrumentsHandler(req, res);

        console.log("Daily instrument update completed.");
    } catch (error) {
        console.error("Error running the cron job:", error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Set the appropriate timezone
});

export default {
    addInstrumentsHandler,
    fetchInstrumentsHandler
};
