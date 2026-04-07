import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

const RoleGuard: React.FC<{ allow: UserRole[]; children: React.ReactNode }> = ({ allow, children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/" replace />;
  if (!allow.includes(user.role)) {
    return <Navigate to="/sales" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

export default RoleGuard;
