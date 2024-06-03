function isAuthenticated(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      res.status(401).send('You need to log in first');
    }
  }
  
  function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
      next();
    } else {
      res.status(403).send('Access forbidden');
    }
  }
  
  module.exports = { isAuthenticated, isAdmin };
  