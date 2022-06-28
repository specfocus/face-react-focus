import { UseQueryOptions } from 'react-query';
import { useAuthenticated } from '@specfocus/view-focus.auth/providers';
import { useGetResourceLabel, useResourceContext } from '../resources';
import { useGetOne, UseGetOneHookValue } from '@specfocus/view-focus.data/operations';
import { useTranslate } from '@specfocus/view-focus.i18n/translations';
import { useNotify } from '@specfocus/view-focus.notification/providers';
import { useRedirect } from '@specfocus/view-focus.navigation/routes';
import { useParams } from '@specfocus/view-focus.navigation/routes/useParams';
import { Entity }  from '@specfocus/spec-focus/entities/Entity';
import { useRefresh } from '@specfocus/view-focus.data/providers/useRefresh';

/**
 * Prepare data for the Show view.
 *
 * useShowController does a few things:
 * - it grabs the id from the URL and the resource name from the ResourceContext,
 * - it fetches the record via useGetOne,
 * - it prepares the page title.
 *
 * @param {Object} props The props passed to the Show component.
 *
 * @return {Object} controllerProps Fetched data and callbacks for the Show view
 *
 * @example
 *
 * import { useShowController } from '@specfocus/view-focus.mui-demo';
 * import ShowView from './ShowView';
 *
 * const MyShow = () => {
 *     const controllerProps = useShowController();
 *     return <ShowView {...controllerProps} />;
 * };
 *
 * @example // useShowController can also take its parameters from props
 *
 * import { useShowController } from '@specfocus/view-focus.mui-demo';
 * import ShowView from './ShowView';
 *
 * const MyShow = () => {
 *     const controllerProps = useShowController({ resource: 'posts', id: 1234 });
 *     return <ShowView {...controllerProps} />;
 * };
 */
export const useShowController = <RecordType extends Entity = any>(
  props: ShowControllerProps<RecordType> = {}
): ShowControllerResult<RecordType> => {
  const { disableAuthentication, id: propsId, queryOptions = {} } = props;

  useAuthenticated({ enabled: !disableAuthentication });

  const resource = useResourceContext(props);
  const translate = useTranslate();
  const notify = useNotify();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const { id: routeId } = useParams<'id'>();
  const id = propsId != null ? propsId : decodeURIComponent(routeId);

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
      retry: false,
      ...queryOptions,
    }
  );

  // eslint-disable-next-line eqeqeq
  if (record && record.id && record.id != id) {
    throw new Error(
      `useShowController: Fetched record's id attribute (${record.id}) must match the requested 'id' (${id})`
    );
  }

  const getResourceLabel = useGetResourceLabel();
  const defaultTitle = translate('page.show', {
    name: getResourceLabel(resource, 1),
    id,
    record,
  });

  return {
    defaultTitle,
    error,
    isLoading,
    isFetching,
    record,
    refetch,
    resource,
  };
};

export interface ShowControllerProps<RecordType extends Entity = any> {
  disableAuthentication?: boolean;
  id?: RecordType['id'];
  queryOptions?: UseQueryOptions<RecordType>;
  resource?: string;
}

export interface ShowControllerResult<RecordType extends Entity = any> {
  defaultTitle: string;
  // Necessary for actions (EditActions) which expect a data prop containing the record
  // @deprecated - to be removed in 4.0d
  data?: RecordType;
  error?: any;
  isFetching: boolean;
  isLoading: boolean;
  resource: string;
  record?: RecordType;
  refetch: UseGetOneHookValue<RecordType>['refetch'];
}
