import express from 'express';
import { connection } from './db/connection.js'; // Ensure this path is correct
import 'dotenv/config';
import clientRoute from './routes/client.route.js'; // Default import, adjust path if necessary

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.status(200).json({
        msg: "Ok"
    });
});

app.use(clientRoute);

app.listen(port, () => {
    console.log(`Project run on this port ${port}`);
});
