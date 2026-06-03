import { Layers3 } from "lucide-react";

import { UserRoomsManager } from "@/components/rooms/user-rooms-manager";
import { getCurrentUserRooms } from "@/services/user-rooms/user-rooms.queries";

export default async function RoomsPage() {
  const rooms = await getCurrentUserRooms();

  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <div className="mt-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary/5 text-primary">
            <Layers3 className="size-4" aria-hidden="true" />
          </div>
          <h2>Cadastro de Ambientes</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Crie seu catálogo próprio de ambientes e ajuste pesos de complexidade para
          refletir seu jeito real de detalhar projetos.
        </p>
      </div>

      <UserRoomsManager rooms={rooms} />
    </section>
  );
}
