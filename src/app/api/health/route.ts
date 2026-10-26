import { getSystemStatus, isSystemHealthy } from "@/modules/system-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getSystemStatus();
  return Response.json(status, { status: isSystemHealthy(status) ? 200 : 503 });
}
