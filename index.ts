#!/usr/bin/env node

import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {Decimal} from '@orderly.network/utils';
import {z} from "zod";

import {account, positions} from "@orderly.network/perp";
import {OrderSide} from "@orderly.network/types";

// Create an MCP server
const server = new McpServer({
    name: "orderly-perp-server",
    version: "1.0.0"
});

// Register the "IMR" tool
server.registerTool("IMR",
    {
        title: "IMR Calculator",
        description: "Calculate the IMR of the account.",
        inputSchema: {
            inputs: z.object(
                {
                    maxLeverage: z.number(),
                    baseIMR: z.number(),
                    IMR_Factor: z.number(),
                    positionNotional: z.number(),
                    ordersNotional: z.number(),
                    IMR_factor_power: z.number().optional()
                }
            ),

        }
    },
    async (input) => {
        console.log("Calculating IMR with inputs:", input);
        const result = account.IMR(input.inputs);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Register the "availableBalance" tool
server.registerTool("availableBalance",
    {
        title: "Available Balance Calculator",
        description: "Calculate the available balance of the account.",
        inputSchema: {
            inputs: z.object(
                {
                    USDCHolding: z.number(),
                    unsettlementPnL: z.number(),
                }
            )
        }
    },
    async (input) => {
        console.log("Calculating available balance with input:", input);
        const result = account.availableBalance(input.inputs);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Register the "currentLeverage" tool
server.registerTool("currentLeverage",
    {
        title: "Current Leverage Calculator",
        description: "Calculate the current leverage of the account.",
        inputSchema: {
            totalMarginRatio: z.number(),
        }
    },
    async ({totalMarginRatio}) => {
        console.log("Calculating current leverage with input:", totalMarginRatio);
        const result = account.currentLeverage(totalMarginRatio);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Register the "freeCollateral" tool
server.registerTool("freeCollateral",
    {
        title: "Free Collateral Calculator",
        description: "Calculate the available collateral of the account.",
        inputSchema: {
            inputs: z.object({
                totalCollateral: z.union([z.number(), z.string()]),
                totalInitialMarginWithOrders: z.number()
            })
        }
    },
    async (input) => {
        const {totalCollateral, totalInitialMarginWithOrders} = input.inputs;
        console.log("Calculating free collateral with inputs:", input.inputs);
        const result = account.freeCollateral({
            totalCollateral: new Decimal(totalCollateral),
            totalInitialMarginWithOrders
        });
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Register the "maxQty" tool
server.registerTool("maxQty",
    {
        title: "Max Qty Calculator",
        description: "Calculate the maximum quantity the account can open.",
        inputSchema: {
            side: z.nativeEnum(OrderSide),
            inputs: z.object(
                {
                    symbol: z.string(),
                    baseMaxQty: z.number(),
                    totalCollateral: z.number(),
                    maxLeverage: z.number(),
                    baseIMR: z.number(),
                    otherIMs: z.number(),
                    markPrice: z.number(),
                    positionQty: z.number(),
                    buyOrdersQty: z.number(),
                    sellOrdersQty: z.number(),
                    IMR_Factor: z.number(),
                    takerFeeRate: z.number()
                }
            ),
            options: z.object({
                dp: z.number()
            }).optional()
        }
    },
    async (input) => {
        console.log("Calculating maxQty with input:", input)
        const result = account.maxQty(input.side, input.inputs, input.options);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Register the "totalCollateral" tool
server.registerTool("totalCollateral",
    {
        title: "Total Collateral Calculator",
        description: "Calculate the total collateral of the account.",
        inputSchema: {
            inputs: z.object(
                {
                    USDCHolding: z.number(),
                    nonUSDCHolding: z.array(
                        z.object({
                            holding: z.number(),
                            markPrice: z.number(),
                            discount: z.number(),
                        })
                    ),
                    unsettlementPnL: z.number()
                }
            )
        }
    },
    async (input) => {
        console.log("Calculating total collateral with input:", input);
        const result = account.totalCollateral(input.inputs);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

const positionSchema = z.object(
    {
        account_id: z.string().optional(),
        symbol: z.string(),
        position_qty: z.number(),
        cost_position: z.number(),
        last_sum_unitary_funding: z.number(),
        pending_long_qty: z.number(),
        pending_short_qty: z.number(),
        settle_price: z.number(),
        average_open_price: z.number(),
        unrealized_pnl: z.number(),
        unrealized_pnl_index: z.number().optional(),
        unrealized_pnl_ROI: z.number(),
        unsettled_pnl: z.number(),
        unsettled_pnl_ROI: z.number(),
        unrealized_pnl_ROI_index: z.number().optional(),
        mark_price: z.number(),
        index_price: z.number().optional(),
        est_liq_price: z.number().nullable(),
        timestamp: z.number(),
        mmr: z.number(),
        imr: z.number(),
        IMR_withdraw_orders: z.number(),
        MMR_with_orders: z.number(),
        pnl_24_h: z.number(),
        fee_24_h: z.number(),
        fundingFee: z.number().optional(),
    }
);

const ordersSchema = z.object(
    {
        symbol: z.string(),
        status: z.string(),
        side: z.string(),
        order_id: z.number(),
        algo_order_id: z.number().optional(),
        user_id: z.number(),
        price: z.number().nullable(),
        type: z.string(),
        quantity: z.number(),
        amount: z.null(),
        visible: z.number(),
        executed: z.number(),
        total_fee: z.number(),
        fee_asset: z.string(),
        client_order_id: z.string().optional(),
        average_executed_price: z.number(),
        total_executed_quantity: z.number(),
        visible_quantity: z.number(),
        created_time: z.number(),
        updated_time: z.number(),
        reduce_only: z.boolean(),
        trigger_price: z.number().optional(),
        order_tag: z.string().optional(),
    }
);

// Register the "totalInitialMarginWithOrders" tool
server.registerTool("totalInitialMarginWithOrders",
    {
        title: "Total Initial Margin With Orders Calculator",
        description: "Calculate the total initial margin of the account with orders.",
        inputSchema: {
            inputs: z.object(
                {
                    positions: z.array(positionSchema),
                    orders: z.array(ordersSchema),
                    markPrices: z.record(z.number()),
                    symbolInfo: z.any().optional(),
                    IMR_Factors: z.record(z.number()),
                    maxLeverage: z.number(),
                }
            )
        }
    },
    async (input) => {
        const inputsWithDefaultSymbolInfo = {
            ...input.inputs,
            symbolInfo: input.inputs.symbolInfo ?? null,
        };
        console.log("Calculating total initial margin with orders with input:", inputsWithDefaultSymbolInfo)
        const result = account.totalInitialMarginWithOrders(inputsWithDefaultSymbolInfo);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Register the "totalMarginRatio" tool
server.registerTool("totalMarginRatio",
    {
        title: "Total Margin Ratio Calculator",
        description: "Calculate the total margin ratio of the account.",
        inputSchema: {
            inputs: z.object(
                {
                    totalCollateral: z.number(),
                    markPrices: z.record(z.number()),
                    positions: z.array(positionSchema),
                }
            ),
            db: z.number().optional()
        }
    },
    async (input) => {
        console.log("Calculating total margin ratio with input:", input);
        const result = account.totalMarginRatio(input.inputs, input.db);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Register the "totalUnrealizedROI" tool
server.registerTool("totalUnrealizedROI",
    {
        title: "Total Unrealized ROI Calculator",
        description: "Calculate the total unrealized return on investment of the account.",
        inputSchema: {
            inputs: z.object(
                {
                    totalUnrealizedPnL: z.number(),
                    totalValue: z.number()
                }
            )
        }
    },
    async (input) => {
        console.log("Calculating total unrealized ROI with input:", input);
        const result = account.totalUnrealizedROI(input.inputs);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Register the "totalValue" tool
server.registerTool("totalValue",
    {
        title: "Total Value Calculator",
        description: "Calculate the total value of the account.",
        inputSchema: {
            inputs: z.object(
                {
                    totalUnsettlementPnL: z.number(),
                    USDCHolding: z.number(),
                    nonUSDCHolding: z.array(
                        z.object(
                            {
                                holding: z.number(),
                                markPrice: z.number(),
                                discount: z.number(),
                            }
                        )
                    ),
                }
            )
        }
    },
    async (input) => {
        console.log("Calculating total value with input:", input);
        const result = account.totalValue(input.inputs);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Register the "MMR" tool
server.registerTool("MMR",
    {
        title: "MMR Calculator",
        description: "Calculate the MMR of the position.",
        inputSchema: {
            inputs: z.object(
                {
                    baseMMR: z.number(),
                    baseIMR: z.number(),
                    IMRFactor: z.number(),
                    positionNotional: z.number(),
                    IMR_factor_power: z.number(),
                }
            )
        }
    },
    async (input) => {
        console.log("Calculating MMR with input:", input);
        const result = positions.MMR(input.inputs);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Register the "liqPrice" tool
server.registerTool("liqPrice",
    {
        title: "Liquidation Price Calculator",
        description: "Calculate the liquidation price of the position.",
        inputSchema: {
            inputs: z.object(
                {
                    markPrice: z.number(),
                    totalCollateral: z.number(),
                    positionQty: z.number(),
                    positions: z.array(
                        z.object(
                            {
                                position_qty: z.number(),
                                mark_price: z.number(),
                                mmr: z.number()
                            }
                        )
                    ),
                    MMR: z.number()

                }
            )
        }
    },
    async (input) => {
        console.log("Calculating liquidation price with input:", input);
        const result = positions.liqPrice(input.inputs);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Register the "maintenanceMargin" tool
server.registerTool("maintenanceMargin",
    {
        title: "Maintenance Margin Calculator",
        description: "Calculate the maintenance margin of the position.",
        inputSchema: {
            inputs: z.object(
                {
                    positionQty: z.number(),
                    markPrice: z.number(),
                    MMR: z.number()
                }
            )
        }
    },
    async (input) => {
        console.log("Calculating maintenance margin with input:", input);
        const result = positions.maintenanceMargin(input.inputs);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Register the "totalNotional" tool
server.registerTool("totalNotional",
    {
        title: "Total Notional Calculator",
        description: "Calculate the total notional value of the position.",
        inputSchema: {
            positions: z.array(positionSchema)
        }
    },
    async (input) => {
        console.log("Calculating total notional with input:", input);
        const result = positions.totalNotional(input.positions);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Register the "unrealizedPnL" tool
server.registerTool("unrealizedPnL",
    {
        title: "Unrealized PnL Calculator",
        description: "Calculate the unrealized profit and loss of an individual position.",
        inputSchema: {
            inputs: z.object(
                {
                    markPrice: z.number(),
                    openPrice: z.number(),
                    qty: z.number(),
                }
            )
        }
    },
    async (input) => {
        console.log("Calculating unrealized PnL with input:", input);
        const result = positions.unrealizedPnL(input.inputs);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Register the "unrealizedPnLROI" tool
server.registerTool("unrealizedPnLROI",
    {
        title: "Unrealized PnL ROI Calculator",
        description: "Calculate the unrealized return on investment of an individual position.",
        inputSchema: {
            inputs: z.object(
                {
                    positionQty: z.number(),
                    openPrice: z.number(),
                    IMR: z.number(),
                    unrealizedPnL: z.number()
                }
            )
        }
    },
    async (input) => {
        console.log("Calculating unrealized PnL ROI with input:", input);
        const result = positions.unrealizedPnLROI(input.inputs);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Register the "totalUnrealizedPnL" tool
server.registerTool("totalUnrealizedPnL",
    {
        title: "Total Unrealized PnL Calculator",
        description: "Calculate the total unrealized profit and loss of the positions.",
        inputSchema: {
            positions: z.array(positionSchema)
        }
    },
    async (input) => {
        console.log("Calculating total unrealized PnL with input:", input);
        const result = positions.totalUnrealizedPnL(input.positions);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Register the "unsettlementPnL" tool
server.registerTool("unsettlementPnL",
    {
        title: "Unsettlement PnL Calculator",
        description: "Calculate the unsettlement profit and loss of an individual position.",
        inputSchema: {
            inputs: z.object(
                {
                    positionQty: z.number(),
                    markPrice: z.number(),
                    costPosition: z.number(),
                    sumUnitaryFunding: z.number(),
                    lastSumUnitaryFunding: z.number(),
                }
            )
        }
    },
    async (input) => {
        console.log("Calculating unsettled PnL with input:", input);
        const result = positions.unsettlementPnL(input.inputs);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

const extendedPositionSchema = positionSchema.extend({
    sum_unitary_funding: z.number()
});


// Register the "totalUnsettlementPnL" tool
server.registerTool("totalUnsettlementPnL",
    {
        title: "Total Unsettlement PnL Calculator",
        description: "Calculate the total unsettlement profit and loss of the positions.",
        inputSchema: {
            positions: z.array(extendedPositionSchema)
        }
    },
    async (input) => {
        console.log("Calculating total unsettled PnL with input:", input);
        const result = positions.totalUnsettlementPnL(input.positions);
        return {
            content: [{type: "text", text: `${result}`}]
        };
    }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);