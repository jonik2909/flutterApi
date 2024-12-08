import express from "express";
import carController from "./controllers/carController";
import uploader from "./libs/utils/uploader";
const routerCar = express.Router();

routerCar.get("/all", carController.getCars);

routerCar.post("/create", carController.createCar);

routerCar.post("/update", carController.updateCar);

routerCar.post(
  "/upload/image",
  uploader("cars").single("carImage"),
  carController.uploadImage
);

routerCar.post("/delete/:id", carController.deleteCar);

export default routerCar;
