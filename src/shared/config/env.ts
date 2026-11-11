import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    const invalidNames = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Missing or invalid environment variables: ${invalidNames}. Set them in the cloud environment settings (or in .env when running with Docker); .env.example lists the names.`);
  }
  return result.data;
}

let serverEnv: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  serverEnv ??= parseServerEnv(process.env);
  return serverEnv;
}
