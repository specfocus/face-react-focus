import React from 'react';
import { createContext, ReactNode } from 'react';
import { Entity }  from '@specfocus/spec-focus/entities/Entity';

/**
 * Context to store a record.
 *
 * @see RecordContextProvider
 * @see useRecordContext
 */
export const RecordContext = createContext<Entity | Omit<Entity, 'id'>>(
  undefined
);

RecordContext.displayName = 'RecordContext';

/**
 * Provider for the Record Context, to store a record.
 *
 * Use the useRecordContext() hook to read the context.
 * That's what the Edit and Show components do in @specfocus/view-focus.mui-demo.
 *
 * Many @specfocus/view-focus.mui-demo components read the RecordContext, including all Field
 * components.
 *
 * @example
 *
 * import { useGetOne, RecordContextProvider } from '@specfocus/view-focus';
 *
 * const Show = ({ resource, id }) => {
 *     const { data } = useGetOne(resource, { id });
 *     return (
 *         <RecordContextProvider value={data}>
 *             ...
 *         </RecordContextProvider>
 *     );
 * };
 */
export const RecordContextProvider = <
  RecordType extends Entity | Omit<Entity, 'id'> = Entity
>({
  children,
  value,
}: RecordContextProviderProps<RecordType>) => (
  <RecordContext.Provider value={value}>{children}</RecordContext.Provider>
);

export interface RecordContextProviderProps<RecordType> {
  children: ReactNode;
  value?: RecordType;
}
