// Map UnidexV4 pairs to gTrade pair indices
export const GTRADE_PAIR_MAPPING: { [key: string]: number } = {
  'BTC/USD': 0,    // UnidexV4 pair 1 -> gTrade pair 0
  'ETH/USD': 1,    // UnidexV4 pair 2 -> gTrade pair 1
  'FTM/USD': 53,   // UnidexV4 pair 3 -> gTrade pair 53
  'SOL/USD': 33,   // UnidexV4 pair 4 -> gTrade pair 33
  'DOGE/USD': 3,   // UnidexV4 pair 5 -> gTrade pair 3
  'AVAX/USD': 102, // UnidexV4 pair 6 -> gTrade pair 102
  'BNB/USD': 47,   // UnidexV4 pair 7 -> gTrade pair 47
  'ADA/USD': 5,    // UnidexV4 pair 8 -> gTrade pair 5
  'LINK/USD': 2,   // UnidexV4 pair 9 -> gTrade pair 2
  'ATOM/USD': 103, // UnidexV4 pair 10 -> gTrade pair 103
  'NEAR/USD': 104, // UnidexV4 pair 11 -> gTrade pair 104
  'ARB/USD': 109,  // UnidexV4 pair 12 -> gTrade pair 109
  'OP/USD': 141,   // UnidexV4 pair 13 -> gTrade pair 141
  'LTC/USD': 13,   // UnidexV4 pair 14 -> gTrade pair 13
  'GMX/USD': 136,  // UnidexV4 pair 15 -> gTrade pair 136
  'EUR/USD': 21,   // UnidexV4 pair 16 -> gTrade pair 21
  'GBP/USD': 23,   // UnidexV4 pair 17 -> gTrade pair 23
  'INJ/USD': 129,  // UnidexV4 pair 18 -> gTrade pair 129
  'TIA/USD': 144,  // UnidexV4 pair 19 -> gTrade pair 144
  'AERO/USD': 286, // UnidexV4 pair 20 -> gTrade pair 286
  'MERL/USD': 226, // UnidexV4 pair 21 -> gTrade pair 226
  'SAFE/USD': 227, // UnidexV4 pair 22 -> gTrade pair 227
  'OMNI/USD': 224, // UnidexV4 pair 23 -> gTrade pair 224
  'REZ/USD': 231,  // UnidexV4 pair 24 -> gTrade pair 231
  'ETHFI/USD': 212,// UnidexV4 pair 25 -> gTrade pair 212
  'BOME/USD': 211, // UnidexV4 pair 26 -> gTrade pair 211
  'ORDI/USD': 150, // UnidexV4 pair 27 -> gTrade pair 150
  'DYM/USD': 201,  // UnidexV4 pair 28 -> gTrade pair 201
  'TAO/USD': 223,  // UnidexV4 pair 29 -> gTrade pair 223
  'WLD/USD': 171,  // UnidexV4 pair 30 -> gTrade pair 171
  'POPCAT/USD': 245,// UnidexV4 pair 31 -> gTrade pair 245
  'ZRO/USD': 236,  // UnidexV4 pair 32 -> gTrade pair 236
  'RUNE/USD': 130, // UnidexV4 pair 33 -> gTrade pair 130
  'MEW/USD': 251,  // UnidexV4 pair 34 -> gTrade pair 251
  'BEAM/USD': 157, // UnidexV4 pair 35 -> gTrade pair 157
  'STRK/USD': 200, // UnidexV4 pair 36 -> gTrade pair 200
  'AAVE/USD': 7,   // UnidexV4 pair 37 -> gTrade pair 7
  'XRP/USD': 19,   // UnidexV4 pair 38 -> gTrade pair 19
  'TON/USD': 107,  // UnidexV4 pair 39 -> gTrade pair 107
  'NOT/USD': 232,  // UnidexV4 pair 40 -> gTrade pair 232
  'ALICE/USD': 263,// UnidexV4 pair 42 -> gTrade pair 263
  'APE/USD': 55,   // UnidexV4 pair 43 -> gTrade pair 55
  'APT/USD': 138,  // UnidexV4 pair 44 -> gTrade pair 138
  'AVAIL/USD': 255,// UnidexV4 pair 45 -> gTrade pair 255
  'DEGEN/USD': 252,// UnidexV4 pair 46 -> gTrade pair 252
  'RDNT/USD': 270, // UnidexV4 pair 47 -> gTrade pair 270
  'SUI/USD': 153,  // UnidexV4 pair 48 -> gTrade pair 153
  'PEPE/USD': 134, // UnidexV4 pair 49 -> gTrade pair 134
  'EIGEN/USD': 282,// UnidexV4 pair 50 -> gTrade pair 282
};

// Reverse mapping function to get UnidexV4 pair from gTrade index
export function getUnidexPairFromGTradePair(gTradePairIndex: number): string | undefined {
  return Object.entries(GTRADE_PAIR_MAPPING).find(
    ([_, index]) => index === gTradePairIndex
  )?.[0];
}