import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, hasRole } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Check Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login', { replace: true });
        return;
      }

      // If we have a session but no user in store, fetch user data
      if (!user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          useAuthStore.getState().setUser(userData);
        } else {
          // User record doesn't exist, sign out
          await supabase.auth.signOut();
          navigate('/login', { replace: true });
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [navigate, user]);

  // Check role requirements
  useEffect(() => {
    if (!isChecking && requiredRoles && user) {
      if (!hasRole(requiredRoles)) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isChecking, requiredRoles, user, hasRole, navigate]);

  // Show loading state
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (redirect happens in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // If role check fails, don't render children (redirect happens in useEffect)
  if (requiredRoles && !hasRole(requiredRoles)) {
    return null;
  }

  return <>{children}</>;
}
