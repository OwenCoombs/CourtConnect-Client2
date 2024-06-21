import React from 'react';
import ReactDOM from 'react-dom';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from 'react-router-dom';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';

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
import LiveFeed from './LiveFeed';

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
          {
            path: '/livefeed',
            element: <LiveFeed />
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ContextProvider>
      <RouterProvider router={router} />
      <ToastContainer
           position="top-left"
           closeOnClick
           transition={Bounce}
           toastStyle={{ color: '#8A3324' }}
           
           
      />
    </ContextProvider>
  </React.StrictMode>
);
