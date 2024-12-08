import mongoose, { Schema } from "mongoose";

const carSchema = new Schema(
  {
    carTitle: {
      type: String,
      required: true,
    },

    carDesc: {
      type: String,
      required: true,
    },

    carPrice: {
      type: Number,
      required: true,
    },

    carImage: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },
  },
  { timestamps: true } // updatedAt, createdAt
);

export default mongoose.model("Cars", carSchema);
