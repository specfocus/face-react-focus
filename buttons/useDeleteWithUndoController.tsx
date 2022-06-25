import { Entity }  from '@specfocus/spec-focus/entities/Entity';;
import { useDelete } from '@specfocus/view-focus.data/operations';
import { DeleteParams } from '@specfocus/view-focus.data/operations/delete';
import { RedirectionSideEffect, useRedirect } from '@specfocus/view-focus.navigation/routes';
import { useNotify } from '@specfocus/view-focus.notification/providers';
import { ReactEventHandler, useCallback } from 'react';
import { UseMutationOptions } from 'react-query';
import { useResourceContext } from '../core';
import { useUnselect } from '../lists';

/**
 * Prepare callback for a Delete button with undo support
 *
 * @example
 *
 * import React from 'react';
 * import ActionDelete from '@mui/icons-material/Delete';
 * import { Button, useDeleteWithUndoController } from '@specfocus/view-focus.mui-demo';
 *
 * const DeleteButton = ({
 *     resource,
 *     record,
 *     redirect,
 *     onClick,
 *     ...rest
 * }) => {
 *     const { isLoading, handleDelete } = useDeleteWithUndoController({
 *         resource,
 *         record,
 *         redirect,
 *         onClick,
 *     });
 *
 *     return (
 *         <Button
 *             onClick={handleDelete}
 *             disabled={isLoading}
 *             label="action.delete"
 *             {...rest}
 *         >
 *             <ActionDelete />
 *         </Button>
 *     );
 * };
 */
const useDeleteWithUndoController = <RecordType extends Entity = any>(
  props: UseDeleteWithUndoControllerParams<RecordType>
): UseDeleteWithUndoControllerReturn => {
  const {
    record,
    redirect: redirectTo = 'list',
    onClick,
    mutationOptions,
  } = props;
  const resource = useResourceContext(props);
  const notify = useNotify();
  const unselect = useUnselect(resource);
  const redirect = useRedirect();
  const [deleteOne, { isLoading }] = useDelete<RecordType>();

  const handleDelete = useCallback(
    event => {
      event.stopPropagation();
      deleteOne(
        resource,
        { id: record.id, previousData: record },
        {
          onSuccess: () => {
            notify('notification.deleted', {
              type: 'info',
              messageArgs: { smart_count: 1 },
              undoable: true,
            });
            unselect([record.id]);
            redirect(redirectTo, resource);
          },
          onError: (error: Error) => {
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
            );
          },
          mutationMode: 'undoable',
          ...mutationOptions,
        }
      );
      if (typeof onClick === 'function') {
        onClick(event);
      }
    },
    [
      deleteOne,
      mutationOptions,
      notify,
      onClick,
      record,
      redirect,
      redirectTo,
      resource,
      unselect,
    ]
  );

  return { isLoading, handleDelete };
};

export interface UseDeleteWithUndoControllerParams<
  RecordType extends Entity = any,
  MutationOptionsError = unknown
> {
  record?: RecordType;
  redirect?: RedirectionSideEffect;
  // @deprecated. This hook get the resource from the context
  resource?: string;
  onClick?: ReactEventHandler<any>;
  mutationOptions?: UseMutationOptions<
    RecordType,
    MutationOptionsError,
    DeleteParams<RecordType>
  >;
}

export interface UseDeleteWithUndoControllerReturn {
  isLoading: boolean;
  handleDelete: ReactEventHandler<any>;
}

export default useDeleteWithUndoController;
