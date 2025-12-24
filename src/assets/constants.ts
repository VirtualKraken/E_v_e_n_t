import { WeddingQuotation } from "../app/types/quotes";

export const sampleQuoteData:WeddingQuotation = {
  client_details: {
    client: 'Rajesh Uncle',
    function_date: 'Feb 6th 2026',
    venue: 'Gokulam Park, Guruvayoor',
  },
  items: [
    {
      sl_no: 1,
      description: 'Main Entrance Decor - Temple structure',
      quantity: '1',
      approx_rate_inr: 28000,
    },
    {
      sl_no: 2,
      description: 'NameBoard',
      quantity: '1',
      approx_rate_inr: 4500,
    },
    {
      sl_no: 3,
      description: 'Ganapathy Decor',
      quantity: '1',
      approx_rate_inr: 10000,
    },
    {
      sl_no: 4,
      description: 'Rails Fresh Flowering - hanging on glass',
      quantity: '1',
      approx_rate_inr: 3000,
    },
    {
      sl_no: 5,
      description:
        'Stage Decoration (Stage Backdrop with 4 pillar, 4 pillar Mandap, Stage Flower Decor - fresh only, Stage Flooring, Stage Skirting Work)',
      quantity: '1',
      approx_rate_inr: 770000,
    },
    {
      sl_no: 6,
      description: 'Entrance Decor - 2 Floral Hangings',
      quantity: '1',
      approx_rate_inr: 7000,
    },
    {
      sl_no: 7,
      description: 'Traditional arrangements on either sides of Entrance',
      quantity: '2',
      approx_rate_inr: 6000,
    },
    {
      sl_no: 8,
      description: 'Pathway Prop with carpet',
      quantity: '8',
      approx_rate_inr: 31000,
    },
    {
      sl_no: 9,
      description: 'Stage Face Lights',
      quantity: '1',
      approx_rate_inr: 4500,
    },
    {
      sl_no: 10,
      description: 'Pinspots',
      quantity: '60',
      approx_rate_inr: 15000,
    },
    {
      sl_no: 11,
      description: 'Pooja & Sweekaranam Items',
      quantity: '1',
      approx_rate_inr: 10000,
    },
    {
      sl_no: 12,
      description: 'KAthakali Artist Male & Female',
      quantity: '2',
      approx_rate_inr: 16000,
    },
    {
      sl_no: 13,
      description: 'Host Girls',
      quantity: '4',
      approx_rate_inr: 3000,
    },
    {
      sl_no: 14,
      description: 'Nadhaswaram',
      quantity: '1',
      approx_rate_inr: 0,
      note: 'Complimentary service',
    },
    {
      sl_no: 15,
      description: 'Rose Petal Confetti',
      quantity: '6',
      approx_rate_inr: 0,
    },
    {
      sl_no: 16,
      description:
        '5 piece instrument (Violin, Flute, Guitar, Keyboard, Percussion)',
      quantity: '5',
      approx_rate_inr: 45000,
    },
    {
      sl_no: 17,
      description: 'Garland & Bouquet',
      quantity: '2',
      approx_rate_inr: 6500,
    },
    {
      description: 'Service Charge(10%) + Travel',
      approx_rate_inr: 20500,
      note: 'Discounted',
    },
  ],
  financials: {
    sub_total: 980000,
    final_amount: 900000,
    currency: 'INR',
  },
};
