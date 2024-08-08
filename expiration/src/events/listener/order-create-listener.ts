import { Listener, OrderCreatedEvent, Subjects } from "@know_nothing/common";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Message } from 'node-nats-streaming';
import { expirationQueue } from "../../queues/expiration-queue";
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = QUEUE_GROUP_NAME;
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // console.log('Event data!', data);
        const delay= new Date(data.expiresAt).getTime() - new Date().getTime();
        await expirationQueue.add({orderId: data.id},
            {
            delay
        }
    );


        msg.ack();
    }
}