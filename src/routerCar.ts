import express from "express";
import carController from "./controllers/carController";
import uploader from "./libs/utils/uploader";
const routerCar = express.Router();

routerCar.get("/", async (req, res) => {
  res.send("Welcome CAR SHOP API!");
});

routerCar.get("/all", carController.getCars);

routerCar.post(
  "/create",
  uploader("cars").single("carImage"),
  carController.createCar
);

routerCar.post(
  "/update",
  uploader("cars").single("carImage"),
  carController.updateCar
);

export default routerCar;
