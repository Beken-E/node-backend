const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {

  const {password, ...logData} = userBody;
  logger.info(`Начата вызов функции createUser. Параметры вызова: ${toString(logData)}`);

  if (await User.isEmailTaken(userBody.email)) {
    logger.info(`Email уже существует`);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email уже существует, выберите другой');
  }

  const user = await User.create(userBody);

  return user;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {

  const {password, ...logData} = updateBody;
  logger.info(`Начата вызов функции updateUserById. Параметры вызова: userId: ${userId}, updateBody: ${logData}`);

  const user = await getUserById(userId);
  if (!user) {
    logger.error(`Пользователь не найден по userId: ${userId}`);
    throw new ApiError(httpStatus.NOT_FOUND, 'Пользователь не найден');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    logger.error(`Email уже существует, выберите другой. updateBody.email: ${updateBody.email}`);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email уже существует, выберите другой');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {

  logger.info(`Начата вызов функции deleteUserById. Параметры вызова: ${userId}`);

  const user = await getUserById(userId);
  if (!user) {
    logger.error(`Пользовател не найден по userId: ${userId}`);
    throw new ApiError(httpStatus.NOT_FOUND, 'Пользователь не найден');
  }
  await user.remove();
  return user;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};
