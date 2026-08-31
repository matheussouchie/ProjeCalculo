"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

import {
  deleteUserRoomAction,
  type UserRoomActionState,
  upsertUserRoomAction,
} from "@/app/actions/user-rooms";
import { Badge } from "@/components/ui/badge";
import { ActionIcon } from "@/components/ui/action-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserRoom } from "@/services/user-rooms/user-room-mappers";

type UserRoomsManagerProps = {
  rooms: UserRoom[];
};

const initialState: UserRoomActionState = { ok: false };

export function UserRoomsManager({ rooms }: UserRoomsManagerProps) {
  const router = useRouter();
  const [editingRoom, setEditingRoom] = useState<UserRoom | null>(null);
  const [state, formAction, isSaving] = useActionState(
    upsertUserRoomAction,
    initialState,
  );
  const [deleteState, setDeleteState] = useState<UserRoomActionState>({ ok: false });
  const [isDeleting, startDeleteTransition] = useTransition();
  const activeRooms = useMemo(() => rooms.filter((room) => room.is_active), [rooms]);

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [router, state.ok]);

  function resetForm() {
    setEditingRoom(null);
  }

  function deleteRoom(roomId: string) {
    const confirmed = window.confirm("Excluir este ambiente?");

    if (!confirmed) {
      return;
    }

    startDeleteTransition(async () => {
      setDeleteState(await deleteUserRoomAction(roomId));
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Card className="xl:sticky xl:top-28 xl:self-start">
        <CardHeader>
          <CardTitle>{editingRoom ? "Editar ambiente" : "Criar ambiente"}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pesos maiores aumentam o impacto do ambiente na previsão.
          </p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={editingRoom?.id ?? ""} />
            <div className="space-y-2">
              <Label htmlFor="room-name">Nome</Label>
              <Input
                key={`name-${editingRoom?.id ?? "new"}`}
                id="room-name"
                name="name"
                defaultValue={editingRoom?.name ?? ""}
                placeholder="Ex.: Home Office"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-description">Descrição opcional</Label>
              <Input
                key={`description-${editingRoom?.id ?? "new"}`}
                id="room-description"
                name="description"
                defaultValue={editingRoom?.description ?? ""}
                placeholder="Ex.: bancada, marcenaria e iluminação"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="room-weight">Peso Complexidade</Label>
                <Input
                  key={`weight-${editingRoom?.id ?? "new"}`}
                  id="room-weight"
                  name="complexityWeight"
                  type="number"
                  min={0.5}
                  max={3}
                  step={0.1}
                  defaultValue={editingRoom?.complexity_weight ?? 1}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-color">Cor opcional</Label>
                <Input
                  key={`color-${editingRoom?.id ?? "new"}`}
                  id="room-color"
                  name="color"
                  type="color"
                  defaultValue={editingRoom?.color ?? "#111827"}
                />
              </div>
            </div>
            <label className="flex items-center gap-3 rounded-md border bg-background p-3 text-sm">
              <input
                key={`active-${editingRoom?.id ?? "new"}`}
                name="isActive"
                type="checkbox"
                defaultChecked={editingRoom?.is_active ?? true}
                className="size-4"
              />
              Ativo
            </label>

            {state.message ? (
              <p
                className={
                  state.ok
                    ? "text-sm text-emerald-700 dark:text-emerald-300"
                    : "text-sm text-destructive"
                }
              >
                {state.message}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : editingRoom ? (
                  <ActionIcon name="edit" />
                ) : (
                  <Plus aria-hidden="true" />
                )}
                {editingRoom ? "Salvar edição" : "Criar ambiente"}
              </Button>
              {editingRoom ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo de ambientes</CardTitle>
          <p className="text-sm text-muted-foreground">
            {activeRooms.length} ativos de {rooms.length} ambientes cadastrados.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {deleteState.message ? (
            <p
              className={
                deleteState.ok
                  ? "rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700"
                  : "rounded-sm border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              }
            >
              {deleteState.message}
            </p>
          ) : null}

          {rooms.map((room) => (
            <article
              key={room.id}
              className="grid gap-4 rounded-lg border bg-background p-4 transition-colors hover:bg-muted/30 lg:grid-cols-[1fr_120px_120px_auto] lg:items-center"
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-1 size-4 rounded-full border"
                  style={{ backgroundColor: room.color ?? "transparent" }}
                  aria-hidden="true"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base">{room.name}</h3>
                    <Badge variant={room.is_active ? "secondary" : "outline"}>
                      {room.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {room.description || "Sem descrição"}
                  </p>
                </div>
              </div>
              <Metric label="Peso" value={room.complexity_weight.toFixed(1)} />
              <Metric
                label="Origem"
                value={room.system_key ? "Padrão" : "Personalizado"}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Editar ambiente"
                  onClick={() => setEditingRoom(room)}
                >
                  <ActionIcon name="edit" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Excluir ambiente"
                  onClick={() => deleteRoom(room.id)}
                  disabled={isDeleting}
                >
                  <ActionIcon name="delete" />
                </Button>
              </div>
            </article>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-sans text-sm font-semibold">{value}</p>
    </div>
  );
}
