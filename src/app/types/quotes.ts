export type WeddingQuotation = {
  client_details: ClientDetails;
  items: Item[];
  financials: Financials;
};

export type ClientDetails = {
  client: string;
  function_date: string;
  venue: string;
};

export type Item = {
  sl_no?: number;
  description: string;
  quantity?: string;
  approx_rate_inr: number;
  note?: string;
};

export type Financials = {
  sub_total: number;
  final_amount: number;
  currency: string;
};

