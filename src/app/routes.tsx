import { createBrowserRouter } from "react-router";
import HomePage from "./pages/HomePage";
import BookDetailPage from "./pages/BookDetailPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPanel from "./pages/AdminPanel";
import NotFoundPage from "./pages/NotFoundPage";
import StatisticsPage from "./pages/StatisticsPage";
import ApiDocumentationPage from "./pages/ApiDocumentationPage";

// Generate a hashed route for admin panel
const ADMIN_ROUTE = 'admin_abdulaziz787';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/book/:id",
    element: <BookDetailPage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/statistics",
    element: <StatisticsPage />,
  },
  {
    path: "/api",
    element: <ApiDocumentationPage />,
  },
  {
    path: `/${ADMIN_ROUTE}`,
    element: <AdminPanel />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export { ADMIN_ROUTE };