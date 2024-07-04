const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

// connect to database
const url = process.env.MONGODB_URI

mongoose
  .connect(url)
  .then(() => {
    console.log('successully connected to mongodb')
  })
  .catch((error) => {
    console.log('error connecting to mongodb', error.message)
  })

// set up schema and model
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: (v) => /^\d{2,3}-\d{5,}$/.test(v),
    },
    required: true,
  },
})

// format toJSON method of schema
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

// export person model
module.exports = mongoose.model('Person', personSchema)
