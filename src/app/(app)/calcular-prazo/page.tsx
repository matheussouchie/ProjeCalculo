import { DeadlineCalculator } from "@/components/calculator/deadline-calculator";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
  const productivity = mapStatisticsToProductivityProfile(statistics);

  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <h2>Calculadora de prazo</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Adicione ambientes, ajuste quantidades e metragem. O ProjeCalculo recalcula a
          previsão automaticamente.
        </p>
      </div>

      <DeadlineCalculator productivity={productivity} />
    </section>
  );
}
