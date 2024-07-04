// set up express app
const express = require('express')
const app = express()
require('dotenv').config()
const morgan = require('morgan')
const cors = require('cors')

// set up person model
const Person = require('./models/person')

// log data for POST requests
morgan.token('data', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ''
})

// error handling middleware function
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  console.log(error.name)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    console.log('sending...')
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

// unknown endpoint middleware function
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// middleware
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data')
)

// DEFAULT PAGE
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

// FETCH DATA
app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
  console.log('fetched data from backend...')
})

// FETCH PERSON BY ID
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

// CREATE PERSON
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  // missing name or number
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'missing name or number',
    })
  }

  // add person object to db
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  // save to db or handle validator
  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
  console.log('added', person.name)
})

// DELETE PERSON BASED ON ID
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      console.log('scucessful delete')
      response.status(204).end()
    })
    .catch((error) => next(error))
})

// UPDATE PERSON BASED ON ID
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  console.log('in function')

  // replace old person with new person object by ID
  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    {
      new: true,
      runValidators: true, // enable mongoose validator
      context: 'query',
    }
  )
    .then((updatedPerson) => {
      // ensures person ID found
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).send({
          error: `Information of ${name} has already been removed from server`,
        })
      }
    })
    .catch((error) => next(error))
})

app.get('/api/info', (request, response, next) => {
  Person.countDocuments({})
    .then((entries) => {
      const timestamp = new Date()
      response.send(
        `<p>Phonebook has info for ${entries} people</p>
      <p>${timestamp}</p>`
      )
    })
    .catch((error) => next(error))
})

// registered at end of middleware stock (no route matches)
app.use(unknownEndpoint)

// error handling middleware used upon next(error) call
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!!`)
})
