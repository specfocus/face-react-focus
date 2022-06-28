import React from 'react';
import { ReactNode } from 'react';
import { ResourceContextProvider } from '../resources';
import { Entity }  from '@specfocus/spec-focus/entities/Entity';
import { EditContextProvider } from './EditContextProvider';
import { EditControllerProps, useEditController } from './useEditController';

/**
 * Call useEditController and put the value in a EditContext
 *
 * Base class for <Edit> components, without UI.
 *
 * Accepts any props accepted by useEditController:
 * - id: The record identifier
 * - resource: The resource
 *
 * @example // Custom edit layout
 *
 * const PostEdit = () => (
 *     <EditBase resource="posts">
 *         <Grid container>
 *             <Grid item xs={8}>
 *                 <SimpleForm>
 *                     ...
 *                 </SimpleForm>
 *             </Grid>
 *             <Grid item xs={4}>
 *                 Edit instructions...
 *             </Grid>
 *         </Grid>
 *         <div>
 *             Post related links...
 *         </div>
 *     </EditBase>
 * );
 */
export const EditBase = <RecordType extends Entity = any>({
  children,
  ...props
}: { children: ReactNode; } & EditControllerProps<RecordType>) => {
  const controllerProps = useEditController<RecordType>(props);
  const body = (
    <EditContextProvider value={controllerProps}>
      {children}
    </EditContextProvider>
  );
  return props.resource ? (
    // support resource override via props
    <ResourceContextProvider value={props.resource}>
      {body}
    </ResourceContextProvider>
  ) : (
    body
  );
};
