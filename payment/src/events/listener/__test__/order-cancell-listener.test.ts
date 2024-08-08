import { OrderCancelledEvent, OrderStatus } from "@know_nothing/common";
import { OrderCancelledListener } from "../order-cancel-listener";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";

const setup = async () => {
   // Create an instance of the listener
   const listener = new OrderCancelledListener(natsWrapper.client);
   // Create a fake data event
   const order=Order.build({
       userId: 'fdla',
       price: 10,
       version: 0,
       id: new mongoose.Types.ObjectId().toHexString(),
       status: OrderStatus.Created
   })
   await order.save();
   
   const data: OrderCancelledEvent['data'] = {
      id: order.id,
      version: order.version + 1,
      ticket: {
         id: 'asldkfj'
      }
   };
   
   // Create a fake message object
   // @ts-ignore
   const msg: Message = {
      ack: jest.fn() //just care about the ack function be called 
   };
   return { listener, data, msg};
};

it('updates the status of the order', async () => {
   const { listener, data, msg } = await setup();
   await listener.onMessage(data, msg);
   const updatedOrder = await Order.findById(data.id);
   expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
   expect(msg.ack).toHaveBeenCalled();
})