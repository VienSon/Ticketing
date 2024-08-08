import { Subjects, Listener, PaymentCreatedEvent } from "@know_nothing/common";

import { Order } from "../../models/order";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { OrderStatus } from "@know_nothing/common";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
   subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
   queueGroupName = QUEUE_GROUP_NAME;
   async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
      const order = await Order.findById(data.orderId);
      if (!order) {
         throw new Error("Order not found");
      }

      order.set({ status: OrderStatus.Complete });
      await order.save();
      msg.ack();
   }
}