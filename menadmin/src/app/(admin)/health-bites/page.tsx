'use client';

import { ResourceManager } from '@/components/admin/resource-manager';
import { api } from '@/lib/api';
import { healthBiteConfig } from '@/lib/resource-configs';

export default function HealthBitesPage() {
  return <ResourceManager config={healthBiteConfig} api={api.healthBites} />;
}
