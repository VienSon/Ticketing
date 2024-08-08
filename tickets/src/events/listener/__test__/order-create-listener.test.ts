import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { Message } from 'node-nats-streaming';
import { OrderCreatedListener } from "../order-create-listener";
import { OrderCreatedEvent, OrderStatus } from "@know_nothing/common";
const setup = async () => {
   // Create an instance of the listener
   const listener = new OrderCreatedListener(natsWrapper.client);
   // Create a fake data event
   const ticket=Ticket.build({
       userId: 'fdla',
       title: 'concert',
       price: 10
   })
   await ticket.save();

   const data: OrderCreatedEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      status: OrderStatus.Created,
      userId: 'fajdfl',
      expiresAt: new Date().toISOString(),
      ticket: {
          id: ticket.id,
          price: ticket.price
      }
   };
   
   // Create a fake message object
   // @ts-ignore
   const msg: Message = {
      ack: jest.fn() //just care about the ack function be called 
   };
   return { listener, data, msg ,ticket};
};

it('replicates the order info', async () => {
   const { listener, data, msg ,ticket} = await setup();
   // Call the onMessage function with the data object + message object
   await listener.onMessage(data, msg);
   // Write assertions to make sure a ticket was created
   const updatedTicket = await Ticket.findById(ticket.id);
   // console.log("updated>>>",updatedTicket)
   expect(updatedTicket!.orderId).toEqual(data.id);
});