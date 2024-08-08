import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { CreatedTicketListener } from "./events/listener/created-ticket-listener";
import { UpdatedTicketListener } from "./events/listener/updated-ticket-listener";
import { ExpirationCompleteListener } from "./events/listener/expiration-complete-listener";
const start = async () => {
   if(process.env.JWT_KEY===undefined) throw new Error('JWT_KEY must be defined');
   if(process.env.MONGO_URI===undefined) throw new Error('MONGO_URI must be defined');
   if(process.env.NATS_URL===undefined) throw new Error('NATS_URL must be defined');
   if(process.env.NATS_CLUSTER_ID===undefined) throw new Error('NATS_CLUSTER_ID must be defined');
   if(process.env.NATS_CLIENT_ID===undefined) throw new Error('NATS_CLIENT_ID must be defined');   
   try {
      await natsWrapper.connect(process.env.NATS_CLUSTER_ID,process.env.NATS_CLIENT_ID,process.env.NATS_URL);
      natsWrapper.client.on('close',()=>{
         console.log('NATS connection closed');
         process.exit();
      })
      process.on("SIGINT", () => natsWrapper.client.close());
      process.on("SIGTERM", () => natsWrapper.client.close());
      
      new CreatedTicketListener(natsWrapper.client).listen();
      new UpdatedTicketListener(natsWrapper.client).listen();
      new ExpirationCompleteListener(natsWrapper.client).listen();

      await mongoose.connect(process.env.MONGO_URI);
      console.log("connected to mongodb");
      app.listen(3000,()=>console.log(`server listening on port: ${3000}`))
   } catch (error) {
      console.log('could not connect to mongodb',error);
   }
}

start()