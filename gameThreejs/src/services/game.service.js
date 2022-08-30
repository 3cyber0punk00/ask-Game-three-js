const { Game } = require('../models');

const updateLastAction = async ({eventNumber , eventName}) => {
    update = { eventNumber,eventName },
    options = { upsert: true, new: true, setDefaultsOnInsert: true };
  let game = await Game.findOneAndUpdate({'_id':'630de069da357a00f4818fb4'}, update, options )
  return game;
};

const getLatestAction = async () => {
   
  let game = await Game.findOne({'_id':'630de069da357a00f4818fb4'} )
  return game;
};



module.exports = {
  updateLastAction,
  getLatestAction
};
