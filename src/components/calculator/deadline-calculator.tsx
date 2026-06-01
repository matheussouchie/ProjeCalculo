"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import {
  saveEstimateAction,
  type SavedEstimateActionState,
} from "@/app/actions/projects";
import { SavedEstimatesList } from "@/components/calculator/saved-estimates-list";
import { NotificationBanner } from "@/components/feedback/notification-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  CalculatorRoomOption,
  CalculatorRoomType,
} from "@/constants/calculator-rooms";
import {
  deadlineCalculatorSchema,
  type DeadlineCalculatorValues,
} from "@/lib/calculator-schema";
import { cn } from "@/lib/utils";
import { notificationMessages } from "@/constants/notifications";
import { useAutosaveDraft } from "@/hooks/use-autosave-draft";
import {
  mapEstimateToCalculatorValues,
  type SavedEstimate,
} from "@/services/estimates/estimate-mappers";
import { redistributeRoomAreasToTotal } from "@/services/project-area-adjustment";
import { calculateProjectEstimate } from "@/services/prediction";
import type { PredictionHistorySample } from "@/services/prediction";
import { resolveRoomLabel } from "@/services/rooms/room-labels";
import type { ProductivityProfile } from "@/types/project";
import type { DraftRecord } from "@/types/draft";

type DeadlineCalculatorProps = {
  productivity: ProductivityProfile;
  historicalSamples?: PredictionHistorySample[];
  savedEstimates: SavedEstimate[];
  roomOptions: CalculatorRoomOption[];
  draft: DraftRecord<DeadlineCalculatorValues> | null;
};

const defaultValues: DeadlineCalculatorValues = {
  projectName: "",
  rooms: [],
};

