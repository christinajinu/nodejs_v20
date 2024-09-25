import mongoose from 'mongoose';

const { MONGO_URI, NODE_ENV } = process.env;
mongoose.set('strictQuery', false);
const connectionURI = MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(connectionURI, { maxPoolSize: 10 });
    console.info(
      `\x1b[4m\u001b[46;1m MongoDB Connected:\u001b[44;1m ${NODE_ENV} DB \u001b[0m`
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// listen for termination signals and close the connection gracefully
process.on('SIGINT', () => {
  // check if the connection is ready
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.close(() => {
      console.info('Mongoose connection disconnected due to app termination');
      process.exit(0);
    });
  }
});

process.on('SIGTERM', () => {
  // check if the connection is ready
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.close(() => {
      console.info('Mongoose connection disconnected due to app termination');
      process.exit(0);
    });
  }
});

export default connectDB;
