import { Identifier } from '@specfocus/spec-focus/entities/Entity';
import { useCallback } from 'react';
import { useRecordSelection } from './useRecordSelection';

/**
 * Hook to Unselect the rows of a datagrid
 *
 * @example
 *
 * const unselect = useUnselect('posts');
 * unselect([123, 456]);
 */
export const useUnselect = (resource: string) => {
  const [, { unselect }] = useRecordSelection(resource);
  return useCallback(
    (ids: Identifier[]) => {
      unselect(ids);
    },
    [unselect]
  );
};
