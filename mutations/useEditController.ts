import { Entity } from '@specfocus/spec-focus/entities/Entity';
import { useAuthenticated } from '@specfocus/view-focus.auth/providers';
import {
  useGetOne,
  UseGetOneHookValue,
  useUpdate,
  UseUpdateMutateParams
} from '@specfocus/view-focus.data/operations';
import { MutationMode } from '@specfocus/view-focus.data/operations/MutationMode';
import { TransformData } from '@specfocus/view-focus.data/providers/DataProvider';
import { useRefresh } from '@specfocus/view-focus.data/providers/useRefresh';
import { RedirectionSideEffect, useRedirect } from '@specfocus/view-focus.navigation/routes';
import { useParams } from '@specfocus/view-focus.navigation/routes/useParams';
import { useNotify } from '@specfocus/view-focus.notification/providers';
import { useCallback } from 'react';
import { UseMutationOptions, UseQueryOptions } from 'react-query';
import { useGetResourceLabel, useResourceContext } from '../core';
import { useTranslate } from '@specfocus/view-focus.i18n/i18n';
import { SaveContextValue } from './SaveContext';
import { useMutationMiddlewares } from './useMutationMiddlewares';

/**
 * Prepare data for the Edit view.
 *
 * useEditController does a few things:
 * - it grabs the id from the URL and the resource name from the ResourceContext,
 * - it fetches the record via useGetOne,
 * - it prepares the page title.
 *
 * @param {Object} props The props passed to the Edit component.
 *
 * @return {Object} controllerProps Fetched data and callbacks for the Edit view
 *
 * @example
 *
 * import { useEditController } from '@specfocus/view-focus.mui-demo';
 * import EditView from './EditView';
 *
 * const MyEdit = () => {
 *     const controllerProps = useEditController({ resource: 'posts', id: 123 });
 *     return <EditView {...controllerProps} {...props} />;
 * }
 */
export const useEditController = <
  RecordType extends Entity = any,
  MutationOptionsError = unknown
>(
  props: EditControllerProps<RecordType, MutationOptionsError> = {}
): EditControllerResult<RecordType> => {
  const {
    disableAuthentication,
    id: propsId,
    mutationMode = 'undoable',
    mutationOptions = {},
    queryOptions = {},
    redirect: redirectTo = DefaultRedirect,
    transform,
  } = props;
  useAuthenticated({ enabled: !disableAuthentication });
  const resource = useResourceContext(props);
  const translate = useTranslate();
  const notify = useNotify();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const { id: routeId } = useParams<'id'>();
  const id = propsId != null ? propsId : decodeURIComponent(routeId);
  const { onSuccess, onError, ...otherMutationOptions } = mutationOptions;
  const {
    registerMutationMiddleware,
    getMutateWithMiddlewares,
    unregisterMutationMiddleware,
  } = useMutationMiddlewares();
  const { data: record, error, isLoading, isFetching, refetch } = useGetOne<
    RecordType
  >(
    resource,
    { id },
    {
      onError: () => {
        notify('notification.item_doesnt_exist', {
          type: 'warning',
        });
        redirect('list', resource);
        refresh();
      },
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
      ...queryOptions,
    }
  );

  // eslint-disable-next-line eqeqeq
  if (record && record.id && record.id != id) {
    throw new Error(
      `useEditController: Fetched record's id attribute (${record.id}) must match the requested 'id' (${id})`
    );
  }

  const getResourceLabel = useGetResourceLabel();
  const defaultTitle = translate('page.edit', {
    name: getResourceLabel(resource, 1),
    id,
    record,
  });

  const recordCached = { id, previousData: record };

  const [update, { isLoading: saving }] = useUpdate<
    RecordType,
    MutationOptionsError
  >(resource, recordCached, { ...otherMutationOptions, mutationMode });

  const save = useCallback(
    (
      data: Partial<RecordType>,
      {
        onSuccess: onSuccessFromSave,
        onError: onErrorFromSave,
        transform: transformFromSave,
      }: any = {}
    ) =>
      Promise.resolve(
        transformFromSave
          ? transformFromSave(data, {
            previousData: recordCached.previousData,
          })
          : transform
            ? transform(data, {
              previousData: recordCached.previousData,
            })
            : data
      ).then((data: Partial<RecordType>) => {
        const mutate = getMutateWithMiddlewares(update);
        return mutate(
          resource,
          { id, data },
          {
            onSuccess: async (data, variables, context) => {
              if (onSuccessFromSave) {
                return onSuccessFromSave(
                  data,
                  variables,
                  context
                );
              }

              if (onSuccess) {
                return onSuccess(data, variables, context);
              }

              notify('notification.updated', {
                type: 'info',
                messageArgs: { smart_count: 1 },
                undoable: mutationMode === 'undoable',
              });
              redirect(redirectTo, resource, data.id, data);
            },
            onError: onErrorFromSave
              ? onErrorFromSave
              : onError
                ? onError
                : (error: Error | string) => {
                  notify(
                    typeof error === 'string'
                      ? error
                      : error.message ||
                      'notification.http_error',
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
          }
        );
      }),
    [
      id,
      getMutateWithMiddlewares,
      mutationMode,
      notify,
      onError,
      onSuccess,
      redirect,
      redirectTo,
      resource,
      transform,
      update,
      recordCached.previousData,
    ]
  );

  return {
    defaultTitle,
    error,
    isFetching,
    isLoading,
    mutationMode,
    record,
    redirect: DefaultRedirect,
    refetch,
    registerMutationMiddleware,
    resource,
    save,
    saving,
    unregisterMutationMiddleware,
  };
};

export interface EditControllerProps<
  RecordType extends Entity = any,
  MutationOptionsError = unknown
> {
  disableAuthentication?: boolean;
  id?: RecordType['id'];
  mutationMode?: MutationMode;
  mutationOptions?: UseMutationOptions<
    RecordType,
    MutationOptionsError,
    UseUpdateMutateParams<RecordType>
  >;
  queryOptions?: UseQueryOptions<RecordType>;
  redirect?: RedirectionSideEffect;
  resource?: string;
  transform?: TransformData;
  [key: string]: any;
}

export interface EditControllerResult<RecordType extends Entity = any>
  extends SaveContextValue {
  // Necessary for actions (EditActions) which expect a data prop containing the record
  // @deprecated - to be removed in 4.0d
  data?: RecordType;
  error?: any;
  defaultTitle: string;
  isFetching: boolean;
  isLoading: boolean;
  record?: RecordType;
  refetch: UseGetOneHookValue<RecordType>['refetch'];
  redirect: RedirectionSideEffect;
  resource: string;
}

const DefaultRedirect = 'list';
