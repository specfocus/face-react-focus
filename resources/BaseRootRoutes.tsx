import { useCheckAuth, WithPermissions } from '@specfocus/view-focus.auth/providers';
import { useCreatePath, useScrollToTop } from '@specfocus/view-focus.navigation/routes';
import { Route } from '@specfocus/view-focus.navigation/routes/Route';
import { Routes } from '@specfocus/view-focus.navigation/routes/Routes';
import { Navigate } from '@specfocus/view-focus.navigation/routes/useNavigate';
import { useTimeout } from '@specfocus/view-focus.states/states/useTimeout';
import { Children, FunctionComponent, useEffect, useState } from 'react';
import {
  CatchAllComponent,
  CoreLayoutProps,
  LayoutComponent,
  LoadingComponent,
  ResourceChildren
} from '../types';
import { useConfigureAdminRouterFromChildren } from './useConfigureAdminRouterFromChildren';

export const BaseRootRoutes = (props: BaseRootRoutesProps) => {
  const oneSecondHasPassed = useTimeout(1000);
  useScrollToTop();
  const createPath = useCreatePath();

  const {
    customRoutesWithLayout,
    customRoutesWithoutLayout,
    status,
    resources,
  } = useConfigureAdminRouterFromChildren(props.children);

  const {
    layout: Layout,
    catchAll: CatchAll,
    dashboard,
    loading: LoadingPage,
    menu,
    requireAuth,
    ready: Ready,
    title,
  } = props;

  const [canRender, setCanRender] = useState(!requireAuth);
  const checkAuth = useCheckAuth();

  useEffect(() => {
    if (requireAuth) {
      checkAuth()
        .then(() => {
          setCanRender(true);
        })
        .catch(() => { });
    }
  }, [checkAuth, requireAuth]);

  if (status === 'empty') {
    return <Ready />;
  }

  if (status === 'loading' || !canRender) {
    return (
      <Routes>
        <>
          {customRoutesWithoutLayout}
          {oneSecondHasPassed ? (
            <Route path="*" element={<LoadingPage />} />
          ) : (
            <Route path="*" element={null} />
          )}
        </>
      </Routes>
    );
  }

  return (
    <Routes>
      <>
        {/*
                Render the custom routes that were outside the child function.
            */}
        {customRoutesWithoutLayout}
        <Route
          path="/*"
          element={
            <div>
              <Layout dashboard={dashboard} menu={menu} title={title}>
                <Routes>
                  <>
                    {customRoutesWithLayout}
                    {Children.map(resources, resource => (
                      <Route
                        key={resource.props.name}
                        path={`${resource.props.name}/*`}
                        element={resource as any}
                      />
                    ))}
                    <Route
                      path="/"
                      element={
                        dashboard ? (
                          <WithPermissions
                            authParams={defaultAuthParams}
                            component={dashboard}
                          />
                        ) : resources.length > 0 ? (
                          <Navigate
                            to={createPath({
                              resource:
                                resources[0].props.name,
                              type: 'list',
                            })}
                          />
                        ) : null
                      }
                    />
                    <Route
                      path="*"
                      element={<CatchAll title={title} />}
                    />
                  </>
                </Routes>
              </Layout>
            </div>
          }
        />
      </>
    </Routes>
  );
};

BaseRootRoutes.defaultProps = {
  customRoutes: [],
};

export interface BaseRootRoutesProps extends Omit<CoreLayoutProps, 'children'> {
  layout: LayoutComponent;
  catchAll: CatchAllComponent;
  children?: ResourceChildren;
  loading: LoadingComponent;
  requireAuth?: boolean;
  ready?: FunctionComponent;
}

const defaultAuthParams = { route: 'dashboard' };
