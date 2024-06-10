import TierModel from "../models/tier.model";
import Tier from "../interfaces/Tier";

export const findTierByTitle = async (tier_title: string) => {
  return await TierModel.findOne({ tier_title });
};

export const findById = async (_id: string) => {
  return await TierModel.findOne({ _id });
};

export const createTier = async (tierData: Tier) => {
  return await TierModel.create(tierData);
};

export const getAllTiers = async (query: Tier, page: number, limit: number) => {
  const allTiers = await TierModel.find();
  const offset = (page - 1) * limit;

  const tiers = await TierModel.find(query)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  return { tiers, allTiers: allTiers.length };
};

export const updateTier = async (_id: string, tierData: Tier) => {
  return await TierModel.findByIdAndUpdate(_id, tierData, { new: true });
};
