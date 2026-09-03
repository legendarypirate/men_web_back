'use client';

import { WorkoutProgramsManager } from '@/components/admin/workout-programs-manager';

export default function KegelChallengesPage() {
  return (
    <WorkoutProgramsManager
      kind="kegel_challenge"
      title="Кегел сорилт"
      subtitle="Түвшин 1 нь өнөөдрийн дасгал. Бусад түвшин сорилтын жагсаалтад гарна."
      addLabel="Сорилт нэмэх"
    />
  );
}
