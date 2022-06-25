import { Entity } from '@specfocus/spec-focus/entities/Entity';
import { FilterPayload } from '@specfocus/view-focus.data/operations/FilterPayload';
import { SortPayload } from '@specfocus/view-focus.data/operations/SortPayload';
import { createContext } from 'react';

/**
 * Context to store choices and functions to retrieve them.
 *
 * Use the useChoicesContext() hook to read the context.
 */
export const ChoicesContext = createContext<ChoicesContextValue>(undefined);

export type ChoicesContextValue<RecordType extends Entity = any> = {
  allChoices: RecordType[];
  availableChoices: RecordType[];
  displayedFilters: any;
  error?: any;
  filter?: FilterPayload;
  filterValues: any;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  hideFilter: (filterName: string) => void;
  isFetching: boolean;
  isLoading: boolean;
  page: number;
  perPage: number;
  refetch: () => void;
  resource: string;
  selectedChoices: RecordType[];
  setFilters: (
    filters: any,
    displayedFilters: any,
    debounce?: boolean
  ) => void;
  setPage: (page: number) => void;
  setPerPage: (page: number) => void;
  setSort: (sort: SortPayload) => void;
  showFilter: (filterName: string, defaultValue: any) => void;
  sort: SortPayload;
  source: string;
  total: number;
};
