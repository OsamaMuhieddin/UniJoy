const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not Authenticated');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  //decode
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'somesecret'); //decode and verify
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    //undeifined
    const error = new Error('Not Authenticated');
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  req.userRole = decodedToken.role;
  next();
};
