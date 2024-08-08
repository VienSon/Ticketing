import { Publisher, Subjects ,OrderCancelledEvent} from "@know_nothing/common";

export class CancelledOrderPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}