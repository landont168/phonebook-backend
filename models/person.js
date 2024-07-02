const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

// connect to database
const url = process.env.MONGODB_URI;

mongoose
  .connect(url)
  .then((result) => {
    console.log("successully connected to mongodb");
  })
  .catch((error) => {
    console.log("error connecting to mongodb", error.message);
  });

// set up schema and model
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

// format toJSON method of schema
personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// export person model
module.exports = mongoose.model("Person", personSchema);
