import express from 'express';
import { connection } from './db/connection.js'; // Ensure this path is correct
import 'dotenv/config';
import clientRoute from './routes/client.routes.js'; // Default import, adjust path if necessary
import userRoute from './routes/user.routes.js';
import categoryRoute from './routes/category.routes.js';
import stockRoute from './routes/stock.routes.js';
import authRoute from './routes/auth.routes.js';


const app = express();

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.status(200).json({
        msg: "Ok"
    });
});

if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}

// Use routes
app.use(userRoute);
app.use(clientRoute);
app.use(categoryRoute);
app.use(stockRoute);
app.use(authRoute);

app.listen(port, () => {
    console.log(`Project run on this port ${port}`);
});
