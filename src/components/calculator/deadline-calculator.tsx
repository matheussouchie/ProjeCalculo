"use client";

import { useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Minus, Plus, Sparkles } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculatorRoomOptions,
  type CalculatorRoomType,
} from "@/constants/calculator-rooms";
import {
  deadlineCalculatorSchema,
  type DeadlineCalculatorValues,
} from "@/lib/calculator-schema";
import { cn } from "@/lib/utils";
import { calculateProjectEstimate } from "@/services/project-estimation.service";
import type { ProductivityProfile } from "@/types/project";

type DeadlineCalculatorProps = {
  productivity: ProductivityProfile;
};

export function DeadlineCalculator({ productivity }: DeadlineCalculatorProps) {
  const [showResult, setShowResult] = useState(false);
  const roomIdCounter = useRef(0);
  const form = useForm<DeadlineCalculatorValues>({
    resolver: zodResolver(deadlineCalculatorSchema),
    defaultValues: {
      rooms: [],
    },
    mode: "onChange",
  });
  const { fields, append, update, remove } = useFieldArray({
    control: form.control,
    name: "rooms",
    keyName: "fieldKey",
  });
  const watchedRoomsValue = useWatch({ control: form.control, name: "rooms" });
  const watchedRooms = useMemo(() => watchedRoomsValue ?? [], [watchedRoomsValue]);

  const estimateInput = useMemo(() => {
    const environments = watchedRooms
      .filter((room) => Number(room.squareMeters) > 0 && Number(room.quantity) > 0)
      .map((room) => {
        const option = calculatorRoomOptions.find((item) => item.type === room.type);

        return {
          id: room.id,
          type: room.type,
          name: option?.label ?? "Ambiente",
          squareMeters: Number(room.squareMeters) * Number(room.quantity),
          complexity: option?.complexity ?? "medium",
        };
      });

    return {
      projectName: "Estimativa rapida",
      productivity,
      environments,
    };
  }, [productivity, watchedRooms]);

  const estimate = useMemo(() => {
    if (estimateInput.environments.length === 0) {
      return null;
    }

    return calculateProjectEstimate(estimateInput);
  }, [estimateInput]);

  const totalComplexity = estimate?.weightedSquareMeters ?? 0;
  const totalRooms = watchedRooms.reduce(
    (total, room) => total + Number(room.quantity || 0),
    0,
  );

  function addRoom(type: CalculatorRoomType) {
    const option = calculatorRoomOptions.find((item) => item.type === type);
    const existingIndex = watchedRooms.findIndex((room) => room.type === type);

    setShowResult(false);

    if (existingIndex >= 0) {
      const current = watchedRooms[existingIndex];
      update(existingIndex, {
        ...current,
        quantity: Number(current.quantity) + 1,
      });
      return;
    }

    roomIdCounter.current += 1;

    append({
      id: `${type}_${roomIdCounter.current}`,
      type,
      quantity: 1,
      squareMeters: option?.defaultSquareMeters ?? 10,
      observation: "",
    });
  }

  function incrementRoom(index: number) {
    const current = watchedRooms[index];
    update(index, {
      ...current,
      quantity: Number(current.quantity) + 1,
    });
    setShowResult(false);
  }

  function decrementRoom(index: number) {
    const current = watchedRooms[index];
    const nextQuantity = Number(current.quantity) - 1;

    setShowResult(false);

    if (nextQuantity <= 0) {
      remove(index);
      return;
    }

    update(index, {
      ...current,
      quantity: nextQuantity,
    });
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <SummaryCards
          totalSquareMeters={estimate?.totalSquareMeters ?? 0}
          complexity={totalComplexity}
          estimatedDays={estimate?.recommendedDays ?? 0}
        />

        <Card>
          <CardHeader>
            <CardTitle>Ambientes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Adicione os ambientes que compõem o projeto.
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
              {fields.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-3"
                >
                  {fields.map((field, index) => {
                    const option = calculatorRoomOptions.find(
                      (item) => item.type === watchedRooms[index]?.type,
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
                        <div className="grid gap-4 lg:grid-cols-[1fr_170px_150px] lg:items-end">
                          <div>
                            <p className="font-medium">{option?.label}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {option?.description}
                            </p>
                            <div className="mt-4">
                              <Label htmlFor={`observation-${field.id}`}>
                                Observacao opcional
                              </Label>
                              <Input
                                id={`observation-${field.id}`}
                                className="mt-2"
                                placeholder="Ex.: marcenaria completa"
                                {...form.register(`rooms.${index}.observation`)}
                              />
                            </div>
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
                                {...form.register(`rooms.${index}.quantity`, {
                                  onChange: () => setShowResult(false),
                                })}
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
                              {...form.register(`rooms.${index}.squareMeters`, {
                                onChange: () => setShowResult(false),
                              })}
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
                  <p className="font-medium">Comece tocando em um ambiente.</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    A previsão aparece automaticamente conforme você adiciona dados.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      <aside className="xl:sticky xl:top-28 xl:self-start">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Resumo lateral</CardTitle>
            <p className="text-sm text-muted-foreground">
              Previsao atualizada em tempo real.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <SideMetric label="Ambientes adicionados" value={String(totalRooms)} />
            <SideMetric
              label="Metragem total"
              value={`${estimate?.totalSquareMeters ?? 0} m2`}
            />
            <SideMetric label="Complexidade total" value={totalComplexity.toFixed(1)} />
            <SideMetric
              label="Produtividade atual"
              value={`${productivity.averageSquareMetersPerDay} m2/dia`}
            />
            <SideMetric
              label="Dias previstos"
              value={estimate ? `${estimate.recommendedDays} dias` : "--"}
            />

            <Button
              className="w-full"
              size="lg"
              disabled={!estimate}
              onClick={() => setShowResult(true)}
            >
              <Sparkles aria-hidden="true" />
              Calcular Prazo
            </Button>

            <AnimatePresence>
              {showResult && estimate ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-lg border bg-muted/40 p-5"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-1 size-5 text-emerald-600"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Resultado estimado
                      </p>
                      <p className="mt-1 text-[32px] font-semibold">
                        {estimate.recommendedDays} dias
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <ResultPill
                      label="Margem"
                      value={`${estimate.range.optimistic}-${estimate.range.conservative}d`}
                    />
                    <ResultPill label="Confianca" value={`${estimate.confidence}%`} />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </CardContent>
        </Card>
      </aside>
    </section>
  );
}

function SummaryCards({
  totalSquareMeters,
  complexity,
  estimatedDays,
}: {
  totalSquareMeters: number;
  complexity: number;
  estimatedDays: number;
}) {
  const cards = [
    { label: "Metragem Total", value: `${totalSquareMeters} m2` },
    { label: "Complexidade", value: complexity ? complexity.toFixed(1) : "--" },
    { label: "Dias Estimados", value: estimatedDays ? `${estimatedDays} dias` : "--" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[32px] font-semibold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SideMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-semibold">{value}</span>
    </div>
  );
}

function ResultPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono font-semibold">{value}</p>
    </div>
  );
}
