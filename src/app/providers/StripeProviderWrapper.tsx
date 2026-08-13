import React, { useEffect } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@env';
import { configureGoogleSignIn } from '../../services/googleAuth';

export function StripeProviderWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const key = STRIPE_PUBLISHABLE_KEY ?? '';
  if (!key) {
    return <>{children}</>;
  }

  return (
    <StripeProvider publishableKey={key} merchantIdentifier="merchant.com.veloradriver">
      {children}
    </StripeProvider>
  );
}
