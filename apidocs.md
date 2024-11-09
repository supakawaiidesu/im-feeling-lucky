# Trading API Documentation

This document describes the API endpoints for our trading platform.

## Base URL

All API requests should be made to: `https://unidexv4-api-production.up.railway.app/`

## Endpoints

### 1. Get Global Info

Retrieves global market information for a trading pair.

- **URL**: `/api/globalinfo`
- **Method**: `GET`
- **Query Parameters**: 
  - `assetId`: Asset ID (required, e.g., 1 for BTC/USD)
  - `address`: Ethereum address (optional, defaults to 0x0000000000000000000000000000000000000000)
- **Response**: JSON object containing:
  - `fundingRate`: Current funding rate (can be positive or negative)
  - `borrowRateForLong`: Borrow rate for long positions
  - `borrowRateForShort`: Borrow rate for short positions
  - `longOpenInterest`: Total long open interest
  - `shortOpenInterest`: Total short open interest
  - `maxLongOpenInterest`: Maximum allowed long open interest
  - `maxShortOpenInterest`: Maximum allowed short open interest
  - `longTradingFee`: Trading fee for long positions
  - `shortTradingFee`: Trading fee for short positions

#### Sample Response:

```json
{
  "fundingRate": 0.0044877381,
  "borrowRateForLong": 0.0050,
  "borrowRateForShort": 0.0000,
  "longOpenInterest": 111841.688373,
  "shortOpenInterest": 129096.000000,
  "maxLongOpenInterest": 699096.000000,
  "maxShortOpenInterest": 699096.000000,
  "longTradingFee": 0.0005,
  "shortTradingFee": 0.0005
}
```

#### Value Interpretations:

- `fundingRate`: Expressed as percentages so 0.0005 means 0.0005%, Can be positive or negative.
- `borrowRateForLong` and `borrowRateForShort`: Expressed as percentages so 0.0005 means 0.0005%
- `longOpenInterest`, `shortOpenInterest`, `maxLongOpenInterest`, `maxShortOpenInterest`: Expressed in the base currency (e.g., USD).
- `longTradingFee` and `shortTradingFee`: Expressed as percentages so 0.0005 means 0.0005%

#### Sample cURL Command:

```bash
curl "https://unidexv4-api-production.up.railway.app/api/globalinfo?assetId=1&address=0x1234567890123456789012345678901234567890"
```

Or without specifying an address:

```bash
curl "https://unidexv4-api-production.up.railway.app/api/globalinfo?assetId=1"
```

This will retrieve global information for asset ID 1 (e.g., BTC/USD). If an address is provided, it will be used in the query; otherwise, the zero address will be used.

Note: The frontend should handle the conversion of these numerical values to appropriate display formats (e.g., adding percentage signs, formatting large numbers, etc.).

### 2. Get User Alive Positions

Retrieves all active positions for a specific user.

- **URL**: `/api/positions`
- **Method**: `GET`
- **Query Parameters**: 
  - `address`: Ethereum address of the user (required)
- **Response**: JSON object containing:
  - `posIds`: Array of position IDs
  - `positions`: Array of position objects
  - `orders`: Array of order objects
  - `triggers`: Array of trigger objects
  - `paidFees`: Array of paid fees objects
  - `accruedFees`: Array of accrued fees objects

### 3. Create New Position Order

Creates a new position order.

- **URL**: `/api/newposition`
- **Method**: `POST`
- **Headers**: 
  - `Content-Type: application/json`
