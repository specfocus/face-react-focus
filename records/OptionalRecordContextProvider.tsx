import React from 'react';
import { ReactElement } from 'react';
import { Entity }  from '@specfocus/spec-focus/entities/Entity';
import { RecordContextProvider } from './RecordContext';

/**
 * Wrap children with a RecordContext provider only if the value is defined.
 *
 * Allows a component to work outside of a record context.
 *
 * @example
 *
 * import { OptionalRecordContextProvider, TextField } from '@specfocus/view-focus.mui-demo';
 *
 * const RecordTitle = ({ record }) => (
 *     <OptionalRecordContextProvider value={record}>
 *         <TextField source="title" />
 *     </OptionalRecordContextProvider>
 * );
 */
export const OptionalRecordContextProvider = <
  RecordType extends Entity | Omit<Entity, 'id'> = Entity
>({
  value,
  children,
}: {
  children: ReactElement;
  value?: RecordType;
}) =>
  value ? (
    <RecordContextProvider value={value}>{children}</RecordContextProvider>
  ) : (
    children
  );
