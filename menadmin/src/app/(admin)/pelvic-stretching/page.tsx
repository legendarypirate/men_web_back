'use client';

import { WorkoutProgramsManager } from '@/components/admin/workout-programs-manager';

export default function PelvicStretchingPage() {
  return (
    <WorkoutProgramsManager
      kind="pelvic_stretching"
      title="Pelvic Stretching"
      subtitle="Pelvic stretching дэлгэцийн хөтөлбөрүүд"
      addLabel="Хөтөлбөр нэмэх"
    />
  );
}
