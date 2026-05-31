"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import {
  registerCompletedProjectAction,
  type CompletedProjectActionState,
} from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculatorRoomOptions,
  type CalculatorRoomType,
} from "@/constants/calculator-rooms";
import {
  completedProjectSchema,
  type CompletedProjectValues,
} from "@/lib/completed-project-schema";
import { cn } from "@/lib/utils";
import { resolveRoomLabel } from "@/services/rooms/room-labels";

const defaultValues: CompletedProjectValues = {
  name: "",
  actualDays: 1,
  rooms: [],
};

export function RegisterCompletedProjectForm() {
  const [state, setState] = useState<CompletedProjectActionState>({
    ok: false,
  });
  const [isPending, startTransition] = useTransition();
  const roomIdCounter = useRef(0);
  const form = useForm<CompletedProjectValues>({
    resolver: zodResolver(completedProjectSchema),
    defaultValues,
    mode: "onChange",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rooms",
    keyName: "fieldKey",
  });
  const watchedRoomsValue = useWatch({ control: form.control, name: "rooms" });
  const watchedActualDays = useWatch({
    control: form.control,
    name: "actualDays",
  });
  const watchedRooms = useMemo(() => watchedRoomsValue ?? [], [watchedRoomsValue]);
  const totalSquareMeters = watchedRooms.reduce(
    (total, room) => total + Number(room.squareMeters || 0),
    0,
  );

  function addRoom(type: CalculatorRoomType) {
    const option = calculatorRoomOptions.find((room) => room.type === type);

    roomIdCounter.current += 1;
    setState({ ok: false });
    append({
      id: `${type}_${roomIdCounter.current}`,
      type,
      roomLabel: "",
      quantity: 1,
      squareMeters: option?.defaultSquareMeters ?? 10,
    });
  }

  function onSubmit(values: CompletedProjectValues) {
    startTransition(async () => {
      const normalizedValues = {
        ...values,
        rooms: values.rooms.map((room) => ({
          ...room,
          roomLabel: resolveRoomLabel(room, values.rooms),
          quantity: 1,
        })),
      };
      const response = await registerCompletedProjectAction(normalizedValues);
      setState(response);

      if (response.ok) {
        form.reset(defaultValues);
      }
    });
  }

  return (
    <form
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do projeto</CardTitle>
            <p className="text-sm text-muted-foreground">
              Informe o que foi entregue para o ProjeCalculo aprender com seu ritmo
              real.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_180px]">
            <div className="space-y-2">
              <Label htmlFor="project-name">Nome do projeto</Label>
              <Input
                id="project-name"
                placeholder="Apartamento Jardins"
                {...form.register("name")}
              />
              {form.formState.errors.name ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual-days">Dias corridos</Label>
              <Input
                id="actual-days"
                type="number"
                min={1}
                {...form.register("actualDays")}
              />
              {form.formState.errors.actualDays ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.actualDays.message}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ambientes entregues</CardTitle>
            <p className="text-sm text-muted-foreground">
              Toque nos ambientes e informe a metragem individual de cada um.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {calculatorRoomOptions.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => addRoom(option.type)}
                  className="rounded-md border bg-background p-4 text-left transition-all hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    <span className="flex size-8 items-center justify-center rounded-full border bg-card">
                      <Plus className="size-4" aria-hidden="true" />
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <AnimatePresence initial={false}>
              {fields.length ? (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {fields.map((field, index) => {
                    const room = watchedRooms[index];
                    const option = calculatorRoomOptions.find(
                      (item) => item.type === room?.type,
                    );
                    const fallbackLabel = room
                      ? resolveRoomLabel(room, watchedRooms)
                      : "Ambiente";

                    return (
                      <motion.article
                        key={field.fieldKey}
                        layout
                        className="rounded-lg border bg-background p-4"
                      >
                        <input type="hidden" {...form.register(`rooms.${index}.id`)} />
                        <input
                          type="hidden"
                          {...form.register(`rooms.${index}.type`)}
                        />
                        <input
                          type="hidden"
                          {...form.register(`rooms.${index}.quantity`)}
                        />
                        <div className="grid gap-4 md:grid-cols-[1fr_1fr_160px_auto] md:items-end">
                          <div>
                            <p className="font-medium">{option?.label}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {option?.description}
                            </p>
                          </div>
                          <div>
                            <Label htmlFor={`room-label-${field.id}`}>
                              Nome Ambiente
                            </Label>
                            <Input
                              id={`room-label-${field.id}`}
                              className="mt-2"
                              placeholder={fallbackLabel}
                              {...form.register(`rooms.${index}.roomLabel`)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`room-square-${field.id}`}>Metragem</Label>
                            <Input
                              id={`room-square-${field.id}`}
                              className="mt-2"
                              type="number"
                              min={0}
                              step="0.0001"
                              {...form.register(`rooms.${index}.squareMeters`)}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => remove(index)}
                            aria-label="Remover ambiente"
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </div>
                      </motion.article>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-lg border border-dashed bg-muted/30 p-8 text-center"
                >
                  <p className="font-medium">Adicione ao menos um ambiente.</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    O total e a produtividade serão atualizados após o registro.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {form.formState.errors.rooms ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.rooms.message}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <aside className="xl:sticky xl:top-28 xl:self-start">
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
            <p className="text-sm text-muted-foreground">
              Confirme os dados antes de registrar.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <SummaryLine label="Ambientes" value={String(watchedRooms.length)} />
            <SummaryLine
              label="Metragem total"
              value={`${totalSquareMeters.toFixed(4)} m²`}
            />
            <SummaryLine label="Dias reais" value={`${watchedActualDays || 0} dias`} />

            {state.message ? (
              <p
                className={cn(
                  "rounded-sm border px-3 py-2 text-sm",
                  state.ok
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                    : "border-destructive/25 bg-destructive/10 text-destructive",
                )}
              >
                {state.ok ? (
                  <CheckCircle2 className="mr-2 inline size-4" aria-hidden="true" />
                ) : null}
                {state.message}
              </p>
            ) : null}

            <Button className="w-full" size="lg" disabled={isPending}>
              {isPending ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : null}
              Registrar Projeto Concluído
            </Button>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-semibold">{value}</span>
    </div>
  );
}
