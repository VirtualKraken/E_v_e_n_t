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

// ----------------------------------------

export type EvolveEvent = {
  id?: string;
  event_info: EventInfo;
  event_crew: EventCrew[];
  event_assets: EventAsset[];
  event_quote: any;
};
export type EventInfo = {
  client_name: string;
  function_date: string;
  venue: string;
  location?: string;
  phone:string;
};
export type EventCrew = {
  service_type: string;
  person_name: string;
  phone: string;
  amount: number;
};
export type EventAsset = {
  item_name: string;
  item_count: number;
};
export type EventQuote = {
  discount: number;
  final_amount: number;
  QuoteItems: QuoteItem[];
};
export type QuoteItem = {
  name: string;
  quantity: number;
  rate: number;
};
