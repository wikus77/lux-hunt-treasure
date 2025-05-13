
import React, { Suspense } from "react";
import { ErrorBoundary } from "../components/error/ErrorBoundary";
import LoadingScreen from "../components/index/LoadingScreen";
import EventsPage from "./EventsPage";

const Events = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <EventsPage />
      </Suspense>
    </ErrorBoundary>
  );
};

export default Events;
