import { OrderCreatedEvent, Publisher, Subjects } from "@know_nothing/common";

export class CreatedOrderPublisher extends Publisher<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}