- **Body**: JSON object containing:
  - `pair`: Trading pair ID (number between 1 and 100)
  - `isLong`: Boolean indicating long (true) or short (false) position
  - `orderType`: String, one of "market", "limit", "stop-market", "stop-limit"
  - `maxAcceptablePrice`: Maximum acceptable price for market orders (in base currency)
  - `slippagePercent`: Allowed slippage percentage for market orders (in basis points, e.g., 100 = 1%)
  - `limitPrice`: Limit price for limit and stop-limit orders (in base currency)
  - `stopMarketPrice`: Stop price for stop-market and stop-limit orders (in base currency)
  - `margin`: Margin amount (in base currency)
  - `size`: Position size (in base currency)
  - `refer`: (Optional) Referral address, defaults to zero address
  - `takeProfit`: (Optional) Take profit price (in base currency)
  - `stopLoss`: (Optional) Stop loss price (in base currency)
  - `takeProfitClosePercent`: (Required if takeProfit is set) Percentage to close at take profit (in basis points, e.g., 10000 = 100%)
  - `stopLossClosePercent`: (Required if stopLoss is set) Percentage to close at stop loss (in basis points, e.g., 10000 = 100%)
  - `userAddress`: (Required) Ethereum address of the user creating the position

#### Required Parameters by Order Type

1. Market Orders:
   - `maxAcceptablePrice`
   - `slippagePercent`
   - `margin`
   - `size`

2. Limit Orders:
   - `limitPrice`
   - `margin`
   - `size`

3. Stop-Market Orders:
   - `stopMarketPrice`
   - `margin`
   - `size`

4. Stop-Limit Orders:
   - `limitPrice`
   - `stopMarketPrice`
   - `margin`
   - `size`

- **Response**: JSON object containing:
  - `calldata`: Encoded function call data
  - `vaultAddress`: Address of the vault contract
  - `insufficientBalance`: Boolean indicating if user has insufficient balance
  - `requiredGasFee`: Required gas fee for the transaction (as string)
  - `error`: Error message if balance is insufficient (optional)

#### Sample Request Body:

```json
{
  "pair": 1,
  "isLong": true,
  "orderType": "market",
  "maxAcceptablePrice": 67000,
  "slippagePercent": 100,
  "margin": 20,
  "size": 30,
  "takeProfit": 69000,
  "stopLoss": 61000,
  "takeProfitClosePercent": 10000,
  "stopLossClosePercent": 10000,
  "userAddress": "0x1234567890123456789012345678901234567890"
}
```

Sample cURL Command:
```bash
curl -X POST https://unidexv4-api-production.up.railway.app/api/newposition \
     -H "Content-Type: application/json" \
     -d '{
  "pair": 1,
  "isLong": true,
  "orderType": "market",
  "maxAcceptablePrice": 67000,
  "slippagePercent": 100,
  "margin": 20,
  "size": 30,
  "takeProfit": 69000,
  "stopLoss": 61000,
  "takeProfitClosePercent": 10000,
  "stopLossClosePercent": 10000,
  "userAddress": "0x1234567890123456789012345678901234567890"
}'
```

This will create a new long market order for pair 1 (e.g., BTC/USD), with a size of 30, using 20 units of margin. It sets a take profit at 69000 and a stop loss at 61000, both set to close 100% of the position when triggered.

#### Error Responses

The endpoint will return a 400 status code with an error message for:
- Invalid pair value (must be between 1 and 100)
- Invalid or missing isLong boolean value
- Invalid orderType value
- Missing required parameters for the specified order type
- Missing close percentages when take profit or stop loss is specified

A 500 status code will be returned for server-side errors, with the error message in the response.

### 4. Get User Balances

Retrieves the ETH and margin wallet balances for a specific user.

- **URL**: `/api/userbalances`
- **Method**: `GET`
- **Query Parameters**: 
  - `address`: Ethereum address of the user (required)
- **Response**: JSON object containing:
  - `ethBalance`: User's ETH balance in Ether units (as a string)
  - `musdBalance`: User's mUSD balance

#### Sample Response:

```json
{
  "ethBalance": "1.234567890123456789",
  "musdBalance": 5000.123456
}
```

#### Value Interpretations:

