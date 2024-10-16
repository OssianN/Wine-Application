import { Schema, model, models } from 'mongoose';

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
  price: { type: String },
  currentValue: { type: String },
  vivinoUrl: { type: String },
});

const WineDataBase = models.wines || model('wines', wineSchema);

export default WineDataBase;
