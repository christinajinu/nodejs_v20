import mongoose from 'mongoose';

const productAnalysisSchema = new mongoose.Schema({
  productName: String,
  Count: Number,
  Location: [
    {
      City: String,
      SubRegion: String,
      Region: String,
      Country: String,
      Location: {
        lat: Number,
        lng: Number,
      },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Analysis', productAnalysisSchema);
