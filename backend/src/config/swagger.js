const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const basicauth = require('express-basic-auth');
require('dotenv').config();

const options = {
    swaggerDefinition: {
        openapi: '3.1.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API Documentation for TestBE',
        },
        servers: [
            {
                url: process.env.BASE_URL,
                description: 'Development server',
            },
        ],
    },
    apis: ['./src/routes/swagger/**/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

const setup = (app) => {
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
};

module.exports = setup;
