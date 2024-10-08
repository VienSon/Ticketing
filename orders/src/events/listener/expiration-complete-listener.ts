import { ExpirationCompleteEvent, Listener, Subjects,NotFoundError, OrderStatus } from "@know_nothing/common";

import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Order } from "../../models/order";
import { CancelledOrderPublisher } from "../publisher/cancelled-order-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
   readonly subject = Subjects.ExpirationComplete;
   queueGroupName = QUEUE_GROUP_NAME;
   async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
      console.log('Event data!', data);
      const orderId = data.orderId;
      const order= await Order.findById(orderId).populate('ticket');
      if(!order){
         throw new NotFoundError();
      }
      //order is not cancelled
      if(order.status === OrderStatus.Complete){
         console.log('order is already payment');
         msg.ack();
         return;
      }
      //order is cancelled
      order.set({status: OrderStatus.Cancelled});
      await order.save();

      // publishing an event saying this was cancelled

      new CancelledOrderPublisher(this.client).publish({
         id:order.id,
         // version:order.version,
         ticket:{
            id:order.ticket.id
         },
         version:order.version
      })
      msg.ack();
   }
}