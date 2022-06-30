import React from 'react';

import { BaseRootContext, BaseRootContextProps } from './BaseRootContext';
import { BaseRootLayout, BaseRootLayoutProps } from './BaseRootLayout';

/**
 * Main admin component, entry point to the application.
 *
 * Initializes the various contexts (auth, data, i18n, router)
 * and defines the main routes.
 *
 * Expects a list of resources as children, or a function returning a list of
 * resources based on the permissions.
 *
 * @example
 *
 * // static list of resources
 *
 * import {
 *     BaseRoot,
 *     Resource,
 *     ListGuesser,
 *     useDataProvider,
 * } from '@specfocus/view-focus';
 *
 * const App = () => (
 *     <BaseRoot dataProvider={myDataProvider}>
 *         <Resource name="posts" list={ListGuesser} />
 *     </BaseRoot>
 * );
 *
 * // dynamic list of resources based on permissions
 *
 * import {
 *     BaseRoot,
 *     Resource,
 *     ListGuesser,
 *     useDataProvider,
 * } from '@specfocus/view-focus';
 *
 * const App = () => (
 *     <BaseRoot dataProvider={myDataProvider}>
 *         {permissions => [
 *             <Resource name="posts" key="posts" list={ListGuesser} />,
 *         ]}
 *     </BaseRoot>
 * );
 *
 * // If you have to build a dynamic list of resources using a side effect,
 * // you can't use <BaseRoot>. But as it delegates to sub components,
 * // it's relatively straightforward to replace it:
 *
 * import React from 'react';
 * import { useEffect, useState } from 'react';
 * import {
 *     BaseRootContext,
 *     BaseRootUI,
 *     Resource,
 *     ListGuesser,
 *     useDataProvider,
 * } from '@specfocus/view-focus';
 *
 * const App = () => (
 *     <BaseRootContext dataProvider={myDataProvider}>
 *         <UI />
 *     </BaseRootContext>
 * );
 *
 * const UI = () => {
 *     const [resources, setResources] = useState([]);
 *     const dataProvider = useDataProvider();
 *     useEffect(() => {
 *         dataProvider.introspect().then(r => setResources(r));
 *     }, []);
 *
 *     return (
 *         <BaseRootUI>
 *             {resources.map(resource => (
 *                 <Resource name={resource.name} key={resource.key} list={ListGuesser} />
 *             ))}
 *         </BaseRootUI>
 *     );
 * };
 */
export const BaseRoot = (props: BaseRootProps) => {
  const {
    authProvider,
    basename,
    catchAll,
    children,
    dashboard,
    dataProvider,
    disableTelemetry,
    history,
    translator,
    queryClient,
    layout,
    loading,
    loginPage,
    menu, // deprecated, use a custom layout instead
    ready,
    requireAuth,
    title = 'React Admin',
  } = props;
  return (
    <BaseRootContext
      authProvider={authProvider}
      basename={basename}
      dataProvider={dataProvider}
      translator={translator}
      queryClient={queryClient}
      history={history}
    >
      <BaseRootLayout
        layout={layout}
        dashboard={dashboard}
        disableTelemetry={disableTelemetry}
        menu={menu}
        catchAll={catchAll}
        title={title}
        loading={loading}
        loginPage={loginPage}
        requireAuth={requireAuth}
        ready={ready}
      >
        {children}
      </BaseRootLayout>
    </BaseRootContext>
  );
};

export type BaseRootProps = BaseRootContextProps & BaseRootLayoutProps;
