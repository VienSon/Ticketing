import { Subjects, Publisher, PaymentCreatedEvent } from "@know_nothing/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
   subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}