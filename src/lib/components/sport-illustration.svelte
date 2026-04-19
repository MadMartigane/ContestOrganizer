<script lang="ts">
  import { SPORT_CONFIG } from "$lib/domain/constants";
  import type { TournamentType } from "$lib/domain/types";

  interface Props {
    class?: string;
    sport: TournamentType;
  }

  let { class: className = "", sport }: Props = $props();

  const config = $derived(SPORT_CONFIG[sport]);

  // Gradient backgrounds per sport
  const gradients: Record<TournamentType, string> = {
    Foot: "from-green-500 to-green-800",
    Basket: "from-orange-400 to-orange-700",
    NBA: "from-red-500 to-blue-800",
    NFL: "from-amber-500 to-amber-800",
    Rugby: "from-emerald-400 to-teal-700",
  };
</script>

<div class="relative overflow-hidden rounded-xl {className}">
  <div
    class="flex flex-col items-center justify-center aspect-[4/3] bg-gradient-to-br {gradients[sport]} p-6 text-white"
  >
    <span class="text-6xl mb-3">{config.emoji}</span>
    <span class="text-2xl font-bold tracking-wide">{config.label}</span>
  </div>
</div>
