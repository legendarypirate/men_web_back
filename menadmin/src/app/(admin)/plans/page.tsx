'use client';

import { ResourceManager } from '@/components/admin/resource-manager';
import { api } from '@/lib/api';
import { planConfig } from '@/lib/resource-configs';

export default function PlansPage() {
  return (
    <ResourceManager
      config={planConfig}
      api={api.plans}
      getNewItem={() => ({ id: `plan_${Date.now()}` })}
    />
  );
}
