import { RequestHandler } from "express";
import * as TierService from "../services/tier.service";
import Tier from "../interfaces/Tier";
import createHttpError from "http-errors";

export const createTier: RequestHandler = async (req, res, next) => {
  const tierData: Tier = req.body;
  try {
    const newTier = await TierService.createNewTierService(tierData);
    res.status(201).json(newTier);
  } catch (error) {
    next(error);
  }
};
export const getTier: RequestHandler = async (req, res, next) => {
  const { page = 1, limit = 10, ...query } = req.query;
  const parsedPage = parseInt(page as string, 10);
  const parsedLimit = parseInt(limit as string, 10);
  try {
    const allTiers = await TierService.getAllTierService(
      query,
      parsedPage,
      parsedLimit
    );
    res.status(200).json(allTiers);
  } catch (error) {
    next(error);
  }
};

export const updateTier: RequestHandler = async (req, res, next) => {
  const { tierId } = req.params;
  const tierData: Tier = req.body;
  try {
    if (tierData?.tier_price! > 1000) {
      throw createHttpError(500, "Tier price must be less than 1000");
    }
    const updatedTier = await TierService.updateTierService(tierId, tierData);
    res.status(200).json(updatedTier);
  } catch (error) {
    next(error);
  }
};
