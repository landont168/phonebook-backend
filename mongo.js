const mongoose = require('mongoose')

// missing password
if (process.argv.length < 3) {
  console.log('missing password')
  process.exit(1)
}

// connect to database
const password = process.argv[2]
const url = `mongodb+srv://landontrinh:${password}@fso-helsinki.t5h58ik.mongodb.net/?retryWrites=true&w=majority&appName=fso-helsinki`
mongoose.set('strictQuery', false)
mongoose.connect(url)

// set up schema and model
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

// display entries
if (process.argv.length < 4) {
  console.log('phonebook:')
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
} else {
  // create object
  const name = process.argv[3]
  const number = process.argv[4]
  const person = new Person({
    name: name,
    number: number,
  })

  // save object to db
  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}
