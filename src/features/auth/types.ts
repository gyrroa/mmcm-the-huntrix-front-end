export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  tier: string;
  points: number;
  referrals_count: number;
  transactions: number;
  property_sale: number;
  property_rental: number;
  direct_referrals: number;
  secondary_referrals: number;
  tertiary_referrals: number;
  positive_reviews: number;
  referral_code: number;
  is_verified: boolean;
  referred_by_id: string | null;
};

export type RegisterBody = {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  referral_code?: number | null;
};

export type LoginResponse = { access_token: string; token_type: string };
