const express = require('express');
const routes = express.Router();

const RegisterController = require('./app/controllers/RegisterController');
const AuthController = require('./app/controllers/AuthController');
const ProjectController = require('./app/controllers/ProjectController');

const AuthMiddleware = require('./app/middlewares/auth');

routes.post('/register', RegisterController.create);
routes.post('/authenticate', AuthController.create);
routes.post('/forgot_password', AuthController.forgot);
routes.post('/reset_password', AuthController.reset);

routes.use(AuthMiddleware.middleware);

routes.get('/projects', ProjectController.index);
routes.get('/project/:id', ProjectController.show);
routes.post('/projects', ProjectController.create);
routes.delete('/project/:id', ProjectController.delete);
routes.put('/project/:id', ProjectController.update);

routes.get('/dashboard', (req, res) => {
  return res.send({ message: 'Seja bem-vindo ao sistema', user: req.userId });
});

module.exports = routes;