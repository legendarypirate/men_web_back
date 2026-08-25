'use client';

import { ResourceManager } from '@/components/admin/resource-manager';
import { api } from '@/lib/api';
import { homeProTipConfig } from '@/lib/resource-configs';

export default function HomeProTipsPage() {
  return <ResourceManager config={homeProTipConfig} api={api.homeProTips} />;
}
