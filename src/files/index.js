import express from "express";
import FileModel from "./schema.js";
import { v2 as cloudinary } from "cloudinary";
import bodyParser from "body-parser";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const fileRouter = express.Router();

fileRouter.use(bodyParser.json());
fileRouter.use(bodyParser.urlencoded({ extended: true }));

/* GET ALL FILES */

fileRouter.get("/", async (req, resp, next) => {
  try {
    const seenIds = [];
    const allFiles = await FileModel.find({});
    const allFilesLength = allFiles.length;
    const nineFiles = await FileModel.aggregate(
      [{ $sample: { size: 9 } }],
      [{ $match: { _id: { $nin: seenIds } } }]
    );
    for (let i = 0; i < 9; i++) {
      seenIds.push(nineFiles[i]._id);
    }
    console.log("🔸ALL FILES FETCHED🙌");
    resp.send({ allFilesLength, nineFiles });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

/* GET SINGLE FILE */

fileRouter.get("/:id", async (req, resp, next) => {
  try {
    const singleFile = await FileModel.find({ _id: req.params.id });
    console.log("🔸FILE FETCHED🙌");
    resp.send(singleFile);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

/* POST A FILE */

fileRouter.post("/", async (req, resp, next) => {
  try {
    const data = {
      url: req.body.url,
    };
    const image = await cloudinary.uploader.unsigned_upload(
      data.url,
      "RisiGraph"
    );
    const newFile = new FileModel({ ...req.body, url: image.url });
    const { _id } = await newFile.save();
    console.log("NEW FILE SAVED🙌");
    resp.status(201).send(newFile);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

/* UPDATE A FILE */

fileRouter.put("/:id", async (req, resp, next) => {
  try {
    const filter = { _id: req.params.id };
    const update = { ...req.body };
    const updatedFile = await FileModel.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });
    await updatedFile.save();
    console.log("FILE UPDATED🙌");
    resp.send(updatedFile);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

/* DELETE A FILE */

fileRouter.delete("/:id", async (req, resp, next) => {
  try {
    const deletedFile = await FileModel.findOneAndDelete({
      _id: req.params.id,
    });
    resp.status(204).send();
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export default fileRouter;
