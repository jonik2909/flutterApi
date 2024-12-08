import { Types } from "mongoose";

export interface Car {
  _id?: Types.ObjectId;
  carTitle: string;
  carDesc: string;
  carPrice: number;
  carImage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarInput {
  carTitle: string;
  carDesc: string;
  carPrice: number;
  carImage: string;
}

export interface CarUpdateInput {
  _id?: Types.ObjectId;
  carTitle?: string;
  carDesc?: string;
  carPrice?: number;
  carImage?: string;
}
