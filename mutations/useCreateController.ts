import { useAuthenticated } from '@specfocus/view-focus.auth/providers';
import { Entity } from '@specfocus/spec-focus/entities/Entity';
import { useCreate, UseCreateMutateParams } from '@specfocus/view-focus.data/operations';
import { TransformData } from '@specfocus/view-focus.data/providers/DataProvider';
import { RedirectionSideEffect, useRedirect } from '@specfocus/view-focus.navigation/routes';
import { useLocation } from '@specfocus/view-focus.navigation/routes/useLocation';
import { useNotify } from '@specfocus/view-focus.notification/providers';
import { Location } from 'history';
import { parse } from 'query-string';
import { useCallback } from 'react';
import { UseMutationOptions } from 'react-query';
import {
  useGetResourceLabel,
  useResourceContext,
  useResourceDefinition
} from '../core';
import { useTranslate } from '@specfocus/view-focus.i18n/i18n';
import { SaveContextValue } from './SaveContext';
import { useMutationMiddlewares } from './useMutationMiddlewares';

/**
 * Prepare data for the Create view
 *
 * @param {Object} props The props passed to the Create component.
 *
 * @return {Object} controllerProps Fetched data and callbacks for the Create view
 *
 * @example
 *
 * import { useCreateController } from '@specfocus/view-focus.mui-demo';
 * import CreateView from './CreateView';
 *
 * const MyCreate = props => {
 *     const controllerProps = useCreateController(props);
 *     return <CreateView {...controllerProps} {...props} />;
 * }
 */
export const useCreateController = <
  RecordType extends Entity = Entity,
  MutationOptionsError = unknown
>(
  props: CreateControllerProps<RecordType, MutationOptionsError> = {}
): CreateControllerResult<RecordType> => {
  const {
    disableAuthentication,
    record,
    redirect: redirectTo,
    transform,
    mutationOptions = {},
  } = props;

  useAuthenticated({ enabled: !disableAuthentication });
  const resource = useResourceContext(props);
  const { hasEdit, hasShow } = useResourceDefinition(props);
  const finalRedirectTo =
    redirectTo ?? getDefaultRedirectRoute(hasShow, hasEdit);
  const location = useLocation();
  const translate = useTranslate();
  const notify = useNotify();
  const redirect = useRedirect();
  const recordToUse = record ?? getRecordFromLocation(location) ?? undefined;
  const { onSuccess, onError, ...otherMutationOptions } = mutationOptions;
  const {
    registerMutationMiddleware,
    getMutateWithMiddlewares,
    unregisterMutationMiddleware,
  } = useMutationMiddlewares();

  const [create, { isLoading: saving }] = useCreate<
    RecordType,
    MutationOptionsError
  >(resource, undefined, otherMutationOptions);

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
          ? transformFromSave(data)
          : transform
            ? transform(data)
            : data
      ).then((data: Partial<RecordType>) => {
        const mutate = getMutateWithMiddlewares(create);
        mutate(
          resource,
          { data },
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

              notify('notification.created', {
                type: 'info',
                messageArgs: { smart_count: 1 },
              });
              redirect(finalRedirectTo, resource, data.id, data);
            },
            onError: onErrorFromSave
              ? onErrorFromSave
              : onError
                ? onError
                : (error: Error) => {
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
      create,
      finalRedirectTo,
      getMutateWithMiddlewares,
      notify,
      onError,
      onSuccess,
      redirect,
      resource,
      transform,
    ]
  );

  const getResourceLabel = useGetResourceLabel();
  const defaultTitle = translate('page.create', {
    name: getResourceLabel(resource, 1),
  });

  return {
    isFetching: false,
    isLoading: false,
    saving,
    defaultTitle,
    save,
    resource,
    record: recordToUse,
    redirect: finalRedirectTo,
    registerMutationMiddleware,
    unregisterMutationMiddleware,
  };
};

export interface CreateControllerProps<
  RecordType extends Entity = Entity,
  MutationOptionsError = unknown
> {
  disableAuthentication?: boolean;
  hasEdit?: boolean;
  hasShow?: boolean;
  record?: Partial<RecordType>;
  redirect?: RedirectionSideEffect;
  resource?: string;
  mutationOptions?: UseMutationOptions<
    RecordType,
    MutationOptionsError,
    UseCreateMutateParams<RecordType>
  >;
  transform?: TransformData;
}

export interface CreateControllerResult<RecordType extends Entity = Entity>
  extends SaveContextValue {
  // Necessary for actions (EditActions) which expect a data prop containing the record
  // @deprecated - to be removed in 4.0d
  data?: RecordType;
  defaultTitle: string;
  isFetching: boolean;
  isLoading: boolean;
  record?: Partial<RecordType>;
  redirect: RedirectionSideEffect;
  resource: string;
}

/**
 * Get the initial record from the location, whether it comes from the location
 * state or is serialized in the url search part.
 */
export const getRecordFromLocation = ({ state, search }: Location) => {
  if (state && (state as StateWithRecord).record) {
    return (state as StateWithRecord).record;
  }
  if (search) {
    try {
      const searchParams = parse(search);
      if (searchParams.source) {
        if (Array.isArray(searchParams.source)) {
          console.error(
            `Failed to parse location search parameter '${search}'. To pre-fill some fields in the Create form, pass a stringified source parameter (e.g. '?source={"title":"foo"}')`
          );
          return;
        }
        return JSON.parse(searchParams.source);
      }
    } catch (e) {
      console.error(
        `Failed to parse location search parameter '${search}'. To pre-fill some fields in the Create form, pass a stringified source parameter (e.g. '?source={"title":"foo"}')`
      );
    }
  }
  return null;
};

type StateWithRecord = {
  record?: Partial<Entity>;
};

const getDefaultRedirectRoute = (hasShow, hasEdit) => {
  if (hasEdit) {
    return 'edit';
  }
  if (hasShow) {
    return 'show';
  }
  return 'list';
};
