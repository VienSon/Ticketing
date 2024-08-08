import { OrderStatus, PaymentCreatedEvent } from "@know_nothing/common";
import { natsWrapper } from "../../../nats-wrapper";
import { PaymentCreatedListener } from "../payment-created-listener";
import mongoose from "mongoose";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
   // Create an instance of the listener
   const listener = new PaymentCreatedListener(natsWrapper.client);
   const ticket=Ticket.build({
       id: new mongoose.Types.ObjectId().toHexString(),
       title: 'concert',
       price: 10
   })
   await ticket.save();

   const order = Order.build({
      status: OrderStatus.Created,
      userId: "alskdjf",
      expiresAt: new Date(),
      ticket
   });
   await order.save();
   
   // Create a fake data event
   const data: PaymentCreatedEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      orderId: order.id,
      stripeId: 'stripe_id'
   };
   // Create a fake message object
   // @ts-ignore
   const msg: Message = {
      ack: jest.fn() //just care about the ack function be called 
   };
   return { listener, data, msg };
}

it('replicates the order info', async () => {
   const { listener, data, msg } = await setup();
   // Call the onMessage function with the data object + message object
   await listener.onMessage(data, msg);
   const savedOrder = await Order.findById(data.orderId);
   expect(savedOrder!.status).toEqual(OrderStatus.Complete);
   // Write assertions to make sure a ticket was created
   expect(msg.ack).toHaveBeenCalled();
})