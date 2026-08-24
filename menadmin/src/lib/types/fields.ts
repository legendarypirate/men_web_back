export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'switch'
  | 'select'
  | 'json'
  | 'string-list'
  | 'date'
  | 'readonly'
  | 'image-upload';

export type FieldOption = { label: string; value: string };

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  rows?: number;
  hint?: string;
  showOnCreate?: boolean;
  showOnEdit?: boolean;
};

export type ColumnDef<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
};

export type ResourceConfig<T extends Record<string, unknown>> = {
  title: string;
  subtitle?: string;
  itemLabel: string;
  idKey: keyof T;
  fields: FieldDef[];
  columns: ColumnDef<T>[];
  emptyDefaults: Partial<T>;
  listKey: string;
  itemKey: string;
};
