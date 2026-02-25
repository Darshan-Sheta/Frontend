// ProtectedRoute.js
import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { Navigate } from 'react-router-dom';

import DashboardSkeleton from '../components/shimmer/DashboardSkeleton';

function ProtectedRoute({ children }) {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <DashboardSkeleton />;

    if (!user) {
        return <Navigate to="/" />;
    }

    return children;
}

export default ProtectedRoute;
