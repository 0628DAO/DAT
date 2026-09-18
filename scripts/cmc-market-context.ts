const CMC_API_URL = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest";
const REFERENCE_ASSET_IDS = ["1", "1027", "3408"];

export const DATCORE_BASE_CONTRACT =
  "0x6c83dd253F2F882B9884Fd1ac3A7754ED6405de5";

type CmcUsdQuote = {
  price?: number;
  volume_24h?: number;
  percent_change_24h?: number;
  market_cap?: number;
  last_updated?: string;
};

type CmcAsset = {
  id?: number;
  name?: string;
  symbol?: string;
  slug?: string;
  quote?: { USD?: CmcUsdQuote };
};

type CmcResponse = {
  status?: {
    timestamp?: string;
    error_code?: number;
    error_message?: string | null;
    credit_count?: number;
  };
  data?: Record<string, CmcAsset | CmcAsset[]>;
};

export type MarketAsset = {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  priceUsd: number | null;
  marketCapUsd: number | null;
  volume24hUsd: number | null;
  percentChange24h: number | null;
  lastUpdated: string | null;
};

function optionalNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parseMarketAssets(payload: CmcResponse): MarketAsset[] {
  if (payload.status?.error_code && payload.status.error_code !== 0) {
    throw new Error(
      `CoinMarketCap API error ${payload.status.error_code}: ${payload.status.error_message ?? "Unknown error"}`,
    );
  }

  if (!payload.data || typeof payload.data !== "object") {
    throw new Error("CoinMarketCap API response did not contain market data.");
  }

  return Object.values(payload.data)
    .flatMap((asset) => (Array.isArray(asset) ? asset : [asset]))
    .map((asset) => {
      if (
        typeof asset.id !== "number" ||
        typeof asset.name !== "string" ||
        typeof asset.symbol !== "string" ||
        typeof asset.slug !== "string"
      ) {
        throw new Error("CoinMarketCap API returned an invalid asset record.");
      }

      const usd = asset.quote?.USD;
      return {
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        slug: asset.slug,
        priceUsd: optionalNumber(usd?.price),
        marketCapUsd: optionalNumber(usd?.market_cap),
        volume24hUsd: optionalNumber(usd?.volume_24h),
        percentChange24h: optionalNumber(usd?.percent_change_24h),
        lastUpdated:
          typeof usd?.last_updated === "string" ? usd.last_updated : null,
      };
    })
    .sort((a, b) => a.id - b.id);
}

function requestedAssetIds(): string[] {
  const configured = process.env.CMC_MARKET_IDS?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const ids = configured?.length ? configured : REFERENCE_ASSET_IDS;
  const datcoreId = process.env.CMC_DATCORE_ID?.trim();

  if (datcoreId) ids.push(datcoreId);
  if (!ids.every((id) => /^\d+$/.test(id))) {
    throw new Error("CMC market IDs must be numeric.");
  }

  return [...new Set(ids)];
}

export async function fetchMarketContext(apiKey: string) {
  const url = new URL(CMC_API_URL);
  url.searchParams.set("id", requestedAssetIds().join(","));
  url.searchParams.set("convert", "USD");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-CMC_PRO_API_KEY": apiKey,
    },
    signal: AbortSignal.timeout(10_000),
  });

  const payload = (await response.json()) as CmcResponse;
  if (!response.ok) {
    throw new Error(
      `CoinMarketCap API request failed (${response.status}): ${payload.status?.error_message ?? response.statusText}`,
    );
  }

  return {
    source: "CoinMarketCap API",
    fetchedAt: payload.status?.timestamp ?? new Date().toISOString(),
    creditsUsed: payload.status?.credit_count ?? null,
    datcore: {
      network: "Base Mainnet",
      contract: DATCORE_BASE_CONTRACT,
      cmcId: process.env.CMC_DATCORE_ID?.trim() || null,
    },
    assets: parseMarketAssets(payload),
  };
}

async function main() {
  const apiKey = process.env.CMC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "CMC_API_KEY is required. Store it in your local environment; never commit it.",
    );
  }

  const context = await fetchMarketContext(apiKey);
  process.stdout.write(`${JSON.stringify(context, null, 2)}\n`);
}

if (process.argv[1]?.endsWith("cmc-market-context.ts")) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`CMC market context failed: ${message}\n`);
    process.exitCode = 1;
  });
}
