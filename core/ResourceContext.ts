import { createContext } from 'react';

/**
 * Context to store the current resource name.
 *
 * Use the useResource() hook to read the context. That's what most components do in @specfocus/view-focus.mui-demo.
 *
 * @example
 *
 * import { useResourceContext, useTranslate } from '@specfocus/view-focus';
 *
 * const MyCustomEditTitle = props => {
 *     const name = useResourceContext(props);
 *
 *     return (
 *         <h1>{translate(`${name}.name`)}</h1>
 *     );
 * };
 */
export const ResourceContext = createContext<ResourceContextValue>(undefined);

export type ResourceContextValue = string;
