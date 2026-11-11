export function parseAppEnvironment(composeText: string): Record<string, string>;
export function toCloudEnvironment(values: Record<string, string>): Record<string, string>;
export function toShellExports(values: Record<string, string>): string;
