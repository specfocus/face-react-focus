import { createContext } from 'react';
import { ShowControllerResult } from './useShowController';

/**
 * Context to store the result of the useShowController() hook.
 *
 * Use the useShowContext() hook to read the context. That's what the Show components do in @specfocus/view-focus.mui-demo.
 *
 * @example
 *
 * import { useShowController, ShowContextProvider } from '@specfocus/view-focus';
 *
 * const Show = props => {
 *     const controllerProps = useShowController(props);
 *     return (
 *         <ShowContextProvider value={controllerProps}>
 *             ...
 *         </ShowContextProvider>
 *     );
 * };
 */
export const ShowContext = createContext<ShowControllerResult>({
  record: null,
  defaultTitle: null,
  isFetching: null,
  isLoading: null,
  refetch: null,
  resource: null,
});

ShowContext.displayName = 'ShowContext';
