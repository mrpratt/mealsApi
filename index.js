require('dotenv').config();

const express = require('express');
const routes = require('./routes/routes');
const cors = require('cors');
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

//DB Connection Start
const username = process.env.DB_USER;
const password = process.env.DB_PWD;
const cluster = process.env.DB_CLUSTER;
const dbname = "testDatabase";

mongoose.connect(
    `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("DB Connected successfully!!");
});
//DB Connection End

//Routes
app.use('/api', routes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server Started at ` + port);
});
