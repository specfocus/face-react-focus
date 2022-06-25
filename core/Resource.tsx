import { Route } from '@specfocus/view-focus.navigation/routes/Route';
import { Routes } from '@specfocus/view-focus.navigation/routes/Routes';
import { isValidElement } from 'react';
import { ResourceProps } from '../types';
import { ResourceContextProvider } from './ResourceContextProvider';

export const Resource = (props: ResourceProps) => {
  const { create: Create, edit: Edit, list: List, name, show: Show } = props;

  return (
    <ResourceContextProvider value={name}>
      <Routes>
        {Create && (
          <Route
            path="create/*"
            element={isValidElement(Create) ? Create : <Create />}
          />
        )}
        {Show && (
          <Route
            path=":id/show/*"
            element={isValidElement(Show) ? Show : <Show />}
          />
        )}
        {Edit && (
          <Route
            path=":id/*"
            element={isValidElement(Edit) ? Edit : <Edit />}
          />
        )}
        {List && (
          <Route
            path="/*"
            element={isValidElement(List) ? List : <List />}
          />
        )}
      </Routes>
    </ResourceContextProvider>
  );
};

Resource.raName = 'Resource';

Resource.registerResource = ({
  create,
  edit,
  icon,
  list,
  name,
  options,
  show,
}: ResourceProps) => ({
  name,
  options,
  hasList: !!list,
  hasCreate: !!create,
  hasEdit: !!edit,
  hasShow: !!show,
  icon,
});
