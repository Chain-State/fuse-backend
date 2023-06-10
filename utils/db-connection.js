const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    const encodedURI = encodeURIComponent(process.env.DATABASE_URI)
    await mongoose.connect(process.env.DATABASE_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log(`Connected to database: [${process.env.DATABASE_URI}]`);
  } catch (err) {
    console.log(`Could not initialize server. ${err}`);
    process.exit(1);
  }
};

module.exports = connectDB;