

const User = require('../../../model/user');
const dbService = require("../../../utils/dbServices");


  /**
   * @description : get information of logged-in User.
   * @param {Object} req : authentication token is required
   * @param {Object} res : Logged-in user information
   * @return {Object} : Logged-in user information {status, message, data}
   */
 const getLoggedInUserInfo = async (req, res) => {
  try {
    const query = {
      _id: req.user.id,
      isDeleted: false
    };
    query.isActive = true;
    let foundUser = await dbService.findOne(User, query);
    if (!foundUser) {
      return res.recordNotFound();
    }
    return res.success({ data: foundUser });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


  module.exports = {
    getLoggedInUserInfo,
  }