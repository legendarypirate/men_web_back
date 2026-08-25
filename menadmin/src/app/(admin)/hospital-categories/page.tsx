'use client';

import { ResourceManager } from '@/components/admin/resource-manager';
import { api } from '@/lib/api';
import { hospitalCategoryConfig } from '@/lib/resource-configs';

export default function HospitalCategoriesPage() {
  return (
    <ResourceManager config={hospitalCategoryConfig} api={api.hospitalCategories} />
  );
}
