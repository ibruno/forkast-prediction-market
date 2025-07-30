// Market Types
export interface Market {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: MarketCategory;
  probability: number; // 0-100
  volume: number; // in USDC
  endDate: Date;
  isResolved: boolean;
  isTrending?: boolean;
  outcomes: MarketOutcome[];
  creator: string;
  creatorAvatar?: string; // URL for creator avatar
  tags: string[];
  show_market_icons?: boolean; // Control if market icons should be shown in lists
  rules?: string; // Rules for market resolution
  oracle?: string; // Oracle address for resolution
}

export interface MarketOutcome {
  id: string;
  name: string;
  probability: number;
  price: number; // in USDC cents (0.01 to 0.99)
  volume: number;
  isYes?: boolean; // for binary markets
  avatar?: string; // URL for outcome avatar/image
}

export type MarketCategory = string; // Dynamic categories from database

// User Types
export interface User {
  address: string;
  portfolio: number; // Total portfolio value in USDC
  cash: number; // Available cash in USDC
  isConnected: boolean;
}

// UI Types
export interface FilterPill {
  id: string;
  label: string;
  category: MarketCategory;
  isActive: boolean;
}

// Trading Types
export interface TradeAction {
  marketId: string;
  outcomeId: string;
  amount: number; // in USDC
  type: "buy" | "sell";
  expectedShares: number;
}
