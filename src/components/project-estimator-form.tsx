"use client";

import { useState, useTransition, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Calculator, Loader2, Plus } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import {
  estimateProjectAction,
  type EstimateActionState,
} from "@/app/actions/projects";
import { EstimateResult } from "@/components/estimate-result";
import { ActionIcon } from "@/components/ui/action-icon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { complexityOptions, environmentOptions } from "@/lib/project-options";
import { projectEstimateSchema, type ProjectEstimateFormValues } from "@/lib/schemas";
import { useTotalSquareMeters } from "@/hooks/use-total-square-meters";
import type { ProjectEstimate, ProductivityProfile } from "@/types/project";

type ProjectEstimatorFormProps = {
  productivity: ProductivityProfile;
  initialEstimate: ProjectEstimate;
};

const defaultEnvironment = {
  id: "env_1",
  type: "kitchen" as const,
  name: "Cozinha integrada",
  squareMeters: 18,
  complexity: "high" as const,
};

export function ProjectEstimatorForm({
  productivity,
  initialEstimate,
}: ProjectEstimatorFormProps) {
  const [result, setResult] = useState<ProjectEstimate>(initialEstimate);
  const [actionState, setActionState] = useState<EstimateActionState>({
    ok: true,
  });
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProjectEstimateFormValues>({
    resolver: zodResolver(projectEstimateSchema),
    defaultValues: {
      projectName: "Apartamento Jardins",
      productivity,
      environments: [
        defaultEnvironment,
        {
          id: "env_2",
          type: "bathroom",
          name: "Banheiro social",
          squareMeters: 6,
          complexity: "medium",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "environments",
    keyName: "fieldKey",
  });
  const watchedEnvironments = useWatch({
    control: form.control,
    name: "environments",
  });

  const totalSquareMeters = useTotalSquareMeters(watchedEnvironments);

  function onSubmit(values: ProjectEstimateFormValues) {
    setActionState({ ok: true });

    startTransition(async () => {
      const response = await estimateProjectAction(values);
      setActionState(response);

      if (response.estimate) {
        setResult(response.estimate);
      }
    });
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Nova previsao</CardTitle>
          <CardDescription>
            Informe os ambientes e deixe o historico ajustar o prazo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
              <Field label="Projeto" error={form.formState.errors.projectName?.message}>
                <Input
                  placeholder="Nome do projeto"
                  {...form.register("projectName")}
                />
              </Field>
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Metragem total</p>
                <p className="mt-1 font-sans text-2xl font-semibold">
                  {Number.isFinite(totalSquareMeters) ? totalSquareMeters : 0} m2
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-medium">Ambientes</h2>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    append({
                      id: `env_${Date.now()}`,
                      type: "bedroom",
                      name: "Novo ambiente",
                      squareMeters: 10,
                      complexity: "medium",
                    })
                  }
                >
                  <Plus aria-hidden="true" />
                  Adicionar
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <motion.div
                    key={field.fieldKey}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border bg-background p-3"
                  >
                    <input
                      type="hidden"
                      {...form.register(`environments.${index}.id`)}
                    />
                    <div className="grid gap-3 sm:grid-cols-[1fr_150px_150px_44px]">
                      <Field
                        label="Nome"
                        error={
                          form.formState.errors.environments?.[index]?.name?.message
                        }
                      >
                        <Input {...form.register(`environments.${index}.name`)} />
                      </Field>
                      <Field label="Tipo">
                        <Select {...form.register(`environments.${index}.type`)}>
                          {environmentOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="m2">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          {...form.register(`environments.${index}.squareMeters`)}
                        />
                      </Field>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Remover ambiente"
                          disabled={fields.length === 1}
                          onClick={() => remove(index)}
                        >
                          <ActionIcon name="delete" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Field label="Complexidade">
                        <Select {...form.register(`environments.${index}.complexity`)}>
                          {complexityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {!actionState.ok ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {actionState.error}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Calculator aria-hidden="true" />
              )}
              Calcular prazo
            </Button>
          </form>
        </CardContent>
      </Card>

      <EstimateResult estimate={result} />
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
