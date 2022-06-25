import { useAuthenticated } from '@specfocus/view-focus.auth/providers';
import { Entity } from '@specfocus/spec-focus/entities/Entity';
import { FilterPayload } from '@specfocus/view-focus.data/operations/FilterPayload';
import { useGetList, UseGetListHookValue } from '@specfocus/view-focus.data/operations';
import { SortPayload } from '@specfocus/view-focus.data/operations/SortPayload';
import { useNotify } from '@specfocus/view-focus.notification/providers';
import { isValidElement, useEffect, useMemo } from 'react';
import { UseQueryOptions } from 'react-query';
import { useGetResourceLabel, useResourceContext } from '../core';
import { defaultExporter } from '../export';
import { useTranslate } from '@specfocus/view-focus.i18n/i18n';
import { Exporter } from '../types';
import { SORT_ASC } from './queryReducer';
import { useListParams } from './useListParams';
import { useRecordSelection } from './useRecordSelection';

/**
 * Prepare data for the List view
 *
 * @param {Object} props The props passed to the List component.
 *
 * @return {Object} controllerProps Fetched and computed data for the List view
 *
 * @example
 *
 * import { useListController } from '@specfocus/view-focus.mui-demo';
 * import ListView from './ListView';
 *
 * const MyList = props => {
 *     const controllerProps = useListController(props);
 *     return <ListView {...controllerProps} {...props} />;
 * }
 */
export const useListController = <RecordType extends Entity = any>(
  props: ListControllerProps<RecordType> = {}
): ListControllerResult<RecordType> => {
  const {
    disableAuthentication,
    exporter = defaultExporter,
    filterDefaultValues,
    sort = defaultSort,
    perPage = 10,
    filter,
    debounce = 500,
    disableSyncWithLocation,
    queryOptions,
  } = props;
  useAuthenticated({ enabled: !disableAuthentication });
  const resource = useResourceContext(props);

  if (!resource) {
    throw new Error(
      `<List> was called outside of a ResourceContext and without a resource prop. You must set the resource prop.`
    );
  }
  if (filter && isValidElement(filter)) {
    throw new Error(
      '<List> received a React element as `filter` props. If you intended to set the list filter elements, use the `filters` (with an s) prop instead. The `filter` prop is internal and should not be set by the developer.'
    );
  }

  const translate = useTranslate();
  const notify = useNotify();

  const [query, queryModifiers] = useListParams({
    resource,
    filterDefaultValues,
    sort,
    perPage,
    debounce,
    disableSyncWithLocation,
  });

  const [selectedIds, selectionModifiers] = useRecordSelection(resource);

  const {
    data,
    pageInfo,
    total,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetList<RecordType>(
    resource,
    {
      pagination: {
        page: query.page,
        perPage: query.perPage,
      },
      sort: { field: query.sort, order: query.order },
      filter: { ...query.filter, ...filter },
    },
    {
      keepPreviousData: true,
      retry: false,
      onError: error =>
        notify(error?.message || 'notification.http_error', {
          type: 'warning',
          messageArgs: {
            _: error?.message,
          },
        }),
      ...queryOptions,
    }
  );

  // change page if there is no data
  useEffect(() => {
    if (
      query.page <= 0 ||
      (!isFetching && query.page > 1 && data.length === 0)
    ) {
      // Query for a page that doesn't exist, set page to 1
      queryModifiers.setPage(1);
      return;
    }
    if (total == null) {
      return;
    }
    const totalPages = Math.ceil(total / query.perPage) || 1;
    if (!isFetching && query.page > totalPages) {
      // Query for a page out of bounds, set page to the last existing page
      // It occurs when deleting the last element of the last page
      queryModifiers.setPage(totalPages);
    }
  }, [isFetching, query.page, query.perPage, data, queryModifiers, total]);

  const currentSort = useMemo(
    () => ({
      field: query.sort,
      order: query.order,
    }),
    [query.sort, query.order]
  );

  const getResourceLabel = useGetResourceLabel();
  const defaultTitle = translate('page.list', {
    name: getResourceLabel(resource, 2),
  });

  return {
    sort: currentSort,
    data,
    defaultTitle,
    displayedFilters: query.displayedFilters,
    error,
    exporter,
    filter,
    filterValues: query.filterValues,
    hideFilter: queryModifiers.hideFilter,
    isFetching,
    isLoading,
    onSelect: selectionModifiers.select,
    onToggleItem: selectionModifiers.toggle,
    onUnselectItems: selectionModifiers.clearSelection,
    page: query.page,
    perPage: query.perPage,
    refetch,
    resource,
    selectedIds,
    setFilters: queryModifiers.setFilters,
    setPage: queryModifiers.setPage,
    setPerPage: queryModifiers.setPerPage,
    setSort: queryModifiers.setSort,
    showFilter: queryModifiers.showFilter,
    total: total,
    hasNextPage: pageInfo
      ? pageInfo.hasNextPage
      : total != null
        ? query.page * query.perPage < total
        : undefined,
    hasPreviousPage: pageInfo ? pageInfo.hasPreviousPage : query.page > 1,
  };
};

export interface ListControllerProps<RecordType extends Entity = any> {
  debounce?: number;
  disableAuthentication?: boolean;
  /**
   * Whether to disable the synchronization of the list parameters with the current location (URL search parameters)
   */
  disableSyncWithLocation?: boolean;
  exporter?: Exporter | false;
  filter?: FilterPayload;
  filterDefaultValues?: object;
  perPage?: number;
  queryOptions?: UseQueryOptions<{
    data: RecordType[];
    total?: number;
    pageInfo?: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
    };
  }>;
  resource?: string;
  sort?: SortPayload;
}

