export type Review = {
  id: string;
  user_id: string;
  user_name?: string;
  rent_property_id: string;

  rating: number;        // 1..5 (per your server)
  comment: string;
  created_at: string;    // ISO datetime
  is_positive?: boolean; // server-derived flag
};

export type CreateReviewInput = {
  user_id: string;
  rating: number;
  comment: string;
  rent_property_id: string;
};
