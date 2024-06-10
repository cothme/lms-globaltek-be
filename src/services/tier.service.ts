import TierModel from "../models/tier.model";
import * as TierRepository from "../repositories/tier.repository";
import Tier from "../interfaces/Tier";
import createHttpError from "http-errors";

export const createNewTierService = async (tierData: Tier) => {
  const { tier_title, tier_description, tier_price, required_subscription } =
    tierData;

  const missingFields = [];
  if (!tier_title) missingFields.push("Tier Title");
  if (!tier_description) missingFields.push("Tier Description");
  if (!tier_price) missingFields.push("Tier Price");

  if (missingFields.length > 0) {
    throw createHttpError(400, `Missing fields: ${missingFields.join(", ")}`);
  }

  if (tier_title) {
    const existingTier = await TierRepository.findTierByTitle(tier_title);
    if (existingTier) {
      throw createHttpError(409, "Tier already exists");
    }
  } else {
    throw createHttpError(404, "Tier undefined");
  }

  return await TierRepository.createTier(tierData);
};
export const getAllTierService = async (
  query: Tier,
  page: number,
  limit: number
) => {
  return await TierRepository.getAllTiers(query, page, limit);
};

export const updateTierService = async (tierId: string, tierData: Tier) => {
  if (!tierId) {
    throw createHttpError(400, "Tier ID is required");
  }
  const existingTier = await TierRepository.findById(tierId);
  if (!existingTier) {
    throw createHttpError(404, "Tier not found");
  }

  return await TierRepository.updateTier(tierId, tierData);
};
