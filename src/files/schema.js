import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String, required: true },
});

export default mongoose.model("File", FileSchema);
