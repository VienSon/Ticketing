import express from "express";
import "express-async-errors";//add top to apply to all below
import {json} from "body-parser";
import cookieSession from "cookie-session";

import { curentUserRouter } from "./routes/curent-user";
import { signupRouter } from "./routes/signup";
import { signoutRouter } from "./routes/signout";
import { signinRouter } from "./routes/signin";
import { errorHandler,NotFoundError } from "@know_nothing/common";

const app=express();

app.set("trust proxy", true);//for cookieSession
app.use(json());
app.use(cookieSession({
   signed:false,
   secure:process.env.NODE_ENV!=="test"
}))
app.use(curentUserRouter);
app.use(signupRouter);
app.use(signoutRouter);
app.use(signinRouter);

app.all("*", async() => {
   throw new NotFoundError()
})
app.use(errorHandler);

export {app}