import express from 'express';
import { connection } from './db/connection.js';
import 'dotenv/config';
import dashboardRoute from './routes/dashboard.routes.js';
import clientRoute from './routes/client.routes.js';
import userRoute from './routes/user.routes.js';
import categoryRoute from './routes/category.routes.js';
import strategyRoute from './routes/strategy.routes.js';
import cors from 'cors';


const app = express();

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());


const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Ok"
    });
});

if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}

// Use routes
app.use(dashboardRoute);
app.use(userRoute);
app.use(clientRoute);
app.use(categoryRoute);
app.use(strategyRoute);
app.use('/uploads', express.static('uploads'));
// Apply CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:7000'); // replace with your frontend origin
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  

  // Handle the preflight request
app.options('*', cors()); // Preflight OPTIONS request
  
  
app.listen(port, () => {
    console.log(`Project run on this port ${port}`);
});
