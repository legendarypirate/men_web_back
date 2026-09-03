'use client';

import { WorkoutProgramsManager } from '@/components/admin/workout-programs-manager';

export default function KegelChallengesPage() {
  return (
    <WorkoutProgramsManager
      kind="kegel_challenge"
      title="Кегел сорилт"
      subtitle="Кегел дэлгэцийн сорилтууд · түвшин, хоног, lock"
      addLabel="Сорилт нэмэх"
    />
  );
}
