const express = require('express');
const routes = express.Router();

const AuthController = require('./app/controllers/AuthController');

routes.post('/auth', AuthController.create);

module.exports = routes;