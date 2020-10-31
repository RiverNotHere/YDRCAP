const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = mongoose.connect(process.env.DBPATH, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })

    console.log(`MongoDB Connected ${(await conn).connection.host}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

module.exports = connectDB