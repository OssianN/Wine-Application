import mongoose, { Schema, model } from 'mongoose';

const wineSchema = new Schema({
  title: { type: String },
  country: { type: String },
  year: { type: Number },
  comment: { type: String },
  shelf: { type: Number },
  column: { type: Number },
  archived: { type: Boolean },
  img: { type: String },
  rating: { type: String },
  price: { type: Number },
  currentPrice: { type: Number },
  vintageId: { type: Number },
  drinkingWindowStart: { type: Number },
  drinkingWindowEnd: { type: Number },
  drinkingWindowStatus: { type: Number },
  vivinoUrl: { type: String },
});

if (mongoose.models.wines) {
  mongoose.deleteModel('wines');
}

const WineDataBase = model('wines', wineSchema);

export default WineDataBase;
