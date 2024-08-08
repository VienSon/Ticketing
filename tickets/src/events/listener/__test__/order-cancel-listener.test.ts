import { OrderCancelledEvent } from "@know_nothing/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancel-listener";
import mongoose from "mongoose";

const setup = async () => {
   // Create an instance of the listener
   const listener = new OrderCancelledListener(natsWrapper.client);
   // Create a fake data event
   const ticket=Ticket.build({
       userId: 'fdla',
       title: 'concert',
       price: 10
   })
   await ticket.save();
   const data: OrderCancelledEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      ticket: {
          id: ticket.id
      }
   };
   
   // Create a fake message object
   // @ts-ignore
   const msg: Message = {
      ack: jest.fn() //just care about the ack function be called 
   };
   return { listener, data, msg ,ticket};
};


it('updates the ticket, publishes an event, and acks the message', async () => {
   const { listener, data, msg ,ticket} = await setup();
   // Call the onMessage function with the data object + message object
   await listener.onMessage(data, msg);
   // Write assertions to make sure a ticket was created
   const updatedTicket = await Ticket.findById(ticket.id);
   expect(updatedTicket!.orderId).not.toBeDefined();
   expect(msg.ack).toHaveBeenCalled();
   expect(natsWrapper.client.publish).toHaveBeenCalled();
})

