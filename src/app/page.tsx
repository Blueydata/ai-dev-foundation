import { getSystemStatus } from "@/modules/system-status";
import { SystemStatusCard } from "@/modules/system-status/presentation/components/system-status-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const status = await getSystemStatus();

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">Dev Foundation</p>
      <h1 className="text-2xl font-semibold tracking-tight">Tudo pronto para começar.</h1>
      <p className="text-sm text-muted-foreground">
        Este é o ponto de partida do projeto. A partir daqui, quem constrói é você, com o Claude.
      </p>
      <SystemStatusCard status={status} />
    </main>
  );
}
