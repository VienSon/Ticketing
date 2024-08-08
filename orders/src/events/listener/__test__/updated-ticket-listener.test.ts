import { Message } from 'node-nats-streaming';
import { UpdatedTicketEvent } from "@know_nothing/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { CreatedTicketListener } from "../created-ticket-listener";
import { Ticket } from '../../../models/ticket';

const setup = async () => {
   // Create an instance of the listener
   const listener = new CreatedTicketListener(natsWrapper.client);
   // Create a fake data event
   const data: UpdatedTicketEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 10,
      userId: "",
      version: 0
   };
   // Create a fake message object
   // @ts-ignore
   const msg: Message = {
      ack: jest.fn() //just care about the ack function be called 
   };
   return { listener, data, msg };
};

it('finds, updates, and saves a ticket', async () => {
   const { listener, data, msg } = await setup();
   // Call the onMessage function with the data object + message object
   await listener.onMessage(data, msg);
   // Write assertions to make sure a ticket was created
   const ticket = await Ticket.findById(data.id);
   expect(ticket).toBeDefined();
   expect(ticket!.title).toEqual(data.title);
   expect(ticket!.price).toEqual(data.price);
});   

it('acks the message', async () => {
   const { listener, data, msg } = await setup();
   // Call the onMessage function with the data object + message object
   await listener.onMessage(data, msg);
   // Write assertions to make sure ack function is called
   expect(msg.ack).toHaveBeenCalled();
})
