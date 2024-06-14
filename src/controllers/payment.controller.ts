import { RequestHandler } from "express";
import createHttpError from "http-errors";
import Stripe from "stripe";
import dotenv from "dotenv";
import * as TierRepository from "../repositories/tier.repository";
import * as UserRepository from "../repositories/user.repository";
import { jwtDecode } from "jwt-decode";
import { Document } from "mongoose";

dotenv.config();

const stripe = new Stripe(String(process.env.STRIPE_SECRET));

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
    const user = (await UserRepository.findById(userId)) as Document & {
      stripeCustomerId?: string;
    };
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    let customerStripeId = user.stripeCustomerId;
    if (!customerStripeId) {
      const customer = await stripe.customers.create({
        metadata: {
          _id: userId,
        },
      });
      customerStripeId = customer.id;

      user.stripeCustomerId = customerStripeId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerStripeId,
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
  } catch (error) {
    console.error("Failed to create payment session:", error);
    return next(createHttpError(500, "Failed to create payment session"));
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
