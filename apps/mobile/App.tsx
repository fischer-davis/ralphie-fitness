import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TRPCProvider } from './src/lib/trpc-provider';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <TRPCProvider>
        <AppNavigator />
      </TRPCProvider>
    </SafeAreaProvider>
  );
}
