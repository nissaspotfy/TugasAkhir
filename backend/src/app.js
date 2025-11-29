const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

require('dotenv').config();

const middlewares = require('./middlewares');
const router = require('./routes/index');
const swaggerSetup = require('./config/swagger');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

swaggerSetup(app);


app.get('/', (req, res) => {
    res.json({
        message: 'Assalamualaikum',
    });
});

app.use('/' , router);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;