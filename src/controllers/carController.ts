import Errors, { HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express";
import CarService from "../models/Car.service";

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

export default carController;
