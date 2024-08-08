import { ExpirationCompleteEvent, OrderStatus } from "@know_nothing/common";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";

const setup = async () => {
   const listener = new ExpirationCompleteListener(natsWrapper.client);
   const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20
   })
   await ticket.save();

   const order = Order.build({
      status: OrderStatus.Created,
      userId: "alskdjf",
      expiresAt: new Date(),
      ticket
   });
   await order.save();

   const data: ExpirationCompleteEvent['data'] = {
      orderId: order.id
   }
   
   // @ts-ignore
   const msg: Message = {
      ack: jest.fn()
   };
   return { listener, data, msg };
};

it('updates the order status to cancelled', async () => {
   const { listener, data, msg } = await setup();
   await listener.onMessage(data, msg);
   const updatedOrder = await Order.findById(data.orderId);
   expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
   expect(msg.ack).toHaveBeenCalled();
   expect(natsWrapper.client.publish).toHaveBeenCalled();
});