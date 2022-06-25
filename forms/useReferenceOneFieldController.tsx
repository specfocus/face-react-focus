import get from 'lodash/get';
import { useGetManyReference } from '@specfocus/view-focus.data/operations';
import { UseReferenceResult } from '../lists/useReference';
import { useNotify } from '@specfocus/view-focus.notification/providers';
import { Entity }  from '@specfocus/spec-focus/entities/Entity';

export interface UseReferenceOneFieldControllerParams {
  record?: Entity;
  reference: string;
  source?: string;
  target: string;
}

/**
 * Fetch a reference record in a one-to-one relationship, and return it when available
 *
 * The reference prop should be the name of one of the <Resource> components
 * added as <Admin> child.
 *
 * @example
 *
 * const { data, isLoading, error } = useReferenceOneFieldController({
 *     record: { id: 7, name: 'James Joyce'}
 *     reference: 'bios',
 *     target: 'author_id',
 * });
 *
 * @typedef {Object} UseReferenceOneFieldControllerParams
 * @prop {Object} props.record The current resource record
 * @prop {string} props.reference The linked resource name
 * @prop {string} props.target The target resource key
 * @prop {string} props.source The key current record identifier ('id' by default)
 *
 * @returns {UseReferenceResult} The request state. Destructure as { referenceRecord, isLoading, error }.
 */
export const useReferenceOneFieldController = (
  props: UseReferenceOneFieldControllerParams
): UseReferenceResult => {
  const { reference, record, target, source = 'id' } = props;
  const notify = useNotify();

  const { data, error, isFetching, isLoading, refetch } = useGetManyReference(
    reference,
    {
      target,
      id: get(record, source),
      pagination: { page: 1, perPage: 1 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    },
    {
      enabled: !!record,
      onError: error =>
        notify(
          typeof error === 'string'
            ? error
            : error.message || 'notification.http_error',
          {
            type: 'warning',
            messageArgs: {
              _:
                typeof error === 'string'
                  ? error
                  : error && error.message
                    ? error.message
                    : undefined,
            },
          }
        ),
    }
  );

  return {
    referenceRecord: data ? data[0] : undefined,
    error,
    isFetching,
    isLoading,
    refetch,
  };
};
