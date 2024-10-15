import Scrip from "../models/scrips.modal.js"; // Import the Scrip model
import { KiteConnect } from "kiteconnect";

// Initialize Kite Connect instance with your API key
const kc = new KiteConnect({
    api_key: "ik9mapuv5o68w0j6" // Use your actual API key
});

// Store the refresh token globally or in a database
let refreshToken = "j7HvAJHN4LEYTTa3met2ZetiJJbj3sfq"; // Initial refresh token

// Function to generate a new session and refresh the access token
const refreshAccessToken = async () => {
    try {
        const response = await kc.generateSession(refreshToken, "ob8xt07ell822e0qntnugxc1jreyumdz");
        // Update access token and refresh token
        kc.setAccessToken(response.access_token);
        refreshToken = response.refresh_token; // Update the global refresh token
        console.log("Access token refreshed successfully");
    } catch (error) {
        console.error("Error refreshing access token:", error);
        throw new Error("Token refresh failed");
    }
};

// Handler to fetch instruments from Kite Connect and save them
export const addInstrumentsHandler = async (req, res) => {
    try {
        // Ensure access token is valid, refresh if necessary
        await refreshAccessToken();

        // Fetch all instruments
        const instruments = await kc.getInstruments();

        // Filter instruments for NSE exchange and map them to the Scrip schema format
        const nseSymbols = instruments
            .filter(instrument => instrument.exchange === 'NSE' && instrument.tradingsymbol) // Ensure tradingsymbol is not null
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
                expiration: new Date(instrument.expiry) // Add expiration date
            }));

        console.log(`Total NSE symbols fetched: ${nseSymbols.length}`);

        // Check for duplicates in the fetched symbols
        const uniqueSymbols = Array.from(new Set(nseSymbols.map(symbol => symbol.terminalSymbol)));
        console.log(`Unique NSE symbols (after removing duplicates): ${uniqueSymbols.length}`);

        // Check the number of existing items in the database before inserting new ones
        const existingCount = await Scrip.countDocuments();
        console.log(`Existing items in the database: ${existingCount}`);

        if (nseSymbols.length > 0) {
        

            // Use insertMany with ordered: false to ignore duplicate key errors
            const savedInstruments = await Scrip.insertMany(nseSymbols, { ordered: false })
                .then(result => {
                    console.log(`Inserted ${result.length} new instruments`);
                    return result;
                })
                .catch(err => {
                    if (err.code === 11000) {
                        console.log('Duplicate symbols detected, skipping those.');
                    } else {
                        throw err;
                    }
                });

            // Check the number of items in the database after insertion
            const finalCount = await Scrip.countDocuments();
            console.log(`Final items in the database: ${finalCount}`);

            res.status(201).json({
                message: "Instruments fetched and saved successfully",
                data: savedInstruments,
                totalInDB: finalCount
            });
        } else {
            res.status(400).json({
                message: "No valid NSE symbols found for insertion."
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
        // Fetch instruments from the database and sort them (e.g., by 'name' in ascending order)
        const instruments = await Scrip.find({}).sort({ name: 1 }); // Change 'name' to the field you want to sort by

        // Get the total count of instruments for pagination
        const totalCount = await Scrip.countDocuments();

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

export default {
    addInstrumentsHandler,
    fetchInstrumentsHandler
};
