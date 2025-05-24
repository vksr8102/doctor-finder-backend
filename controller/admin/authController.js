/**
 * authController.js
 *  @description :: exports authentication methods
 */


const authConstant = require('../../constants/authConstant');
const authService = require('../../services/auth');



  
  /**
 * @description : login with username and password
 * @param {Object} req : request for login 
 * @param {Object} res : response for login
 * @return {Object} : response for login {status, message, data}
 */
const login = async (req, res) => {
    try {
      let {
        username, password
      } = req.body;
     
      if (!username) {
        return res.badRequest({ message: 'Insufficient request parameters! username  is required.' });
      }
      if (!password) {
        return res.badRequest({ message: 'Insufficient request parameters! password is required.' });
      }

      let roleAccess = false;
      let result = await authService.loginUser(username, password, authConstant.PLATFORM.ADMIN, roleAccess);
      if (result.flag) {
        return res.badRequest({ message: result.data });
      }

   

      return res.success({
        data: result.data,
        message: 'Login Successful'
      });
    } catch (error) {
      return res.internalServerError({ data: error.message });
    }
  };


 



  module.exports = {
    login
  };
