'use client';

import { useEffect, useMemo, useState } from 'react';
import { ResourceManager } from '@/components/admin/resource-manager';
import { LoadingState } from '@/components/page-ui';
import { api, HospitalCategoryRecord } from '@/lib/api';
import { buildHospitalConfig } from '@/lib/resource-configs';

export default function HospitalsPage() {
  const [categories, setCategories] = useState<HospitalCategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.hospitalCategories
      .list()
      .then((res) => {
        if (mounted) {
          setCategories(res.data.categories || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const config = useMemo(
    () =>
      buildHospitalConfig(
        categories.map((category) => ({
          label: category.title,
          value: category.id,
        }))
      ),
    [categories]
  );

  if (loading) return <LoadingState />;

  return <ResourceManager config={config} api={api.hospitals} />;
}
