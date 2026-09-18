import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseMarketAssets } from "../scripts/cmc-market-context.js";

describe("CMC market context", function () {
  it("normalizes a CoinMarketCap quote response for agent consumption", function () {
    const assets = parseMarketAssets({
      status: { error_code: 0 },
      data: {
        "1": {
          id: 1,
          name: "Bitcoin",
          symbol: "BTC",
          slug: "bitcoin",
          quote: {
            USD: {
              price: 100_000,
              volume_24h: 50_000_000_000,
              percent_change_24h: 2.5,
              market_cap: 2_000_000_000_000,
              last_updated: "2026-09-19T00:00:00.000Z",
            },
          },
        },
      },
    });

    assert.deepEqual(assets, [
      {
        id: 1,
        name: "Bitcoin",
        symbol: "BTC",
        slug: "bitcoin",
        priceUsd: 100_000,
        marketCapUsd: 2_000_000_000_000,
        volume24hUsd: 50_000_000_000,
        percentChange24h: 2.5,
        lastUpdated: "2026-09-19T00:00:00.000Z",
      },
    ]);
  });

  it("rejects API errors instead of returning incomplete context", function () {
    assert.throws(
      () =>
        parseMarketAssets({
          status: { error_code: 1002, error_message: "API key missing" },
        }),
      /API key missing/,
    );
  });
});
