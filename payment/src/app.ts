import express from "express";
import "express-async-errors";//add top to apply to all below
import {json} from "body-parser";
import cookieSession from "cookie-session";
import { currentUser, errorHandler,NotFoundError } from "@know_nothing/common";
import { createChargeRouter } from "./routes/new";

const app=express();

app.set("trust proxy", true);//for cookieSession
app.use(json());
app.use(cookieSession({
   signed:false,
   secure:process.env.NODE_ENV!=="test"
}))
app.use(currentUser);

app.use(createChargeRouter);

app.all("*", async() => {
   throw new NotFoundError()
})
app.use(errorHandler);

export {app}