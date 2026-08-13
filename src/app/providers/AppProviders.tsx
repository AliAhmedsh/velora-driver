import React from 'react';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@store';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { StripeProviderWrapper } from './StripeProviderWrapper';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60_000,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <StripeProviderWrapper>
                <ThemeProvider>{children}</ThemeProvider>
              </StripeProviderWrapper>
            </AuthProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
