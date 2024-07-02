// set up express app
const express = require("express");
const app = express();
require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");

// set up person model
const Person = require("./models/person");

// log data for POST requests
morgan.token("data", (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return "";
});

// error handling middleware function
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

// unknown endpoint middleware function
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// middleware
app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :data")
);

// DEFAULT PAGE
app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

// FETCH DATA
app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
  console.log("fetched data from backend...");
});

// FETCH PERSON BY ID
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// CREATE PERSON
app.post("/api/persons", (request, response) => {
  const body = request.body;

  // missing name or number
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "missing name or number",
    });
  }

  // add person object to db
  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
  console.log("added", person.name);
});

// DELTE PERSON BASED ON ID
app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      console.log("scucessful delete");
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  // create updated person object
  const body = request.body;
  const person = {
    name: body.name,
    number: body.number,
  };

  // replace old person with new person object by ID
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      console.log("updated!");
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.get("/api/info", (request, response, next) => {
  Person.countDocuments({})
    .then((entries) => {
      const timestamp = new Date();
      response.send(
        `<p>Phonebook has info for ${entries} people</p>
      <p>${timestamp}</p>`
      );
    })
    .catch((error) => next(error));
});

// next middleware
app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!!`);
});
