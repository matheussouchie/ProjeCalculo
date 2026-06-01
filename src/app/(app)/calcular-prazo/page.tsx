import { DeadlineCalculator } from "@/components/calculator/deadline-calculator";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserSavedEstimates } from "@/services/estimates/saved-estimates.queries";
import type { PredictionHistorySample } from "@/services/prediction";
import { getCurrentUserActiveRoomOptions } from "@/services/user-rooms/user-rooms.queries";
import { mapStatisticsToProductivityProfile } from "@/services/user-statistics.service";

export default async function CalculateDeadlinePage() {
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
  const { data: historicalProjects } =
    supabase && user
      ? await supabase
          .from("projects")
          .select("total_square_meters,actual_days,predicted_days,completed_at")
          .eq("user_id", user.id)
          .not("actual_days", "is", null)
          .order("completed_at", { ascending: false })
          .limit(40)
      : { data: [] };
  const productivity = mapStatisticsToProductivityProfile(statistics);
  const historicalSamples: PredictionHistorySample[] = (historicalProjects ?? [])
    .filter((project) => project.actual_days !== null)
    .map((project) => ({
      totalSquareMeters: project.total_square_meters,
      actualDays: project.actual_days ?? 0,
      predictedDays: project.predicted_days,
      completedAt: project.completed_at,
    }));
  const savedEstimates = await getCurrentUserSavedEstimates();
  const roomOptions = await getCurrentUserActiveRoomOptions();

  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <h2>Calculadora de prazo</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Crie, salve e gerencie estimativas com ambientes individualizados e metragem
          de até 4 casas decimais.
        </p>
      </div>

      <DeadlineCalculator
        productivity={productivity}
        historicalSamples={historicalSamples}
        savedEstimates={savedEstimates}
        roomOptions={roomOptions}
      />
    </section>
  );
}
