// src/data/fake-series.ts
// Edit this file to add/update fake bill series ranges, then redeploy.

export interface FakeSeries {
  start: number;
  end: number;
  series?: string;        // letter suffix, e.g. "B"
  currency?: string;      // e.g. "BOB"
  denomination?: string;  // e.g. "10"
  note?: string;
}

export const FAKE_SERIES: FakeSeries[] = [
  // Serie de 10 Bs (BOB) — Serie B
  { start: 67250001, end: 67700000, series: "B", currency: "BOB", denomination: "10" },
  { start: 69050001, end: 69500000, series: "B", currency: "BOB", denomination: "10" },
  { start: 69500001, end: 69950000, series: "B", currency: "BOB", denomination: "10" },
  { start: 69950001, end: 70400000, series: "B", currency: "BOB", denomination: "10" },
  { start: 70400001, end: 70850000, series: "B", currency: "BOB", denomination: "10" },
  { start: 70850001, end: 71300000, series: "B", currency: "BOB", denomination: "10" },
  { start: 76310012, end: 85139995, series: "B", currency: "BOB", denomination: "10" },
  { start: 86400001, end: 86850000, series: "B", currency: "BOB", denomination: "10" },
  { start: 90900001, end: 91350000, series: "B", currency: "BOB", denomination: "10" },
  { start: 91800001, end: 92250000, series: "B", currency: "BOB", denomination: "10" },
  // Serie de 20 Bs (BOB) — Serie B
  { start:  87280145, end:  91646549, series: "B", currency: "BOB", denomination: "20" },
  { start:  96650001, end:  97100000, series: "B", currency: "BOB", denomination: "20" },
  { start:  99800001, end: 100250000, series: "B", currency: "BOB", denomination: "20" },
  { start: 100250001, end: 100700000, series: "B", currency: "BOB", denomination: "20" },
  { start: 109250001, end: 109700000, series: "B", currency: "BOB", denomination: "20" },
  { start: 110600001, end: 111050000, series: "B", currency: "BOB", denomination: "20" },
  { start: 111050001, end: 111500000, series: "B", currency: "BOB", denomination: "20" },
  { start: 111950001, end: 112400000, series: "B", currency: "BOB", denomination: "20" },
  { start: 112400001, end: 112850000, series: "B", currency: "BOB", denomination: "20" },
  { start: 112850001, end: 113300000, series: "B", currency: "BOB", denomination: "20" },
  { start: 114200001, end: 114650000, series: "B", currency: "BOB", denomination: "20" },
  { start: 114650001, end: 115100000, series: "B", currency: "BOB", denomination: "20" },
  { start: 115100001, end: 115550000, series: "B", currency: "BOB", denomination: "20" },
  { start: 118700001, end: 119150000, series: "B", currency: "BOB", denomination: "20" },
  { start: 119150001, end: 119600000, series: "B", currency: "BOB", denomination: "20" },
  { start: 120500001, end: 120950000, series: "B", currency: "BOB", denomination: "20" },
  // Serie de 50 Bs (BOB) — Serie B
  { start:  77100001, end:  77550000, series: "B", currency: "BOB", denomination: "50" },
  { start:  78000001, end:  78450000, series: "B", currency: "BOB", denomination: "50" },
  { start:  78900001, end:  96350000, series: "B", currency: "BOB", denomination: "50" },
  { start:  96350001, end:  96800000, series: "B", currency: "BOB", denomination: "50" },
  { start:  96800001, end:  97250000, series: "B", currency: "BOB", denomination: "50" },
  { start:  98150001, end:  98600000, series: "B", currency: "BOB", denomination: "50" },
  { start: 104900001, end: 105350000, series: "B", currency: "BOB", denomination: "50" },
  { start: 105350001, end: 105800000, series: "B", currency: "BOB", denomination: "50" },
  { start: 106700001, end: 107150000, series: "B", currency: "BOB", denomination: "50" },
  { start: 107600001, end: 108050000, series: "B", currency: "BOB", denomination: "50" },
  { start: 108050001, end: 108500000, series: "B", currency: "BOB", denomination: "50" },
  { start: 109400001, end: 109850000, series: "B", currency: "BOB", denomination: "50" },
  // Add more ranges here...
];

/**
 * Checks if a serial number (+ optional letter suffix) falls within any known
 * fake series range. If the entry has a `series` letter defined, it must also
 * match. Returns the matching FakeSeries entry, or null if genuine.
 */
export function isFake(serial: number, series?: string): FakeSeries | null {
  return (
    FAKE_SERIES.find((s) => {
      if (serial < s.start || serial > s.end) return false;
      if (s.series && series && s.series !== series) return false;
      return true;
    }) ?? null
  );
}