- `ethBalance`: Expressed in Ether units as a string (converted from Wei)
- `marginBalance`: Expressed in mUSD units as a number (converted from the contract's raw value)

#### Sample cURL Command:

```bash
curl "https://unidexv4-api-production.up.railway.app/api/userbalances?address=0x1234567890123456789012345678901234567890"
```

This will retrieve the ETH and mUSD (margin wallet) balances for the specified address.

Note: The frontend should handle any necessary parsing and formatting of these values for display purposes. The `ethBalance` is returned as a string to preserve its full precision.

### 5. Close Position

Closes an existing position or adds take profit/stop loss orders.

- **URL**: `/api/closeposition`
- **Method**: `POST`
- **Headers**: 
  - `Content-Type: application/json`
- **Body**: JSON object containing:
  - `positionId`: ID of the position to close
  - `sizeDelta`: (Optional) Amount to decrease the position by
  - `allowedPrice`: (Optional) Allowed price for closing
  - `takeProfit`: (Optional) Take profit price
  - `stopLoss`: (Optional) Stop loss price
  - `takeProfitClosePercent`: (Required if takeProfit is set) Percentage to close at take profit
  - `stopLossClosePercent`: (Required if stopLoss is set) Percentage to close at stop loss
- **Response**: JSON object containing:
  - `calldata`: Encoded function call data
  - `vaultAddress`: Address of the vault contract
  - `requiredGasFee`: Required gas fee for the transaction

### 6. USD.m Operations

Handles USD.m operations like staking and unstaking.

- **URL**: `/api/usdm`
- **Method**: `POST`
- **Headers**: 
  - `Content-Type: application/json`
- **Body**: JSON object containing:
  - `type`: Operation type ('stake' or 'unstake')
  - `tokenAddress`: Address of the token to stake or unstake
  - `amount`: Amount to stake or unstake
- **Response**: JSON object containing:
  - `calldata`: Encoded function call data
  - `vaultAddress`: Address of the vault contract

### 7. Deposit Operations

There are two ways to deposit funds into your margin wallet:
1. Direct deposit (for tokens on Arbitrum)
2. Cross-chain deposit (for tokens on other chains)

## Direct Deposit/Withdrawal on Arbitrum

For tokens already on Arbitrum, use the wallet operations endpoint for direct deposits and withdrawals.

### Wallet Operations Endpoint

- **URL**: `/api/wallet`
- **Method**: `POST`
- **Headers**: 
  - `Content-Type: application/json`
- **Body**: JSON object containing:
  - `type`: Operation type (required) - either "deposit" or "withdraw"
  - `tokenAddress`: Address of the token (required)
  - `amount`: Amount to deposit or withdraw (required)

#### Supported Tokens on Arbitrum
- USDC: `0xaf88d065e77c8cc2239327c5edb3a432268e5831` (6 decimals)

#### Response
```json
{
  "calldata": "0x...",  // Encoded function call data
  "vaultAddress": "0x..."  // Address of the vault contract
}
```

#### Sample Requests

1. **Deposit USDC**:
```bash
curl -X POST https://unidexv4-api-production.up.railway.app/api/wallet \
     -H "Content-Type: application/json" \
     -d '{
  "type": "deposit",
  "tokenAddress": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
  "amount": "1000.00"
}'
```

2. **Withdraw USDC**:
```bash
curl -X POST https://unidexv4-api-production.up.railway.app/api/wallet \
     -H "Content-Type: application/json" \
     -d '{
  "type": "withdraw",
  "tokenAddress": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
  "amount": "500.00"
}'
```

#### Error Responses
- **400 Bad Request**:
  - Missing type, tokenAddress, or amount
  - Invalid operation type
- **500 Internal Server Error**:
  - Transaction encoding errors
  - Other internal errors

## Cross-Chain Deposit

For tokens on other chains, use the cross-chain deposit endpoint to transfer and deposit in one transaction.

### Cross-Chain Deposit Endpoint

- **URL**: `/api/crosschaindeposit`
- **Method**: `POST`
- **Headers**: 
  - `Content-Type: application/json`
- **Body**: JSON object containing:
  - `userAddress`: Ethereum address of the user (required)
  - `fromChainId`: Chain ID of the source chain (required)
  - `amount`: Amount to deposit in token units (required)
  - `tokenAddress`: Address of the token to deposit (required)

[Supported chains and tokens listed in previous documentation...]

#### Usage Flow Comparison

1. **Direct Arbitrum Deposit**:
   ```mermaid
   graph LR
   A[User has USDC on Arbitrum] --> B[Call wallet endpoint]
   B --> C[Execute deposit transaction]
   C --> D[Funds in margin wallet]
   ```

2. **Cross-Chain Deposit**:
   ```mermaid
   graph LR
   A[User has tokens on other chain] --> B[Call crosschaindeposit endpoint]
   B --> C{Needs approval?}
   C -->|Yes| D[Approve token]
   D --> E[Call endpoint again]
   C -->|No| E
   E --> F[Execute cross-chain transfer]
   F --> G[Automatic deposit to margin wallet]
   ```

#### Implementation Notes

1. **Direct Deposits (Arbitrum)**:
   - Faster and cheaper as it's a single transaction
   - No bridging or cross-chain operations
   - Uses `depositSelf` function for deposits
   - Uses `withdraw` function for withdrawals
   - Amount precision handled based on token decimals (6 for USDC)

2. **Cross-Chain Deposits**:
   - Handles approval, bridging, and deposit in one flow
   - Automatically converts to Arbitrum USDC
   - Uses Squid Router for cross-chain transfers
   - Includes automatic deposit into the vault
   - Higher fees due to cross-chain operation

#### Best Practices

1. For tokens already on Arbitrum:
   - Always use the `/api/wallet` endpoint
   - Check token approval before deposit
   - Handle decimal precision correctly (6 decimals for USDC)

2. For tokens on other chains:
   - Use the `/api/crosschaindeposit` endpoint
   - Be prepared to handle two-step approval process
   - Account for longer processing time due to cross-chain operations

### 7. Get All Markets

Retrieves comprehensive market data for all trading pairs, including prices, interest rates, and market statistics.

- **URL**: `/api/markets`
- **Method**: `GET`
- **Query Parameters**: 
  - `address`: Ethereum address (optional, defaults to 0x0000000000000000000000000000000000000000)
- **Response**: JSON object containing:
  - `success`: Boolean indicating request success
  - `timestamp`: Current Unix timestamp
  - `marketsCount`: Total number of markets
  - `markets`: Array of market objects with the following properties:
    - `assetId`: Trading pair identifier
    - `pair`: Trading pair name (e.g., "BTC/USD")
    - `price`: Current market price
    - `fundingRate`: Current funding rate
    - `borrowRateForLong`: Borrow rate for long positions
    - `borrowRateForShort`: Borrow rate for short positions
    - `longOpenInterest`: Total long positions
    - `shortOpenInterest`: Total short positions
    - `maxLongOpenInterest`: Maximum allowed long open interest
    - `maxShortOpenInterest`: Maximum allowed short open interest
    - `longTradingFee`: Trading fee for long positions
    - `shortTradingFee`: Trading fee for short positions
    - `utilization`: Current market utilization percentage
    - `longShortRatio`: Distribution of positions
      - `longPercentage`: Percentage of positions that are long
      - `shortPercentage`: Percentage of positions that are short
    - `availableLiquidity`: Remaining capacity for new positions
      - `long`: Available liquidity for long positions
      - `short`: Available liquidity for short positions

#### Value Interpretations:
- All rates (funding, borrow, trading fees) are expressed as decimals (e.g., 0.0005 = 0.05%)
- Utilization and ratio percentages are expressed as numbers (e.g., 12.55 = 12.55%)
- All monetary values (open interest, liquidity) are in USD
- Prices are formatted to maintain full precision from price feed

#### Sample Response:

```json
{
  "success": true,
  "timestamp": 1699454789123,
  "marketsCount": 57,
  "markets": [
    {
      "assetId": "1",
      "pair": "BTC/USD",
      "price": "75964.03651450",
      "fundingRate": 0.0001234,
      "borrowRateForLong": 0.0050,
      "borrowRateForShort": 0.0025,
      "longOpenInterest": 125.50,
      "shortOpenInterest": 100.20,
      "maxLongOpenInterest": 1000.00,
      "maxShortOpenInterest": 1000.00,
      "longTradingFee": 0.0005,
      "shortTradingFee": 0.0005,
      "utilization": 12.55,
      "longShortRatio": {
        "longPercentage": 55.61,
        "shortPercentage": 44.39
      },
      "availableLiquidity": {
        "long": 874.50,
        "short": 899.80
      }
    }
    // Additional markets...
  ]
}
```

#### Sample cURL Command:

```bash
curl "https://unidexv4-api-production.up.railway.app/api/markets"
```

Or with a specific address:

```bash
curl "https://unidexv4-api-production.up.railway.app/api/markets?address=0x1234567890123456789012345678901234567890"
```

#### Error Response:

```json
{
  "success": false,
  "error": "Error message description"
}
```

#### Notes:
- The endpoint uses Pyth Network price feeds for accurate real-time pricing
- Market utilization shows the higher percentage between long and short utilization
- Long/Short ratio defaults to 50/50 when no positions exist
- All numerical values are formatted to 2 decimal places for consistency
- Available liquidity is calculated as the difference between maximum and current open interest

## 8. Referrals API

The Referrals API provides endpoints for managing referral codes in the UniDex platform.

### Base URL

```
POST /api/referrals
```

### Endpoints

#### 1. Get Code Info

Retrieves information about a referral code.

**Request Body:**

```json
{
  "action": "getCodeInfo",
  "code": "MYREFERRALCODE"
}
```

**Response:**

```json
{
  "code": "MYREFERRALCODE",
  "bytes32Code": "0x4d59524546455252414c434f44450000000000000000000000000000000000",
  "owner": "0x1234567890123456789012345678901234567890",
  "isClaimed": true
}
```

If the code is not claimed, the response will look like this:

```json
{
  "code": "MYREFERRALCODE",
  "bytes32Code": "0x4d59524546455252414c434f44450000000000000000000000000000000000",
  "owner": "Code not claimed",
  "isClaimed": false
}
```

#### 2. Claim Code

Generates the calldata required to claim a referral code.

**Request Body:**

```json
{
  "action": "claimCode",
  "code": "MYREFERRALCODE",
  "userAddress": "0x1234567890123456789012345678901234567890"
}
```

**Response:**

```json
{
  "calldata": "0x4d59524546455252414c434f4445000000000000000000000000000000000000000000000000000000000000",
  "contractAddress": "0xe3ca135782e4a17aFb31a63ee3b15351C891A1A2",
  "code": "MYREFERRALCODE",
  "bytes32Code": "0x4d59524546455252414c434f44450000000000000000000000000000000000"
}
```

### Error Responses

The API will return appropriate error messages for various scenarios:

- If the action is missing:
  ```json
  { "error": "Missing action" }
  ```

- If the code is missing for `getCodeInfo`:
  ```json
  { "error": "Missing code" }
  ```

- If the code or userAddress is missing for `claimCode`:
  ```json
  { "error": "Missing code or userAddress" }
  ```

- If the userAddress is invalid:
  ```json
  { "error": "Invalid userAddress" }
  ```

- If the referral code is already claimed:
  ```json
  { "error": "Referral code is already claimed" }
  ```

- For any other errors, a 500 status code will be returned with the error message.

### Notes

- The `bytes32Code` is a 32-byte representation of the referral code, which is used in the smart contract.
- The `claimCode` action checks if the code is already claimed before generating the calldata.
- The generated calldata from the `claimCode` action should be used to submit a transaction to the smart contract to actually claim the code on-chain.
