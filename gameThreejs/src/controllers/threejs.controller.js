const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { gameService} = require('../services');

const updateAction = catchAsync(async (req, res) => {
  const game = await gameService.updateLastAction(req.body);
  res.status(httpStatus.OK).send({ game });
});
const getLatestAction = catchAsync(async (req, res) => {
  const game = await gameService.getLatestAction();
  res.status(httpStatus.OK).send({ game });
});


module.exports = {
updateAction,
getLatestAction
};
