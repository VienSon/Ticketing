import { requireAuth, validateRequest } from "@know_nothing/common";
import {} from "express";
import { body } from "express-validator";
import { Request, Response, Router } from "express";
import { Ticket } from "../models/ticket";
import { TicketCreatedPublisher } from "../events/publisher/ticket-create-publisher";
import { natsWrapper } from "../nats-wrapper";
const router = Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than 0"),
  ],validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id, //get from currentUser middleware
    });
    await ticket.save();
    //publish event
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    })
    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
