'use client';

import { ResourceManager } from '@/components/admin/resource-manager';
import { api } from '@/lib/api';
import { hospitalConfig } from '@/lib/resource-configs';

export default function HospitalsPage() {
  return <ResourceManager config={hospitalConfig} api={api.hospitals} />;
}
