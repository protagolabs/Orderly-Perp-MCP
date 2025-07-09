# Orderly-Perp-MCP

A library of calculation formulas related to Orderly futures trading.  
This library is designed to be purely functional, with no context dependencies. Simply call the appropriate functions directly for seamless integration.


## support tools

* account
    * IMR - Calculate the IMR of the account.
    * availableBalance - Calculate the available balance of the account.
    * currentLeverage - Calculate the current leverage of the account.
    * freeCollateral - Calculate the available collateral of the account.
    * maxQty - Calculate the maximum quantity the account can open.
    * totalCollateral - Calculate the total collateral of the account.
    * totalInitialMarginWithOrders - Calculate the total initial margin of the account with orders.
    * totalMarginRatio - Calculate the total margin ratio of the account.
    * totalUnrealizedROI - Calculate the total unrealized return on investment of the account.
    * totalValue - Calculate the total value of the account.


* positions
    * MMR - Calculate the MMR of the position.
    * liqPrice - Calculate the liquidation price of the position.
    * maintenanceMargin - Calculate the maintenance margin of the position.
    * totalNotional - Calculate the total notional value of the position.
    * unrealizedPnL - Calculate the unrealized profit and loss of an individual position.
    * unrealizedPnLROI - Calculate the unrealized return on investment of an individual position.
    * totalUnrealizedPnL - Calculate the total unrealized profit and loss of the positions.
    * unsettlementPnL - Calculate the unsettlement profit and loss of an individual position.
    * totalUnsettlementPnL - Calculate the total unsettlement profit and loss of the positions.


## build

build
```
git clone https://github.com/protagolabs/Orderly-Perp-MCP
cd Orderly-Perp-MCP
npm install
npm run build
 ```

## useage
```json
{
  "mcpServers": {
    "sugar-mcp": {
      "env": {
      },
      "command": "node",
      "args": [
        "/path/to/Orderly-Perp-MCP/dist/index.js"
      ]
    }
  }
}
```

```json
{
  "mcpServers": {
    "sugar-mcp": {
      "env": {
      },
      "command": "npx",
      "args": [
        "-y",
        "orderly-perp-mcp"
      ]
    }
  }
}
```
