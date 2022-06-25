import { Entity } from '@specfocus/spec-focus/entities/Entity';
import { useDelete } from '@specfocus/view-focus.data/operations';
import { DeleteParams } from '@specfocus/view-focus.data/operations/delete';
import { MutationMode } from '@specfocus/view-focus.data/operations/MutationMode';
import { RedirectionSideEffect, useRedirect } from '@specfocus/view-focus.navigation/routes';
import { useNotify } from '@specfocus/view-focus.notification/providers';
import {
  ReactEventHandler,
  SyntheticEvent,
  useCallback,
  useState
} from 'react';
import { UseMutationOptions } from 'react-query';
import { useResourceContext } from '../core';
import { useUnselect } from '../lists';

/**
 * Prepare a set of callbacks for a delete button guarded by confirmation dialog
 *
 * @example
 *
 * const DeleteButton = ({
 *     resource,
 *     record,
 *     redirect,
 *     onClick,
 *     ...rest
 * }) => {
 *     const {
 *         open,
 *         isLoading,
 *         handleDialogOpen,
 *         handleDialogClose,
 *         handleDelete,
 *     } = useDeleteWithConfirmController({
 *         resource,
 *         record,
 *         redirect,
 *         onClick,
 *     });
 *
 *     return (
 *         <Fragment>
 *             <Button
 *                 onClick={handleDialogOpen}
 *                 label="action.delete"
 *                 {...rest}
 *             >
 *                 {icon}
 *             </Button>
 *             <Confirm
 *                 isOpen={open}
 *                 loading={isLoading}
 *                 title="message.delete_title"
 *                 content="message.delete_content"
 *                 translateOptions={{
 *                     name: resource,
 *                     id: record.id,
 *                 }}
 *                 onConfirm={handleDelete}
 *                 onClose={handleDialogClose}
 *             />
 *         </Fragment>
 *     );
 * };
 */
const useDeleteWithConfirmController = <RecordType extends Entity = any>(
  props: UseDeleteWithConfirmControllerParams<RecordType>
): UseDeleteWithConfirmControllerReturn => {
  const {
    record,
    redirect: redirectTo,
    mutationMode,
    onClick,
    mutationOptions,
  } = props;
  const resource = useResourceContext(props);
  const [open, setOpen] = useState(false);
  const notify = useNotify();
  const unselect = useUnselect(resource);
  const redirect = useRedirect();
  const [deleteOne, { isLoading }] = useDelete<RecordType>();

  const handleDialogOpen = e => {
    setOpen(true);
    e.stopPropagation();
  };

  const handleDialogClose = e => {
    setOpen(false);
    e.stopPropagation();
  };

  const handleDelete = useCallback(
    event => {
      event.stopPropagation();
      deleteOne(
        resource,
        { id: record.id, previousData: record },
        {
          onSuccess: () => {
            setOpen(false);
            notify('notification.deleted', {
              type: 'info',
              messageArgs: { smart_count: 1 },
              undoable: mutationMode === 'undoable',
            });
            unselect([record.id]);
            redirect(redirectTo, resource);
          },
          onError: (error: Error) => {
            setOpen(false);

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
          mutationMode,
          ...mutationOptions,
        }
      );
      if (typeof onClick === 'function') {
        onClick(event);
      }
    },
    [
      deleteOne,
      mutationMode,
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

  return {
    open,
    isLoading,
    handleDialogOpen,
    handleDialogClose,
    handleDelete,
  };
};

export interface UseDeleteWithConfirmControllerParams<
  RecordType extends Entity = any,
  MutationOptionsError = unknown
> {
  mutationMode?: MutationMode;
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

export interface UseDeleteWithConfirmControllerReturn {
  open: boolean;
  isLoading: boolean;
  handleDialogOpen: (e: SyntheticEvent) => void;
  handleDialogClose: (e: SyntheticEvent) => void;
  handleDelete: ReactEventHandler<any>;
}

export default useDeleteWithConfirmController;
