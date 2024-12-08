import express from "express";
import carController from "./controllers/carController";
const routerCar = express.Router();

routerCar.get("/", async (req, res) => {
  res.send("Welcome CAR SHOP API!");
});

routerCar.get("/all", carController.getCars);
routerCar.get("/cars", carController.getCars);

export default routerCar;
