import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { stripe } from "../stripe";
import dotenv from "dotenv";
import * as TierRepository from "../repositories/tier.repository";
import * as UserRepository from "../repositories/user.repository";
import { jwtDecode } from "jwt-decode";
import { Document } from "mongoose";
import Stripe from "stripe";
import UserModel from "../models/user.model";

dotenv.config();

export const makePayment: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwtDecode<{ _id: string }>(String(token));
  const userId = decoded._id;
  const { tier_title } = req.body;
  const tier = await TierRepository.findTierByTitle(tier_title);

  if (!tier) {
    return next(createHttpError(404, "Tier not found"));
  }

  try {
    // Check if the user exists in your system
    const user = await UserRepository.findById(userId);
    if (user?.subscription_tier === tier.tier_title) {
      return next(
        createHttpError(400, "User is already subscribed to this tier")
      );
    }
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    const customerStripeId = user.stripe_customer_id;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerStripeId!,
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
      success_url: `${process.env.ROOT_URL}/success`,
      cancel_url: `${process.env.ROOT_URL}/pricing`,
      metadata: {
        _id: userId,
        tier_title: tier.tier_title,
      },
    });

    return res.json({ url: session.url });
  } catch (error: any) {
    console.error("Failed to create payment session:", error);
    return next(createHttpError(500, error));
  }
};

export const handleStripeWebhook: RequestHandler = async (req, res, next) => {
  const sig = req.headers["stripe-signature"] as string;
  const rawBody = req.body;

  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?._id;
        const tierTitle = session.metadata?.tier_title;

        try {
          if (userId && tierTitle) {
            const user = await UserRepository.findById(userId);
            if (user) {
              user.subscription_tier = tierTitle;
              await user.save();
              console.log(
                `User ${userId} subscription updated to ${tierTitle}`
              );
            } else {
              console.error(`User not found: ${userId}`);
            }
          } else {
            console.error(`Missing metadata: userId or tierTitle`);
          }
        } catch (err: any) {
          console.error(`Failed to update user subscription: ${err.message}`);
        }
        break;
      case "customer.created":
        const customer = event.data.object;
        console.log(`Customer created: ${customer.id}`);
        try {
          console.log(
            `Attempting to find and update user with email: ${customer.email}`
          );

          const user = await UserModel.findOneAndUpdate(
            { email: customer.email },
            { customerStripeId: customer.id },
            { new: true }
          );

          if (user) {
            console.log(
              `Updated user ${user._id} with customerStripeId: ${customer.id}`
            );
          } else {
            console.log(`User with email ${customer.email} not found.`);
          }
        } catch (error: any) {
          console.error(`Error updating user: ${error.message}`);
        }

        break;
      // Handle other event types as needed

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
function useState<T>(arg0: string): [any, any] {
  throw new Error("Function not implemented.");
}
