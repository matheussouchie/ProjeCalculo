import { Badge } from "@/components/ui/badge";
import { ProjectEstimatorForm } from "@/components/project-estimator-form";
import { ProjectHistory } from "@/components/project-history";
import { ProductivitySummary } from "@/components/productivity-summary";
import { demoProductivity, demoProjects } from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculateProjectEstimate } from "@/services/project-estimation.service";
import { mapStatisticsToProductivityProfile } from "@/services/user-statistics.service";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const { data: statistics } =
    supabase && user
      ? await supabase
          .from("user_statistics")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()
      : { data: null };
  const productivity = user
    ? mapStatisticsToProductivityProfile(statistics)
    : demoProductivity;
  const initialEstimate = calculateProjectEstimate({
    projectName: "Apartamento Jardins",
    productivity,
    environments: [
      {
        id: "env_1",
        type: "kitchen",
        name: "Cozinha integrada",
        squareMeters: 18,
        complexity: "high",
      },
      {
        id: "env_2",
        type: "bathroom",
        name: "Banheiro social",
        squareMeters: 6,
        complexity: "medium",
      },
    ],
  });

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col gap-4 py-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary">ProjeCalculo</Badge>
            <div className="space-y-2">
              <h1 className="max-w-3xl text-3xl font-semibold tracking-normal sm:text-5xl">
                Prazos de detalhamento com base no seu ritmo real.
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Calcule entregas por ambiente, metragem, complexidade e historico de
                produtividade.
              </p>
            </div>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Modelo inicial</p>
            <p className="font-mono text-sm">media ponderada v0.1</p>
          </div>
        </header>

        <ProductivitySummary profile={productivity} />
        <ProjectEstimatorForm
          productivity={productivity}
          initialEstimate={initialEstimate}
        />
        <ProjectHistory projects={demoProjects} />
      </div>
    </main>
  );
}
