const User = require('../model/user');
const { USER_TYPES } = require('../constants/authConstant');

const seederAdmin = async () => {
  try {
    const adminsData = [
      {
        email: 'admin1@doctor.finder.com',
        password: 'admin@123',
        userType: USER_TYPES.Admin,
      }
    ];

    const createdAdmins = [];

    for (const admin of adminsData) {
      const exists = await User.findOne({ email: admin.email });
      if (!exists) {
        const newAdmin = new User(admin);
        await newAdmin.save();
        createdAdmins.push(admin.email);
      }
    }

      console.log('✅  Admins seeded successfully ');
   

  } catch (error) {
    console.error('❌ Error creating admins:', error.message);
  }
};

module.exports = seederAdmin;
