import type { SystemStatus } from "@/modules/system-status/domain/system-status";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

type SystemStatusCardProps = { status: SystemStatus };

export function SystemStatusCard({ status }: SystemStatusCardProps) {
  const databaseOk = status.database === "ok";

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-1 duration-300">
      <CardHeader>
        <CardTitle>Status</CardTitle>
        <CardDescription>O que já está funcionando.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          Aplicação
          <Badge variant="secondary">rodando</Badge>
        </div>
        <div className="flex items-center justify-between">
          Banco de dados
          <Badge variant={databaseOk ? "secondary" : "destructive"}>{databaseOk ? "conectado" : "sem conexão"}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
