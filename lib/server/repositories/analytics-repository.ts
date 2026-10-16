import { StoredAnalyticsEvent } from "@/lib/analytics/types";
import { localDateKey } from "@/lib/analytics/aggregate";
import {
  appendLine,
  listFiles,
  readJsonFile,
  readLines,
  removeFile,
  resolveDataPath,
  withFileLock,
  writeJsonFile,
} from "@/lib/server/storage/json-store";

/**
 * Analytics events are appended to one JSON-lines file per day:
 * DATA_DIR/analytics/YYYY-MM-DD.jsonl. A small index remembers when each
 * anonymous visitor id was first seen (for "new vs returning" visitors).
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const dayFile = (dateKey: string) => resolveDataPath("analytics", `${dateKey}.jsonl`);
const VISITOR_INDEX = () => resolveDataPath("analytics", "visitors.json");
const FILE_PATTERN = /^\d{4}-\d{2}-\d{2}\.jsonl$/;

function retentionDays(): number {
  const value = Number(process.env.ANALYTICS_RETENTION_DAYS || 400);
  return Number.isFinite(value) && value >= 30 ? value : 400;
}

let visitorIndex: Record<string, number> | null = null;
let lastPrune = 0;

async function loadVisitorIndex(): Promise<Record<string, number>> {
  if (!visitorIndex) visitorIndex = await readJsonFile<Record<string, number>>(VISITOR_INDEX(), {});
  return visitorIndex;
}

async function prune(now: number) {
  if (now - lastPrune < 12 * 60 * 60 * 1000) return;
  lastPrune = now;
  const cutoff = localDateKey(now - retentionDays() * DAY_MS);
  const files = await listFiles(resolveDataPath("analytics"));
  await Promise.all(
    files
      .filter((name) => FILE_PATTERN.test(name) && name.slice(0, 10) < cutoff)
      .map((name) => removeFile(resolveDataPath("analytics", name)))
  );
}

export const analyticsRepository = {
  async append(event: StoredAnalyticsEvent): Promise<void> {
    const file = dayFile(localDateKey(event.ts));
    await withFileLock(file, () => appendLine(file, JSON.stringify(event)));

    if (event.type === "pageview") {
      const index = await loadVisitorIndex();
      if (!index[event.visitorId]) {
        index[event.visitorId] = event.ts;
        await withFileLock(VISITOR_INDEX(), () => writeJsonFile(VISITOR_INDEX(), index));
      }
    }
    prune(event.ts).catch(() => undefined);
  },

  /** Events with fromTs <= ts < toTs. */
  async readRange(fromTs: number, toTs: number): Promise<StoredAnalyticsEvent[]> {
    const keys = new Set<string>();
    for (let ts = fromTs; ts < toTs + DAY_MS; ts += DAY_MS) keys.add(localDateKey(Math.min(ts, toTs)));

    const events: StoredAnalyticsEvent[] = [];
    for (const key of Array.from(keys)) {
      const lines = await readLines(dayFile(key));
      for (const line of lines) {
        try {
          const event = JSON.parse(line) as StoredAnalyticsEvent;
          if (event.ts >= fromTs && event.ts < toTs) events.push(event);
        } catch {
          // skip a partially written line
        }
      }
    }
    return events;
  },

  async firstSeenIndex(): Promise<Record<string, number>> {
    return loadVisitorIndex();
  },
};
