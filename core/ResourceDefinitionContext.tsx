import type { ResourceDefinition } from '@specfocus/spec-focus/resources/ResourceDefinition';
import isEqual from 'lodash/isEqual';
import { createContext, useCallback, useMemo, useState } from 'react';

export type ResourceDefinitions = {
  [name: string]: ResourceDefinition;
};

export type ResourceDefinitionContextValue = {
  definitions: ResourceDefinitions;
  register: (config: ResourceDefinition) => void;
  unregister: (config: ResourceDefinition) => void;
};

export const ResourceDefinitionContext = createContext<
  ResourceDefinitionContextValue
>({
  definitions: {},
  register: () => { },
  unregister: () => { },
});

/**
 * Context to store the current resource Definition.
 *
 * Use the useResourceDefinition() hook to read the context.
 *
 * @example
 *
 * import { useResourceDefinition, useTranslate } from '@specfocus/view-focus';
 *
 * const PostMenuItem = () => {
 *     const { name, icon } = useResourceDefinition({ resource: 'posts' });
 *
 *     return (
 *          <MenuItem>
 *              <ListItemIcon>{icon}</ListItemIcon>
 *              {name}
 *          </MenuItem>
 *     );
 * };
 */
export const ResourceDefinitionContextProvider = ({
  definitions: defaultDefinitions = {},
  children,
}) => {
  const [definitions, setState] = useState<ResourceDefinitions>(
    defaultDefinitions
  );

  const register = useCallback((config: ResourceDefinition) => {
    setState(prev =>
      isEqual(prev[config.name], config)
        ? prev
        : {
          ...prev,
          [config.name]: config,
        }
    );
  }, []);

  const unregister = useCallback((config: ResourceDefinition) => {
    setState(prev => {
      const { [config.name]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const contextValue = useMemo(
    () => ({ definitions, register, unregister }),
    [definitions] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <ResourceDefinitionContext.Provider value={contextValue}>
      {children}
    </ResourceDefinitionContext.Provider>
  );
};
