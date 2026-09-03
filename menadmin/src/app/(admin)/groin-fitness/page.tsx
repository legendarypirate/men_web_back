'use client';

import { WorkoutProgramsManager } from '@/components/admin/workout-programs-manager';

export default function GroinFitnessPage() {
  return (
    <WorkoutProgramsManager
      kind="groin_fitness"
      title="Groin Fitness"
      subtitle="Groin fitness дэлгэцийн хөтөлбөрүүд"
      addLabel="Хөтөлбөр нэмэх"
    />
  );
}
