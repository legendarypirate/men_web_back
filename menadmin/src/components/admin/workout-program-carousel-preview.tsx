'use client';

import { WorkoutExercise } from '@/lib/api';
import { programCarouselPreview } from '@/lib/workout-phase-templates';
import { Label } from '@/components/ui/label';

type Props = {
  exercises: WorkoutExercise[];
};

export function WorkoutProgramCarouselPreview({ exercises }: Props) {
  const tabs = programCarouselPreview(exercises);

  if (tabs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#dfe4ea] bg-[#fafbfc] p-4 text-center text-xs text-[#95a5a6]">
        Дасгал нэмж таб тохируулна уу — энд апп дээрх бүх таб харагдана
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-[#e8ecef] bg-[#1a1a1f] p-4">
      <Label className="text-xs font-semibold text-white/70">
        Апп carousel урьдчилан харах (бүх хөтөлбөр)
      </Label>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {tabs.map((label, i) => (
          <div key={`${label}-${i}`} className="flex items-center gap-4">
            {i > 0 && <span className="text-white/25">→</span>}
            <span
              className={`text-sm ${i === 0 ? 'font-semibold text-white' : 'text-white/45'}`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
