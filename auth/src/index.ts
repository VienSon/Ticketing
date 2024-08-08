import mongoose from "mongoose";
import { app } from "./app";


const start = async () => {
   if(process.env.JWT_KEY===undefined) throw new Error('JWT_KEY must be defined');
   if(process.env.MONGO_URI===undefined) throw new Error('MONGO_URI must be defined');
   try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("connected to mongodb");
      app.listen(3100,()=>console.log(`server listening on port: ${3100}`))
   } catch (error) {
      console.log('could not connect to mongodb',error);
   }
}

start()