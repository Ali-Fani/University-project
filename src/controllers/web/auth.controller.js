const login = async (req, res) => {
  if (req.method === 'POST') {
    return;
  }
  if (req.method === 'GET') {
    return res.render('login');
  }
};
const register = async (req, res) => {
  if (req.method === 'POST') {
    return;
  }
  if (req.method === 'GET') {
    return res.render('register');
  }
};

module.exports = {
  login,
  register,
};
