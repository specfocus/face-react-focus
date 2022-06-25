import { Entity } from '@specfocus/spec-focus/entities/Entity';
import { MutationMode } from '@specfocus/view-focus.data/operations/MutationMode';
import { onError, OnSuccess, TransformData } from '@specfocus/view-focus.data/providers/DataProvider';
import { createContext } from 'react';
import { Middleware } from './useMutationMiddlewares';

export interface SaveContextValue<
  RecordType extends Entity = any,
  MutateFunc extends (...args: any[]) => any = (...args: any[]) => any
> {
  save?: SaveHandler<RecordType>;
  saving?: boolean;
  mutationMode?: MutationMode;
  registerMutationMiddleware?: (callback: Middleware<MutateFunc>) => void;
  unregisterMutationMiddleware?: (callback: Middleware<MutateFunc>) => void;
}

export type SaveHandler<RecordType> = (
  record: Partial<RecordType>,
  callbacks?: {
    onSuccess?: OnSuccess;
    onError?: onError;
    transform?: TransformData;
  }
) => Promise<void | RecordType> | Record<string, string>;

export const SaveContext = createContext<SaveContextValue>(undefined);
