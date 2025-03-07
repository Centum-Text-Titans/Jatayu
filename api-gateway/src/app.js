const express = require('express');
const { connectDB } = require('./configs/db');
const routes = require('./routes');
require('dotenv').config();

const app = express();

app.use(express.json());

// Register all routes
app.use('/api', routes);

// DB Connection
connectDB();

module.exports = app;
