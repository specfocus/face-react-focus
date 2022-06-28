import { AuthContext, convertLegacyAuthProvider } from '@specfocus/view-focus.auth/providers';
import type { AuthProvider, LegacyAuthProvider } from '@specfocus/view-focus.auth/providers/AuthProvider';
import {
  convertLegacyDataProvider,
  DataProviderContext,
  defaultDataProvider
} from '@specfocus/view-focus.data/providers';
import { DataProvider, LegacyDataProvider } from '@specfocus/view-focus.data/providers/DataProvider';
import { TranslationContextProvider, I18nProvider } from '@specfocus/view-focus.i18n/translations/TranslationContextProvider';
import { AdminRouter } from '@specfocus/view-focus.navigation/routes';
import { NotificationContextProvider } from '@specfocus/view-focus.notification/providers';
import { memoryStore, Store, StoreContextProvider } from '@specfocus/view-focus.states/states';
import { History } from 'history';
import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import type { AdminChildren, DashboardComponent } from '../types';
import { ResourceDefinitionContextProvider } from './ResourceDefinitionContext';

export interface CoreAdminContextProps {
  authProvider?: AuthProvider | LegacyAuthProvider;
  basename?: string;
  children?: AdminChildren;
  dashboard?: DashboardComponent;
  dataProvider?: DataProvider | LegacyDataProvider;
  store?: Store;
  queryClient?: QueryClient;
  /**
   * @deprecated Wrap your Admin inside a Router to change the routing strategy
   */
  history?: History;
  i18nProvider?: I18nProvider;
  theme?: object;
}

export const CoreAdminContext = (props: CoreAdminContextProps) => {
  const {
    authProvider,
    basename,
    dataProvider,
    i18nProvider,
    store,
    children,
    history,
    queryClient,
  } = props;

  if (!dataProvider) {
    throw new Error(`Missing dataProvider prop.
React-admin requires a valid dataProvider function to work.`);
  }

  const finalQueryClient = useMemo(() => queryClient || new QueryClient(), [
    queryClient,
  ]);

  const finalAuthProvider = useMemo(
    () =>
      authProvider instanceof Function
        ? convertLegacyAuthProvider(authProvider)
        : authProvider,
    [authProvider]
  );

  const finalDataProvider = useMemo(
    () =>
      dataProvider instanceof Function
        ? convertLegacyDataProvider(dataProvider)
        : dataProvider,
    [dataProvider]
  );

  return (
    <AuthContext.Provider value={finalAuthProvider}>
      <DataProviderContext.Provider value={finalDataProvider}>
        <StoreContextProvider value={store}>
          <QueryClientProvider client={finalQueryClient}>
            <AdminRouter history={history} basename={basename}>
              <TranslationContextProvider value={i18nProvider}>
                <NotificationContextProvider>
                  <ResourceDefinitionContextProvider>
                    {children}
                  </ResourceDefinitionContextProvider>
                </NotificationContextProvider>
              </TranslationContextProvider>
            </AdminRouter>
          </QueryClientProvider>
        </StoreContextProvider>
      </DataProviderContext.Provider>
    </AuthContext.Provider>
  );
};

CoreAdminContext.defaultProps = {
  dataProvider: defaultDataProvider,
  store: memoryStore(),
};
