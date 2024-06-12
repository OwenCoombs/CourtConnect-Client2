import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from 'react-router-dom';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";

// project styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import CreateNewUser from './CreateNewUser';
import App from './App';
import ErrorPage from './ErrorPage';
import Header from './Header';
import Footer from './Footer';
import Login from './Login';
import { ContextProvider } from './context';  // Import from context.jsx
import ProfilePage from './profile';
import ProtectedRoute from './protected';
import PlayNow from './Play';

function Layout() {
  return (
    <>
      <Header />
      <div id='page-content'>
        <Outlet />
      </div>
      <Footer />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <App />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/createnewuser',
        element: <CreateNewUser />,
      },
      {
        element: <ProtectedRoute />, // Use the ProtectedRoute here
        children: [
          {
            path: '/profilepage',
            element: <ProfilePage />,
          },
          {
            path: '/playnow',
            element: <PlayNow />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <ContextProvider>
    <RouterProvider router={router} />
  </ContextProvider>
);
