import express from "express";
import "express-async-errors";//add top to apply to all below
import {json} from "body-parser";
import cookieSession from "cookie-session";


import { currentUser, errorHandler,NotFoundError } from "@know_nothing/common";
import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes/index";
import { updateTicketRouter } from "./routes/update";

const app=express();

app.set("trust proxy", true);//for cookieSession
app.use(json());
app.use(cookieSession({
   signed:false,
   secure:process.env.NODE_ENV!=="test"
}))
app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all("*", async() => {
   throw new NotFoundError()
})
app.use(errorHandler);

export {app}