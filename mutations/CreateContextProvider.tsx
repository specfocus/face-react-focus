import React from 'react';
import { ReactNode } from 'react';
import { Entity }  from '@specfocus/spec-focus/entities/Entity';
import { RecordContextProvider } from '../records/RecordContext';
import { CreateContext } from './CreateContext';
import { CreateControllerResult } from './useCreateController';
import { SaveContextProvider } from './SaveContextProvider';
import { usePickSaveContext } from './usePickSaveContext';

/**
 * Create a Create Context.
 *
 * @example
 *
 * const MyCreate = (props) => {
 *     const controllerProps = useCreateController(props);
 *     return (
 *         <CreateContextProvider value={controllerProps}>
 *             <MyCreateView>
 *         </CreateContextProvider>
 *     );
 * };
 *
 * const MyCreateView = () => {
 *     const record = useRecordContext();
 *     // or, to rerender only when the save operation change but not data
 *     const { saving } = useCreateContext();
 * }
 *
 * @see CreateContext
 * @see RecordContext
 */
export const CreateContextProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: CreateControllerResult;
}) => (
  <CreateContext.Provider value={value}>
    <SaveContextProvider
      value={{
        ...usePickSaveContext(value),
        mutationMode: 'pessimistic',
      }}
    >
      <RecordContextProvider<Partial<Entity>>
        value={value && value.record}
      >
        {children}
      </RecordContextProvider>
    </SaveContextProvider>
  </CreateContext.Provider>
);
