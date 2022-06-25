import { Entity } from '@specfocus/spec-focus/entities/Entity';
import { useGetList } from '@specfocus/view-focus.data/operations';
import { FilterPayload } from '@specfocus/view-focus.data/operations/FilterPayload';
import { SortPayload } from '@specfocus/view-focus.data/operations/SortPayload';
import { useWatch } from '@specfocus/view-focus.forms/forms/useWatch';
import { useCallback, useMemo } from 'react';
import { UseQueryOptions } from 'react-query';
import { ChoicesContextValue } from '../choices/ChoicesContext';
import { useReference } from '../lists/useReference';
import { useReferenceParams } from './useReferenceParams';

const defaultReferenceSource = (resource: string, source: string) =>
  `${resource}@${source}`;

/**
 * A hook for choosing a reference record. Useful for foreign keys.
 *
 * This hook fetches the possible values in the reference resource
 * (using `dataProvider.getList()`), it returns the possible choices
 * as the `choices` attribute.
 *
 * @example
 * const {
 *      choices, // the available reference resource
 * } = useReferenceInputController({
 *      input, // the input props
 *      resource: 'comments',
 *      reference: 'posts',
 *      source: 'post_id',
 * });
 *
 * The hook also allow to filter results. It returns a `setFilters`
 * function. It uses the value to create a filter for the query.
 * You can also add a permanentFilter to further filter the result:
 *
 * @example
 * const {
 *      choices, // the available reference resource
 *      setFilter,
 * } = useReferenceInputController({
 *      input, // the input props
 *      resource: 'comments',
 *      reference: 'posts',
 *      source: 'post_id',
 *      permanentFilter: {
 *          author: 'john'
 *      },
 * });
 */
export const useReferenceInputController = <RecordType extends Entity = any>(
  props: UseReferenceInputControllerParams
): ChoicesContextValue<RecordType> => {
  const {
    debounce,
    enableGetChoices,
    filter,
    page: initialPage = 1,
    perPage: initialPerPage = 25,
    sort: initialSort,
    queryOptions = {},
    reference,
    source,
  } = props;

  const [params, paramsModifiers] = useReferenceParams({
    resource: reference,
    page: initialPage,
    perPage: initialPerPage,
    sort: initialSort,
    debounce,
    filter,
  });

  // selection logic
  const currentValue = useWatch({ name: source });

  const isGetMatchingEnabled = enableGetChoices
    ? enableGetChoices(params.filterValues)
    : true;

  // fetch possible values
  const {
    data: possibleValuesData = [],
    total,
    pageInfo,
    isFetching: possibleValuesFetching,
    isLoading: possibleValuesLoading,
    error: possibleValuesError,
    refetch: refetchGetList,
  } = useGetList<RecordType>(
    reference,
    {
      pagination: {
        page: params.page,
        perPage: params.perPage,
      },
      sort: { field: params.sort, order: params.order },
      filter: { ...params.filter, ...filter },
    },
    {
      enabled: isGetMatchingEnabled,
      ...queryOptions,
    }
  );

  // fetch current value
  const {
    referenceRecord,
    refetch: refetchReference,
    error: referenceError,
    isLoading: referenceLoading,
    isFetching: referenceFetching,
  } = useReference<RecordType>({
    id: currentValue,
    reference,
    options: {
      enabled: currentValue != null && currentValue !== '',
    },
  });
  // add current value to possible sources
  let finalData: RecordType[], finalTotal: number;
  if (
    !referenceRecord ||
    possibleValuesData.find(record => record.id === currentValue)
  ) {
    finalData = possibleValuesData;
    finalTotal = total;
  } else {
    finalData = [referenceRecord, ...possibleValuesData];
    finalTotal = total == null ? undefined : total + 1;
  }

  const refetch = useCallback(() => {
    refetchGetList();
    refetchReference();
  }, [refetchGetList, refetchReference]);

  const currentSort = useMemo(
    () => ({
      field: params.sort,
      order: params.order,
    }),
    [params.sort, params.order]
  );
  return {
    sort: currentSort,
    allChoices: finalData,
    availableChoices: possibleValuesData,
    selectedChoices: [referenceRecord],
    displayedFilters: params.displayedFilters,
    error: referenceError || possibleValuesError,
    filter: params.filter,
    filterValues: params.filterValues,
    hideFilter: paramsModifiers.hideFilter,
    isFetching: referenceFetching || possibleValuesFetching,
    isLoading: referenceLoading || possibleValuesLoading,
    page: params.page,
    perPage: params.perPage,
    refetch,
    resource: reference,
    setFilters: paramsModifiers.setFilters,
    setPage: paramsModifiers.setPage,
    setPerPage: paramsModifiers.setPerPage,
    setSort: paramsModifiers.setSort,
    showFilter: paramsModifiers.showFilter,
    source,
    total: finalTotal,
    hasNextPage: pageInfo
      ? pageInfo.hasNextPage
      : total != null
        ? params.page * params.perPage < total
        : undefined,
    hasPreviousPage: pageInfo ? pageInfo.hasPreviousPage : params.page > 1,
  };
};

export interface UseReferenceInputControllerParams<
  RecordType extends Entity = any
> {
  debounce?: number;
  filter?: FilterPayload;
  queryOptions?: UseQueryOptions<{
    data: RecordType[];
    total?: number;
    pageInfo?: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
    };
  }>;
  page?: number;
  perPage?: number;
  record?: Entity;
  reference: string;
  // @deprecated ignored
  referenceSource?: typeof defaultReferenceSource;
  resource?: string;
  sort?: SortPayload;
  source: string;
  enableGetChoices?: (filters: any) => boolean;
}
