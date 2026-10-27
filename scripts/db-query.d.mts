export const READ_ONLY_KEYWORDS: string[];
export const LARGE_SCAN_ROWS: number;
export const MAX_PRINTED_ROWS: number;
export const MAX_CELL_LENGTH: number;
export const STATEMENT_TIMEOUT: string;
export function toReadOnlyStatement(sql: string | undefined): string;
export function parseArguments(argv: string[]): { explain: boolean; forceIndex: boolean; sql: string };
export function formatRows(rows: Record<string, unknown>[], limit?: number): Record<string, unknown>[];
export function analyzePlan(planLines: string[]): {
  executionTimeMs: number | undefined;
  sequentialScans: { table: string; rowsRead: number }[];
  warnings: string[];
};
