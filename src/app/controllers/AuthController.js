const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authConfig = require('../config/auth.json');
class AuthController {
  async create(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user)
      return res.status(400).json({ error: 'User not found' });
    
    if (!await bcrypt.compare(password, user.password))
      return res.status(400).json({ error: 'Invalid password' });

    user.password = undefined;

    const token = jwt.sign({ id: user._id }, authConfig.secret, {
      expiresIn: '7d'
    });

    return res.send({ user, token });
  }
}

module.exports = new AuthController();