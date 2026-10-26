export const MIGRATIONS_DIRECTORY: string;
export const MIGRATION_FILE_PATTERN: RegExp;
export function listPendingMigrations(fileNames: string[], appliedNames: Set<string>): string[];
export function runMigrations(connectionString: string | undefined): Promise<void>;
