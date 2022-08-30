const mongoose = require('mongoose');


const gameSchema = mongoose.Schema(
  {
    eventNumber: {
      type: Number,
      required: true,
      trim: true,
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
    }
  }
);

/**
 * @typedef Game
 */
const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
