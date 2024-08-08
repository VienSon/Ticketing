import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from 'node-nats-streaming';
import { OrderCreateListener } from "../order-create-listener";
import { OrderCreatedEvent, OrderStatus } from "@know_nothing/common";
import { Order } from "../../../models/order";
const setup = async () => {
   // Create an instance of the listener
   const listener = new OrderCreateListener(natsWrapper.client);
  
   const data: OrderCreatedEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      expiresAt: 'alskdjf',
      userId: 'alskdjf',
      status: OrderStatus.Created,
      ticket: {
         id: 'alskdfj',
         price: 10
      }
   };
   
   // Create a fake message object
   // @ts-ignore
   const msg: Message = {
      ack: jest.fn() //just care about the ack function be called 
   };
   return { listener, data, msg};
};

it('replicates the order info', async () => {
   const { listener, data, msg } = await setup();
   // Call the onMessage function with the data object + message object
   await listener.onMessage(data, msg);
   // Write assertions to make sure a ticket was created
   const savedOrder = await Order.findById(data.id);
   // console.log("updated>>>",updatedTicket)
   expect(savedOrder!.userId).toEqual(data.userId);
   expect(savedOrder!.price).toEqual(data.ticket.price);
   expect(msg.ack).toHaveBeenCalled();

});