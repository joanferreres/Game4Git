import { useEffect, useMemo, useState } from "react";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

type GeoGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] }
  | { type: string; coordinates?: unknown };

type GeoFeature = {
  id?: string | number;
  type: "Feature";
  properties?: { name?: string } | null;
  geometry: GeoGeometry;
};

type GeoFeatureCollection = {
  type: "FeatureCollection";
  features: GeoFeature[];
};

/** ISO 3166-1 numeric (world-atlas) → alpha-2 for major markets. Unmapped stay gray. */
const NUMERIC_TO_ISO: Record<string, string> = {
  "4": "AF", "8": "AL", "12": "DZ", "20": "AD", "24": "AO", "32": "AR", "36": "AU",
  "40": "AT", "48": "BH", "50": "BD", "56": "BE", "68": "BO", "76": "BR", "100": "BG",
  "112": "BY", "124": "CA", "152": "CL", "156": "CN", "158": "TW", "170": "CO",
  "188": "CR", "191": "HR", "192": "CU", "196": "CY", "203": "CZ", "208": "DK",
  "214": "DO", "218": "EC", "222": "SV", "233": "EE", "246": "FI", "250": "FR",
  "276": "DE", "300": "GR", "320": "GT", "340": "HN", "344": "HK", "348": "HU",
  "352": "IS", "356": "IN", "360": "ID", "364": "IR", "368": "IQ", "372": "IE",
  "376": "IL", "380": "IT", "392": "JP", "400": "JO", "410": "KR", "414": "KW",
  "422": "LB", "428": "LV", "440": "LT", "442": "LU", "458": "MY", "484": "MX",
  "504": "MA", "528": "NL", "554": "NZ", "558": "NI", "566": "NG", "578": "NO",
  "586": "PK", "591": "PA", "604": "PE", "608": "PH", "616": "PL", "620": "PT",
  "630": "PR", "634": "QA", "642": "RO", "643": "RU", "682": "SA", "688": "RS",
  "702": "SG", "703": "SK", "704": "VN", "705": "SI", "710": "ZA", "724": "ES",
  "752": "SE", "756": "CH", "764": "TH", "784": "AE", "788": "TN", "792": "TR",
  "804": "UA", "818": "EG", "826": "GB", "840": "US", "858": "UY", "862": "VE",
};

type CountryRow = { country: string; count: number };

type CountryChoroplethProps = {
  countries: CountryRow[];
  selected?: string;
  onSelectCountry: (code: string) => void;
  emptyLabel: string;
  unknownLabel: string;
  countryNames: Record<string, string>;
};

type Ring = number[][];

function project(lon: number, lat: number, width: number, height: number): [number, number] {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

function ringToPath(ring: Ring, width: number, height: number): string {
  if (!ring.length) return "";
  return (
    ring
      .map((coord, index) => {
        const lon = coord[0] ?? 0;
        const lat = coord[1] ?? 0;
        const [x, y] = project(lon, lat, width, height);
        return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ") + " Z"
  );
}

function geometryToPath(geometry: GeoGeometry, width: number, height: number): string {
  if (geometry.type === "Polygon" && Array.isArray(geometry.coordinates)) {
    return geometry.coordinates.map((ring) => ringToPath(ring as Ring, width, height)).join(" ");
  }
  if (geometry.type === "MultiPolygon" && Array.isArray(geometry.coordinates)) {
    return (geometry.coordinates as number[][][][])
      .map((poly) => poly.map((ring) => ringToPath(ring as Ring, width, height)).join(" "))
      .join(" ");
  }
  return "";
}

function fillForCount(count: number, max: number): string {
  if (count <= 0 || max <= 0) return "#f1f5f9";
  const t = Math.min(1, Math.sqrt(count / max));
  const r = Math.round(241 - t * (241 - 240));
  const g = Math.round(245 - t * (245 - 81));
  const b = Math.round(249 - t * (249 - 51));
  return `rgb(${r},${g},${b})`;
}

const WIDTH = 960;
const HEIGHT = 480;

export function CountryChoropleth({
  countries,
  selected,
  onSelectCountry,
  emptyLabel,
  unknownLabel,
  countryNames,
}: CountryChoroplethProps) {
  const [features, setFeatures] = useState<GeoFeatureCollection | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("world-atlas/countries-110m.json")
      .then((mod) => {
        if (cancelled) return;
        const topology = (mod.default || mod) as Topology<{
          countries: GeometryCollection;
        }>;
        const collection = feature(
          topology,
          topology.objects.countries
        ) as unknown as GeoFeatureCollection;
        setFeatures(collection);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const countByIso = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of countries) {
      if (!row.country || row.country === "XX") continue;
      map.set(row.country.toUpperCase(), Number(row.count) || 0);
    }
    return map;
  }, [countries]);

  const maxCount = useMemo(() => {
    let max = 0;
    for (const value of countByIso.values()) {
      if (value > max) max = value;
    }
    return max;
  }, [countByIso]);

  const unknownCount = countries.find((c) => c.country === "XX")?.count || 0;
  const ranked = countries.filter((c) => c.country !== "XX").slice(0, 10);

  if (loadError) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  if (!features) {
    return <div className="h-48 animate-pulse rounded-md bg-slate-100" />;
  }

  const hasAny = maxCount > 0 || unknownCount > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
      <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50/50">
        {!hasAny ? (
          <div className="flex h-48 items-center justify-center text-sm text-slate-500">
            {emptyLabel}
          </div>
        ) : (
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label="Country map">
            {features.features.map((feat, index) => {
              const numericId = feat.id != null ? String(feat.id) : "";
              const iso = NUMERIC_TO_ISO[numericId];
              const count = iso ? countByIso.get(iso) || 0 : 0;
              const isSelected = iso && selected === iso;
              const path = geometryToPath(feat.geometry, WIDTH, HEIGHT);
              if (!path) return null;
              return (
                <path
                  key={numericId || index}
                  d={path}
                  fill={iso ? fillForCount(count, maxCount) : "#e2e8f0"}
                  stroke={isSelected ? "#f05133" : "#cbd5e1"}
                  strokeWidth={isSelected ? 1.4 : 0.4}
                  className={iso ? "cursor-pointer transition-opacity hover:opacity-90" : undefined}
                  onClick={() => {
                    if (!iso) return;
                    onSelectCountry(selected === iso ? "" : iso);
                  }}
                >
                  <title>
                    {iso
                      ? `${countryNames[iso] || iso}: ${count}`
                      : (feat.properties as { name?: string })?.name || "—"}
                  </title>
                </path>
              );
            })}
          </svg>
        )}
      </div>
      <div className="space-y-2">
        {ranked.map((row) => (
          <button
            key={row.country}
            type="button"
            onClick={() => onSelectCountry(selected === row.country ? "" : row.country)}
            className={`flex w-full items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors ${
              selected === row.country
                ? "border-[#f05133]/40 bg-[#f05133]/5 text-slate-900"
                : "border-slate-100 bg-white text-slate-700 hover:border-slate-200"
            }`}
          >
            <span className="truncate">{countryNames[row.country] || row.country}</span>
            <span className="tabular-nums text-slate-500">{row.count}</span>
          </button>
        ))}
        {unknownCount > 0 && (
          <div className="flex w-full items-center justify-between rounded-md border border-dashed border-slate-200 px-2.5 py-1.5 text-sm text-slate-500">
            <span>{unknownLabel}</span>
            <span className="tabular-nums">{unknownCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