const defaultSort = {
  field: 'id',
  order: SORT_ASC,
};

export interface ListControllerResult<RecordType extends Entity = any> {
  sort: SortPayload;
  data: RecordType[];
  defaultTitle?: string;
  displayedFilters: any;
  error?: any;
  exporter?: Exporter | false;
  filter?: FilterPayload;
  filterValues: any;
  hideFilter: (filterName: string) => void;
  isFetching: boolean;
  isLoading: boolean;
  onSelect: (ids: RecordType['id'][]) => void;
  onToggleItem: (id: RecordType['id']) => void;
  onUnselectItems: () => void;
  page: number;
  perPage: number;
  refetch: UseGetListHookValue<RecordType>['refetch'];
  resource: string;
  selectedIds: RecordType['id'][];
  setFilters: (
    filters: any,
    displayedFilters: any,
    debounce?: boolean
  ) => void;
  setPage: (page: number) => void;
  setPerPage: (page: number) => void;
  setSort: (sort: SortPayload) => void;
  showFilter: (filterName: string, defaultValue: any) => void;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const injectedProps = [
  'sort',
  'data',
  'defaultTitle',
  'displayedFilters',
  'error',
  'exporter',
  'filterValues',
  'hideFilter',
  'isFetching',
  'isLoading',
  'onSelect',
  'onToggleItem',
  'onUnselectItems',
  'page',
  'perPage',
  'refetch',
  'refresh',
  'resource',
  'selectedIds',
  'setFilters',
  'setPage',
  'setPerPage',
  'setSort',
  'showFilter',
  'total',
  'totalPages',
];

/**
 * Select the props injected by the useListController hook
 * to be passed to the List children need
 * This is an implementation of pick()
 */
export const getListControllerProps = props =>
  injectedProps.reduce((acc, key) => ({ ...acc, [key]: props[key] }), {});

/**
 * Select the props not injected by the useListController hook
 * to be used inside the List children to sanitize props injected by List
 * This is an implementation of omit()
 */
export const sanitizeListRestProps = props =>
  Object.keys(props)
    .filter(propName => !injectedProps.includes(propName))
    .reduce((acc, key) => ({ ...acc, [key]: props[key] }), {});
