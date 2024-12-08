import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express";
import CarService from "../models/Car.service";
import { Car, CarInput } from "../libs/types/car";

const carService = new CarService();

const carController: T = {};

carController.getCars = async (req: Request, res: Response) => {
  try {
    console.log("getCars");
    const result = await carService.getCars();

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getCars:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

carController.createCar = async (req: Request, res: Response) => {
  try {
    console.log("createCar");
    const input: CarInput = req.body;
    if (!req.file)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);

    if (req.file) input.carImage = req.file.path.replace(/\\/, "/");
    const result: Car = await carService.createCar(input);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, createCar:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default carController;
