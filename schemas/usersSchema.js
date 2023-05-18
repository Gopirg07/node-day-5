const validator = require("validator");
const mongoose = require("mongoose");

let userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      validate: (val) => {
        return validator.isEmail(val);
      },
    },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now() },
  },
  {
    collection: "users",
    versionKey: false,
  }
);

let UserModel = mongoose.model("users", userSchema);

module.exports = { UserModel };
