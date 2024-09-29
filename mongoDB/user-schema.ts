import { Schema, model, models } from 'mongoose'

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  wineList: {
    type: Array,
  },
  columns: {
    type: Number,
  },
  shelves: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

const UserDataBase = models.users || model('users', UserSchema)

export default UserDataBase
