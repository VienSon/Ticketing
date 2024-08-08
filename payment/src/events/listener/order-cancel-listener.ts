import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Listener, NotFoundError, OrderCancelledEvent, OrderStatus, Subjects } from "@know_nothing/common";
import { Order } from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
   subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
   queueGroupName = QUEUE_GROUP_NAME;

   async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
      const order = await Order.findByEvent(data);
      if (!order) {
         throw new NotFoundError();
      }
      order.set({ status: OrderStatus.Cancelled });
      await order.save();
      msg.ack();
   }
}