'use client';

import { WorkoutProgramsManager } from '@/components/admin/workout-programs-manager';

export default function KegelChallengesPage() {
  return (
    <WorkoutProgramsManager
      kind="kegel_challenge"
      title="Кегел сорилт"
      subtitle="Дараагийн түвшин өмнөх түвшинг 7 хоног хийсний дараа нээгдэнэ"
      addLabel="Сорилт нэмэх"
    />
  );
}
