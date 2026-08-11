'use client';

import { ResourceManager } from '@/components/admin/resource-manager';
import { api } from '@/lib/api';
import { articleConfig } from '@/lib/resource-configs';

export default function ArticlesPage() {
  return <ResourceManager config={articleConfig} api={api.articles} />;
}
