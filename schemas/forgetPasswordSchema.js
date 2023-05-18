const validator = require("validator");
const mongoose = require("mongoose");

let randomStringSchema = new mongoose.Schema(
  {
    randomString: { type: String, required: true },
    createdAt:{ type:Date,default:Date.now()}
  },
  {
    collection: "randomStrings",
    versionKey: false,
  }
);

let randomStringModel = mongoose.model("randomStrings", randomStringSchema);

module.exports = {randomStringModel};