export function DeadlineCalculator({
  productivity,
  historicalSamples,
  savedEstimates,
  roomOptions,
  draft,
}: DeadlineCalculatorProps) {
  const router = useRouter();
  const [showResult, setShowResult] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveState, setSaveState] = useState<SavedEstimateActionState>({ ok: false });
  const [isSaving, startSaveTransition] = useTransition();
  const [draftTotalSquareMeters, setDraftTotalSquareMeters] = useState<string | null>(
    null,
  );
  const roomIdCounter = useRef(0);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const form = useForm<DeadlineCalculatorValues>({
    resolver: zodResolver(deadlineCalculatorSchema),
    defaultValues,
    mode: "onChange",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rooms",
    keyName: "fieldKey",
  });
  const watchedProjectName = useWatch({
    control: form.control,
    name: "projectName",
  });
  const watchedRoomsValue = useWatch({ control: form.control, name: "rooms" });
  const watchedRooms = useMemo(() => watchedRoomsValue ?? [], [watchedRoomsValue]);
  const watchedValues = useWatch({ control: form.control });
  const autosaveValues = useMemo(
    () =>
      ({
        projectId: watchedValues.projectId,
        projectName: watchedValues.projectName ?? "",
        rooms: (watchedValues.rooms ?? []) as DeadlineCalculatorValues["rooms"],
      }) satisfies DeadlineCalculatorValues,
    [watchedValues.projectId, watchedValues.projectName, watchedValues.rooms],
  );
  const autosave = useAutosaveDraft({
    scope: "calculate_deadline",
    entityId: autosaveValues.projectId ?? null,
    values: autosaveValues,
    serverDraft: draft,
    isMeaningful: (values) =>
      Boolean(values.projectName?.trim()) || (values.rooms?.length ?? 0) > 0,
    onRestore: (values) => {
      form.reset(values);
      setShowResult(false);
      setShowSaveDialog(false);
    },
  });
  const currentTotalSquareMeters = watchedRooms.reduce(
    (total, room) => total + Number(room.squareMeters || 0),
    0,
  );

  const totalInputValue = draftTotalSquareMeters ?? currentTotalSquareMeters.toFixed(4);

  const estimateInput = useMemo(() => {
    const environments = watchedRooms
      .filter((room) => Number(room.squareMeters) > 0)
      .map((room) => ({
        id: room.id,
        type: room.type,
        name: resolveRoomLabel(room, watchedRooms, roomOptions),
        roomLabel: resolveRoomLabel(room, watchedRooms, roomOptions),
        complexityWeight: room.complexityWeight,
        squareMeters: Number(room.squareMeters),
        complexity: "medium" as const,
      }));

    return {
      projectName: watchedProjectName?.trim() || "Estimativa rápida",
      productivity,
      historicalSamples,
      environments,
    };
  }, [historicalSamples, productivity, roomOptions, watchedProjectName, watchedRooms]);

  const estimate = useMemo(() => {
    if (estimateInput.environments.length === 0) {
      return null;
    }

    return calculateProjectEstimate(estimateInput);
  }, [estimateInput]);

  const totalComplexity = estimate?.weightedSquareMeters ?? 0;
  const totalRooms = watchedRooms.length;

  function addRoom(type: CalculatorRoomType) {
    const option = roomOptions.find((item) => item.type === type);

    roomIdCounter.current += 1;
    setShowResult(false);
    setSaveState({ ok: false });
    append({
      id: `${type}_${roomIdCounter.current}`,
      type,
      roomLabel: "",
      complexityWeight: option?.complexityWeight ?? 1,
      quantity: 1,
      squareMeters: option?.defaultSquareMeters ?? 10,
      observation: "",
    });
  }

  function removeRoom(index: number) {
    remove(index);
    setShowResult(false);
    setSaveState({ ok: false });
  }

  function applyTotalSquareMeters() {
    const targetTotal = Number(totalInputValue.replace(",", "."));

    setDraftTotalSquareMeters(null);

    if (
      !Number.isFinite(targetTotal) ||
      targetTotal <= 0 ||
      watchedRooms.length === 0
    ) {
      return;
    }

    const adjustedRooms = redistributeRoomAreasToTotal(watchedRooms, targetTotal);
    form.setValue("rooms", adjustedRooms, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setShowResult(false);
  }

  function calculateDeadline() {
    setShowResult(true);
    setShowSaveDialog(Boolean(estimate));
    setSaveState({ ok: false });
  }

  function saveEstimate() {
    startSaveTransition(async () => {
      const response = await saveEstimateAction(form.getValues());
      setSaveState(response);

      if (response.ok) {
        if (response.estimateId) {
          form.setValue("projectId", response.estimateId);
        }

        setShowSaveDialog(false);
        autosave.clearDraft();
        router.refresh();
      }
    });
  }

  function editEstimate(savedEstimate: SavedEstimate) {
    form.reset(mapEstimateToCalculatorValues(savedEstimate));
    setShowResult(false);
    setShowSaveDialog(false);
    setSaveState({ ok: false });
    calculatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={calculatorRef} className="space-y-6">
      {autosave.hasPendingDraft ? (
        <NotificationBanner
          tone="info"
          message={notificationMessages.draftFound}
          actions={
            <>
              <Button type="button" size="sm" onClick={autosave.restoreDraft}>
                Restaurar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={autosave.discardDraft}
              >
                Descartar
              </Button>
            </>
          }
        />
      ) : null}

      {autosave.notification ? (
        <NotificationBanner
          tone={autosave.notification.tone}
          message={autosave.notification.message}
        />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados da estimativa</CardTitle>
              <p className="text-sm text-muted-foreground">
                Nomeie o projeto se quiser. Caso deixe vazio, geramos um nome único ao
                salvar.
              </p>
            </CardHeader>
            <CardContent>
              <Label htmlFor="project-name">Nome Projeto</Label>
              <Input
                id="project-name"
                className="mt-2"
                placeholder="Projeto Sem Nome 001"
                {...form.register("projectName", {
                  onChange: () => setSaveState({ ok: false }),
                })}
              />
            </CardContent>
          </Card>

          <SummaryCards
            totalSquareMeters={estimate?.totalSquareMeters ?? 0}
            complexity={totalComplexity}
            estimatedDays={estimate?.recommendedDays ?? 0}
          />

          <Card>
            <CardHeader>
              <CardTitle>Ambientes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Adicione ambientes individualmente. Ambientes repetidos podem ter
                metragens diferentes.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {roomOptions.map((option) => (
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
                {fields.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-3"
                  >
                    {fields.map((field, index) => {
                      const room = watchedRooms[index];
                      const option = roomOptions.find(
                        (item) => item.type === room?.type,
                      );
                      const fallbackLabel = room
                        ? resolveRoomLabel(room, watchedRooms, roomOptions)
                        : "Ambiente";

                      return (
                        <motion.article
                          key={field.fieldKey}
                          layout
                          className="rounded-lg border bg-background p-4"
                        >
                          <input
                            type="hidden"
                            {...form.register(`rooms.${index}.id`)}
                          />
                          <input
                            type="hidden"
                            {...form.register(`rooms.${index}.type`)}
                          />
                          <input
                            type="hidden"
                            {...form.register(`rooms.${index}.quantity`)}
                          />
                          <input
                            type="hidden"
                            {...form.register(`rooms.${index}.complexityWeight`)}
                          />
                          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_150px_auto] lg:items-end">
                            <div>
                              <p className="font-medium">{option?.label}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Tipo Ambiente
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
                                {...form.register(`rooms.${index}.roomLabel`, {
                                  onChange: () => setSaveState({ ok: false }),
                                })}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`room-square-${field.id}`}>
                                Metragem
                              </Label>
                              <Input
                                id={`room-square-${field.id}`}
                                className="mt-2"
                                type="number"
                                min={0}
                                step="0.0001"
                                {...form.register(`rooms.${index}.squareMeters`, {
                                  onChange: () => {
                                    setShowResult(false);
                                    setSaveState({ ok: false });
                                  },
                                })}
                              />
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeRoom(index)}
                              title="Remover ambiente"
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
                    <p className="font-medium">Comece tocando em um ambiente.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Cada toque cria uma nova instância com metragem própria.
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
                Previsão atualizada em tempo real.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <SideMetric label="Ambientes adicionados" value={String(totalRooms)} />
              <div className="space-y-2 border-b pb-3">
                <Label htmlFor="calculator-total-square-meters">Metragem total</Label>
                <div className="flex gap-2">
                  <Input
                    id="calculator-total-square-meters"
                    type="number"
                    min={0}
                    step="0.0001"
                    value={totalInputValue}
                    onFocus={() =>
                      setDraftTotalSquareMeters(currentTotalSquareMeters.toFixed(4))
                    }
                    onChange={(event) => {
                      setDraftTotalSquareMeters(event.target.value);
                    }}
                    onBlur={applyTotalSquareMeters}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        applyTotalSquareMeters();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={applyTotalSquareMeters}
                    disabled={watchedRooms.length === 0}
                  >
                    Ajustar
                  </Button>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Editar o total ajusta proporcionalmente as metragens individuais.
                </p>
              </div>
              <SideMetric
                label="Complexidade total"
                value={totalComplexity ? totalComplexity.toFixed(4) : "--"}
              />
              <SideMetric
                label="Produtividade atual"
                value={`${productivity.averageSquareMetersPerDay} m²/dia`}
              />
              <SideMetric
                label="Dias previstos"
                value={estimate ? `${estimate.recommendedDays} dias` : "--"}
              />

              {saveState.message ? (
                <p
                  className={cn(
                    "rounded-sm border px-3 py-2 text-sm",
                    saveState.ok
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                      : "border-destructive/25 bg-destructive/10 text-destructive",
                  )}
                >
                  {saveState.message}
                </p>
              ) : null}

              <Button
                className="w-full"
                size="lg"
                disabled={!estimate}
                onClick={calculateDeadline}
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
                      <ResultPill label="Confiança" value={`${estimate.confidence}%`} />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </CardContent>
          </Card>
        </aside>
      </section>

      <SavedEstimatesList estimates={savedEstimates} onEdit={editEstimate} />

      {showSaveDialog && estimate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-estimate-title"
            className="w-full max-w-md rounded-lg border bg-card p-6 shadow-[var(--shadow-soft)]"
          >
            <h3 id="save-estimate-title">Deseja salvar esta estimativa?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Ela ficará disponível no histórico para editar, duplicar ou excluir.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={saveEstimate} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : null}
                Salvar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
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
    { label: "Metragem Total", value: `${totalSquareMeters.toFixed(4)} m²` },
    { label: "Complexidade", value: complexity ? complexity.toFixed(4) : "--" },
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
