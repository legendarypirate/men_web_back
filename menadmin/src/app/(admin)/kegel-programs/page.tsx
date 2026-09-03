'use client';

import { WorkoutProgramsManager } from '@/components/admin/workout-programs-manager';

export default function KegelProgramsPage() {
  return (
    <WorkoutProgramsManager
      kind="kegel"
      title="Кегел хөтөлбөр"
      subtitle="Кегел дэлгэцийн өнөөдрийн дасгал"
      addLabel="Хөтөлбөр нэмэх"
    />
  );
}
