import { RequestHandler } from "express";
import createHttpError from "http-errors";
import Stripe from "stripe";
import dotenv from "dotenv";
import { session } from "passport";
import * as TierRepository from "../repositories/tier.repository";

dotenv.config();

const stripe = new Stripe(String(process.env.STRIPE_SECRET));

export const makePayment: RequestHandler = async (req, res, next) => {
  const { tier_title } = req.body;
  const tier = await TierRepository.findTierByTitle(tier_title);
  if (!tier) {
    return next(createHttpError(404, "Tier not found"));
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: tier.tier_title,
          },
          unit_amount: tier.tier_price * 100,
        },
        quantity: 1,
      },
    ],
    success_url: "https://example.com/success",
    cancel_url: "https://example.com/cancel",
  });
  return res.json({ url: session.url });
};
