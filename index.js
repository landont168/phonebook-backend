const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const app = express();

// token to return data for POST requests
morgan.token("data", (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return "";
});

// middleware
app.use(cors());
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :data")
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  console.log("fetching data from backend...");
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    console.log("x");
    response.status(404).end();
  }
});

const generateId = () => {
  return Math.floor(Math.random() * 100000);
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  // missing name/number
  if (!body.name) {
    return response.status(400).json({
      error: "missing name",
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: "missing number",
    });
  }

  // name already exists
  const existingPerson = persons.find(
    (person) => person.name.toLowerCase() === body.name.toLowerCase()
  );
  if (existingPerson) {
    return response.status(400).json({
      error: "name must be unqiue",
    });
  }

  // add person object to array
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.get("/api/info", (request, response) => {
  const entires = persons.length;
  const timestamp = new Date();
  response.send(
    `<p>Phonebook has info for ${entires} people</p>
    <p>${timestamp}</p>`
  );
});

const PORT = process.env.PORT || 3001;
console.log(PORT);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
