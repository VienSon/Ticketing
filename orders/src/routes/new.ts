import express, { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@know_nothing/common";
import { body } from "express-validator";
import { Order } from "../models/order";
import { Ticket } from "../models/ticket";
import mongoose
 from "mongoose";
import { CreatedOrderPublisher } from "../events/publisher/created-order-publisher";
import { natsWrapper } from "../nats-wrapper";
const EXPIRATION_WINDOW_SECONDS = 1 * 60;

const router = express.Router();
router.post(
  "/api/orders",
  requireAuth,
  body("ticketId").not().isEmpty().custom(async (input) => {
    mongoose.Types.ObjectId.isValid(input);
  }).withMessage("TicketId must be provided"),
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }

    //build an order and save it to db
    let expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt,
      ticket,
    });
    await order.save();

    //publish an event saying that an order was created
    new CreatedOrderPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
      version: order.version,
    })
    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
