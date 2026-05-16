const { User } = require("../models");
const Response = require("../helpers/response");
const bcrypt = require("bcrypt");
const Type = require("../utils/userTypes");
const { DEFAULT_PASSWORD } = process.env;
const { validationResult } = require("express-validator");
const saltRounds = 10;

const usersController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: [
          "id",
          "first_name",
          "last_name",
          "mobile_number",
          "email",
          "user_type",
          "is_active",
          "created_by",
          "modified_by",
          "created_at",
          "modified_at",
        ],
      });
      if (!users) {
        return Response.responseStatus(res, 404, "User not exists");
      }
      return Response.responseStatus(res, 200, "List of all users", users);
    } catch (error) {
      console.log(error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message.message,
      });
    }
  },
  getUserById: async (req, res) => {
    try {
      const user_id = req.params.id;
      const user = await User.findByPk(user_id, {
        attributes: [
          "id",
          "first_name",
          "last_name",
          "mobile_number",
          "email",
          "user_type",
          "is_active",
          "created_by",
          "modified_by",
          "created_at",
          "modified_at",
        ],
      });
      if (!user) {
        return Response.responseStatus(res, 404, "User not exists");
      }
      return Response.responseStatus(
        res,
        200,
        `Details of User(${user_id})`,
        user
      );
    } catch (error) {
      console.log(error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error,
      });
    }
  },
  createUser: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return Response.responseStatus(res, 400, "Validation Failed", errors);
      }
      const createdBy = req.userData.id;
      const {
        firstName,
        lastName,
        email,
        mobileNumber,
        password = DEFAULT_PASSWORD,
        userType = Type.User,
      } = req.body;
      const user = {
        first_name: firstName,
        last_name: lastName,
        mobile_number: mobileNumber,
        email,
        password,
        user_type: userType,
        created_by: createdBy,
      };

      const result_email = await User.findOne({ where: { email } });
      if (result_email) {
        return Response.responseStatus(res, 409, "Email already exists");
      }
      // Hash the password before storing in the database
      const hashedPassword = bcrypt.hashSync(user.password, saltRounds);
      user.password = hashedPassword;
      // console.log(user);
      const createdUser = await User.create(user);
      // console.log(createdUser);
      if (!createdUser) {
        return Response.responseStatus(res, 400, "User Creation Failed");
      }
      const newUser = await User.findByPk(createdUser.id, {
        attributes: [
          "id",
          "first_name",
          "last_name",
          "mobile_number",
          "email",
          "user_type",
          "is_active",
          "created_by",
          "modified_by",
          "created_at",
          "modified_at",
        ],
      });
      return Response.responseStatus(
        res,
        201,
        "User Created Successfully",
        newUser
      );
    } catch (error) {
      console.log(error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
  updateUserById: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return Response.responseStatus(res, 400, "Validation Failed", errors);
      }
      const user_id = req.params.id;
      const modifiedBy = req.userData.id;
      // Check if user exists
      const exists = await User.findByPk(user_id);
      if (!exists) {
        return Response.responseStatus(res, 404, `User (${user_id}) not found`);
      }

      const {
        firstName,
        lastName,
        email,
        mobileNumber,
        password,
        isActive,
        userType,
      } = req.body;
      const user = {
        first_name: firstName,
        last_name: lastName,
        mobile_number: mobileNumber,
        email,
        user_type: userType,
        is_active: isActive,
        modified_by: modifiedBy,
      };
      // Hash the password before storing in the database
      if (password) {
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        user.password = hashedPassword;
      }

      const result = await User.update(user, { where: { id: user_id } });
      if (!result) {
        return Response.responseStatus(
          res,
          404,
          `Failed To Update User(${user_id})`
        );
      }
      return Response.responseStatus(
        res,
        200,
        `User Updated Successfully(${user_id})`
      );
    } catch (error) {
      console.log(error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
  deleteUserById: async (req, res) => {
    try {
      const userId = req.params.id;
      const deletedBy = req.userData.id;

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return Response.responseStatus(res, 404, `User (${userId}) not found`);
      }

      await User.update({ deleted_by: deletedBy }, { where: { id: userId } });
      await User.destroy({ where: { id: userId } });

      return Response.responseStatus(
        res,
        200,
        `User (${userId}) deleted successfully`
      );
    } catch (error) {
      console.error("Error deleting user:", error);
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
};

module.exports = usersController;
