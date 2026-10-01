import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

function App() {
  return (
    <AppProviders>
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </AppProviders>
  );
}

export default App;
