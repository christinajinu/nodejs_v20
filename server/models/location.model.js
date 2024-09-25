import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  location: {
    lat: Number,
    lng: Number,
  },
  city: String,
  countryCode: String,
  region: String,
  subRegion: String,
  cityCountry: String,
  updatedAt: { type: Date, default: Date },
});

export default mongoose.model('Location', locationSchema);
