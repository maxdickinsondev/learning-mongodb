const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../utils/mailer');

const authConfig = require('../../config/auth.json');
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

  async forgot(req, res) {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user)
        return res.status(400).send({ error: 'User not found' });

      const token = crypto.randomBytes(20).toString('hex');

      const now = new Date();
      now.setHours(now.getHours() + 1);

      await User.findByIdAndUpdate(user._id, {
        '$set': {
          passwordResetToken: token,
          passwordResetExpires: now
        }
      });

      mailer.sendMail({
        to: email,
        from: 'maxdickinson@gmail.com',
        template: 'auth/forgot_password',
        context: { token }
      }, (err) => {
        if (err)
          return res.status(400).send({ error: 'Cannot send forgot password email' });
        
        return res.send();
      });

    } catch (err) {
      return res.status(400).send({ error: 'Erro on forgot password, try again' });
    }
  }

  async reset(req, res) {
    const { email, token, password } = req.body;

    try {
      const user = await User.findOne({ email })
        .select('+passwordResetToken passwordResetExpires');

      if (!user)
        return res.status(400).send({ error: 'User not found' });

      if (token !== user.passwordResetToken)
        return res.status(400).send({ error: 'Token invalid' });

      const now = new Date();

      if (now > user.passwordResetExpires)
        return res.status(400).send({ error: 'Token expired, generate a new one' });

      user.password = password;

      await user.save();

      return res.send();

    } catch (err) {
      if (err)
        return res.status(400).send({ error: 'Cannot reset password, try again' });
    }
  }
}

module.exports = new AuthController();