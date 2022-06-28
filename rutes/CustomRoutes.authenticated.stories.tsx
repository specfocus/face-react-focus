import { useAuthenticated, useLogin } from '@specfocus/view-focus.auth/providers';
import { FakeBrowserDecorator } from '@specfocus/view-focus.navigation/storybook/FakeBrowser';
import { Route } from 'react-router-dom';
import { CoreAdmin } from '../resources/CoreAdmin';
import { Resource } from '../resources/Resource';
import { CustomRoutes } from './CustomRoutes';

export default {
  title: 'view-focus/CustomRoutes/Authenticated',
  decorators: [FakeBrowserDecorator],
  parameters: {
    initialEntries: ['/authenticated'],
  },
};

export const AuthenticatedCustomRoute = (argsOrProps, context) => {
  const history = context?.history || argsOrProps.history;
  return (
    <CoreAdmin
      authProvider={authProvider}
      dataProvider={dataProvider as any}
      history={history}
      loginPage={Login}
    >
      <CustomRoutes noLayout>
        <Route
          path="/authenticated"
          element={<CustomAuthenticatedNoLayout />}
        />
      </CustomRoutes>
      <Resource name="posts" list={PostList} />
    </CoreAdmin>
  );
};

const dataProvider = {
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getOne: () => Promise.resolve({ data: { id: 0 } }),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  create: () => Promise.resolve({ data: {} }),
  update: () => Promise.resolve({ data: {} }),
  delete: () => Promise.resolve({ data: {} }),
  updateMany: () => Promise.resolve({ data: [] }),
  deleteMany: () => Promise.resolve({ data: [] }),
};

let signedIn = false;
const authProvider = {
  login: () => {
    signedIn = true;
    return Promise.resolve({ data: { id: '123' } });
  },
  logout: () => Promise.resolve(),
  checkAuth: () => (signedIn ? Promise.resolve() : Promise.reject()),
  checkError: () => Promise.reject(),
  getPermissions: () => Promise.resolve(),
};

const Login = () => {
  const login = useLogin();
  return (
    <div>
      <h1>Login page</h1>
      <button onClick={() => login({})}>Sign in</button>
    </div>
  );
};

const PostList = () => (
  <div>
    <h1>PostList page</h1>
  </div>
);

const CustomAuthenticatedNoLayout = () => {
  useAuthenticated();
  return (
    <div>
      <h1>Custom page without layout, requiring authentication</h1>
    </div>
  );
};
