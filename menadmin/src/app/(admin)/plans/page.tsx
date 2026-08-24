'use client';

import { ResourceManager } from '@/components/admin/resource-manager';
import { api } from '@/lib/api';
import { planConfig, promoCodeConfig } from '@/lib/resource-configs';

export default function PlansPage() {
  return (
    <div className="space-y-10">
      <ResourceManager
        config={planConfig}
        api={api.plans}
        getNewItem={() => ({ id: `plan_${Date.now()}` })}
      />
      <ResourceManager
        config={promoCodeConfig}
        api={api.promoCodes}
        getNewItem={() => ({
          code: `PROMO${Date.now().toString().slice(-6)}`,
          discountPercent: 10,
        })}
      />
    </div>
  );
}
