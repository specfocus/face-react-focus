import { Route } from '@specfocus/view-focus.navigation/routes/Route';
import { Routes } from '@specfocus/view-focus.navigation/routes/Routes';
import { ComponentType, createElement, isValidElement, useEffect } from 'react';
import {
  ResourceChildren,
  CatchAllComponent,
  CoreLayoutProps,
  DashboardComponent,
  LayoutComponent,
  LoadingComponent,
  LoginComponent,
  TitleComponent
} from '../types';
import { Ready } from '../utils';
import { BaseRootRoutes } from './BaseRootRoutes';

export type ChildrenFunction = () => ComponentType[];

const DefaultLayout = ({ children }: CoreLayoutProps) => <>{children}</>;

export interface BaseRootLayoutProps {
  catchAll?: CatchAllComponent;
  children?: ResourceChildren;
  dashboard?: DashboardComponent;
  disableTelemetry?: boolean;
  layout?: LayoutComponent;
  loading?: LoadingComponent;
  loginPage?: LoginComponent | boolean;
  /**
   * @deprecated use a custom layout instead
   */
  menu?: ComponentType;
  requireAuth?: boolean;
  ready?: ComponentType;
  title?: TitleComponent;
}

export const BaseRootLayout = (props: BaseRootLayoutProps) => {
  const {
    catchAll = Noop,
    children,
    dashboard,
    disableTelemetry = false,
    layout = DefaultLayout,
    loading = Noop,
    loginPage: LoginPage = false,
    menu, // deprecated, use a custom layout instead
    ready = Ready,
    title = 'React Admin',
    requireAuth = false,
  } = props;

  useEffect(() => {
    if (
      disableTelemetry ||
      process.env.NODE_ENV !== 'production' ||
      typeof window === 'undefined' ||
      typeof window.location === 'undefined' ||
      typeof Image === 'undefined'
    ) {
      return;
    }
    const img = new Image();
    img.src = `https://@specfocus/view-focus.mui-demo-telemetry.marmelab.com/@specfocus/view-focus.mui-demo-telemetry?domain=${window.location.hostname}`;
  }, [disableTelemetry]);

  return (
    <Routes>
      {LoginPage !== false && LoginPage !== true ? (
        // @ts-ignore
        <Route path="/login" element={createOrGetElement(LoginPage)} />
      ) : null}
      <Route
        path="/*"
        element={
          <BaseRootRoutes
            catchAll={catchAll}
            dashboard={dashboard}
            layout={layout}
            loading={loading}
            menu={menu as any}
            requireAuth={requireAuth}
            ready={ready as any}
            title={title}
          >
            {children}
          </BaseRootRoutes>
        }
      />
    </Routes>
  );
};

const createOrGetElement = el => (isValidElement(el) ? el : createElement(el));

const Noop = () => null;
