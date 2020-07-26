const express = require('express');
const routes = express.Router();

const RegisterController = require('./app/controllers/RegisterController');
const AuthController = require('./app/controllers/AuthController');

const AuthMiddleware = require('./app/middlewares/auth');

routes.post('/register', RegisterController.create);
routes.post('/authenticate', AuthController.create);

routes.use(AuthMiddleware.middleware);

routes.get('/dashboard', (req, res) => {
  return res.send({ message: 'Seja bem-vindo ao sistema', user: req.userId });
});

module.exports = routes;