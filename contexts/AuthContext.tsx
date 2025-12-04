import React from 'react';
// Auth Removed.
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => <>{children}</>;
export const useAuth = () => ({});