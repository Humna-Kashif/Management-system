const aibers = require('../package.json');
const common = require('./DbOperation');

const aibers_info = async (req, res) => {
  try {
    res.json({
      "name": aibers.name,
      "version": aibers.version
    });
  } catch (err) {
    // console.error(err.message);
    common.customResponse(req, res, err);
  }
}

module.exports = {
  aibers_info,
}