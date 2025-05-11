
import { Route } from "react-router-dom";
import NotFound from "../pages/NotFound";

export const NotFoundRoute = () => {
  return <Route path="*" element={<NotFound />} />;
};
