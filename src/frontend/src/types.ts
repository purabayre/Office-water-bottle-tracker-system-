export type Entry = {
  _id: string;
  date: string;
  bottle_count: number;
  price_per_bottle: number;
  amount: number;
};

export type Summary = {
  total_bottles: number;
  total_amount: number;
  delivery_days: number;
};