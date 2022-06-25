import { WithPermissionsChildrenParams } from '@specfocus/view-focus.auth/providers/WithPermissions';
import { DataProvider } from '@specfocus/view-focus.data/providers/DataProvider';
import { FunctionComponent, ReactElement, ReactNode } from 'react';

/**
 * Misc types
 */

export type Dispatch<T> = T extends (...args: infer A) => any
  ? (...args: A) => void
  : never;

export type ResourceElement = ReactElement<ResourceProps>;
export type RenderResourcesFunction = (
  permissions: any
) => ResourceElement[] | Promise<ResourceElement[]>;
export type AdminChildren = RenderResourcesFunction | ReactNode;

export type TitleComponent = string | ReactElement<any>;
export type CatchAllComponent = FunctionComponent<{ title?: TitleComponent; }>;

export type LoginComponent = FunctionComponent<{}> | ReactElement<any>;
export type DashboardComponent = FunctionComponent<WithPermissionsChildrenParams>;

export interface CoreLayoutProps {
  children?: ReactNode;
  dashboard?: DashboardComponent;
  menu?: FunctionComponent<{
    hasDashboard?: boolean;
  }>;
  title?: TitleComponent;
}

export type LayoutComponent = FunctionComponent<CoreLayoutProps>;
export type LoadingComponent = FunctionComponent<{
  loadingPrimary?: string;
  loadingSecondary?: string;
}>;

export interface ResourceComponentInjectedProps {
  permissions?: any;
  resource?: string;
  options?: any;
  hasList?: boolean;
  hasEdit?: boolean;
  hasShow?: boolean;
  hasCreate?: boolean;
}

export interface ResourceOptions {
  label?: string;
  [key: string]: any;
}

export interface ResourceProps {
  intent?: 'route' | 'registration';
  name: string;
  list?: FunctionComponent<any> | ReactElement;
  create?: FunctionComponent<any> | ReactElement;
  edit?: FunctionComponent<any> | ReactElement;
  show?: FunctionComponent<any> | ReactElement;
  icon?: FunctionComponent<any>;
  options?: ResourceOptions;
}

export type Exporter = (
  data: any,
  fetchRelatedRecords: (
    data: any,
    field: string,
    resource: string
  ) => Promise<any>,
  dataProvider: DataProvider,
  resource?: string
) => void | Promise<void>;

export type SetOnSave = (
  onSave?: (values: object, redirect: any) => void
) => void;

export type FormFunctions = {
  setOnSave?: SetOnSave;
};
