import { RequestHandler } from "express";
import createHttpError from "http-errors";
import Stripe from "stripe";
import dotenv from "dotenv";
import { session } from "passport";

dotenv.config();

const stripe = new Stripe(String(process.env.STRIPE_SECRET));

export const makePayment: RequestHandler = async (req, res, next) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "T-shirt",
          },
          unit_amount: 4000,
        },
        quantity: 1,
      },
    ],
    success_url: "https://example.com/success",
    cancel_url: "https://example.com/cancel",
  });
  return res.json({ url: session.url });
};
