export * from './command';
export * from './folder';
export * from './execution';
export * from './settings';
export * from './api';

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type CreateInput<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;