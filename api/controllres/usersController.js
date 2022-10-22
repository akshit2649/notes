const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const brcypt = require("bcrypt");

// @desc GET all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length)
    return res.status(400).json({ message: "No users found" });
  res.json(users);
});

// @desc Create all users
// @route POST /users
// @access Private
const createNewUsers = asyncHandler(async (req, res) => {
  const { userName, password, roles } = req.body;

  //Confirm data
  if (!userName || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //Check for duplicates
  const duplicate = await User.findOne({ userName }).lean().exec();

  if (duplicate) return res.status(409).json({ message: "Duplicate username" });

  //Hash Password
  const hashedPwd = await brcypt.hash(password, 10);

  const userObject = { userName, password: hashedPwd, roles };

  //Create and store new user
  const user = await User.create(userObject);

  if (user) {
    //Created
    res.status(201).json({ message: `New user ${userName} created` });
  } else res.status(400).json({ message: "Invalid user data received" });
});

// @desc Update a users
// @route PATH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, userName, roles, active, password } = req.body;

  //confirm data
  if (
    !id ||
    !userName ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  )
    return res.status(400).json({ message: "All feilds are required" });

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //Check for duplicate
  const duplicate = await User.findOne({ userName }).lean().exec();

  //Allow updated to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.userName = userName;
  user.roles = roles;
  user.active = active;

  if (password) {
    //Hash password
    user.password = await brcypt.hash(password, 10); //salt rounds
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.userName} updated` });
});

// @desc Delete a users
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    return res.status(400).json({ message: "User has assigned notes" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.userName} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = { getAllUsers, createNewUsers, updateUser, deleteUser };
