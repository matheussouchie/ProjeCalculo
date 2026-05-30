"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Minus, Plus } from "lucide-react";
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
  const form = useForm<CompletedProjectValues>({
    resolver: zodResolver(completedProjectSchema),
    defaultValues,
    mode: "onChange",
  });
  const { fields, append, update, remove } = useFieldArray({
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
    (total, room) =>
      total + Number(room.squareMeters || 0) * Number(room.quantity || 0),
    0,
  );

  function addRoom(type: CalculatorRoomType) {
    const option = calculatorRoomOptions.find((room) => room.type === type);
    const existingIndex = watchedRooms.findIndex((room) => room.type === type);

    setState({ ok: false });

    if (existingIndex >= 0) {
      const current = watchedRooms[existingIndex];
      update(existingIndex, {
        ...current,
        quantity: Number(current.quantity) + 1,
      });
      return;
    }

    append({
      id: `${type}_${fields.length + 1}`,
      type,
      quantity: 1,
      squareMeters: option?.defaultSquareMeters ?? 10,
    });
  }

  function decrementRoom(index: number) {
    const current = watchedRooms[index];
    const nextQuantity = Number(current.quantity) - 1;

    setState({ ok: false });

    if (nextQuantity <= 0) {
      remove(index);
      return;
    }

    update(index, {
      ...current,
      quantity: nextQuantity,
    });
  }

  function incrementRoom(index: number) {
    const current = watchedRooms[index];
    update(index, {
      ...current,
      quantity: Number(current.quantity) + 1,
    });
    setState({ ok: false });
  }

  function onSubmit(values: CompletedProjectValues) {
    startTransition(async () => {
      const response = await registerCompletedProjectAction(values);
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
              Toque nos ambientes, ajuste quantidade e metragem final.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {calculatorRoomOptions.map((option) => {
                const selected = watchedRooms.some((room) => room.type === option.type);

                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => addRoom(option.type)}
                    className={cn(
                      "rounded-md border bg-background p-4 text-left transition-all hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected &&
                        "border-foreground/30 bg-muted shadow-[var(--shadow-card)]",
                    )}
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
                );
              })}
            </div>

            <AnimatePresence initial={false}>
              {fields.length ? (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {fields.map((field, index) => {
                    const option = calculatorRoomOptions.find(
                      (room) => room.type === watchedRooms[index]?.type,
                    );

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
                        <div className="grid gap-4 md:grid-cols-[1fr_170px_160px] md:items-end">
                          <div>
                            <p className="font-medium">{option?.label}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {option?.description}
                            </p>
                          </div>
                          <div>
                            <Label>Quantidade</Label>
                            <div className="mt-2 flex h-10 items-center rounded-sm border bg-card">
                              <button
                                type="button"
                                className="flex size-10 items-center justify-center text-muted-foreground hover:text-foreground"
                                onClick={() => decrementRoom(index)}
                                aria-label="Diminuir quantidade"
                              >
                                <Minus className="size-4" aria-hidden="true" />
                              </button>
                              <Input
                                className="h-9 border-0 text-center shadow-none focus-visible:ring-0"
                                type="number"
                                min={1}
                                {...form.register(`rooms.${index}.quantity`)}
                              />
                              <button
                                type="button"
                                className="flex size-10 items-center justify-center text-muted-foreground hover:text-foreground"
                                onClick={() => incrementRoom(index)}
                                aria-label="Aumentar quantidade"
                              >
                                <Plus className="size-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <Label>Metragem</Label>
                            <Input
                              className="mt-2"
                              type="number"
                              min={0}
                              step="0.1"
                              {...form.register(`rooms.${index}.squareMeters`)}
                            />
                          </div>
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
              value={`${totalSquareMeters.toFixed(1)} m2`}
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
