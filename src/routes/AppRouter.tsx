// src/routes/AppRouter.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import MainLayout from '../components/layout/MainLayout'
import { useAuth } from '../hooks/useAuth'
import type { Role } from '../types/Role'

import Home from '../pages/home/Home'
import Sales from '../pages/sales/Sales'
import Orders from '../pages/orders/Orders'
import Reports from '../pages/reports/Reports'
import Products from '../pages/products/Products'
import Refill from '../pages/refill/Refill'
import Users from '../pages/users/Users'
import SaleForm from '../pages/sales/SaleForm'
import SaleDetail from '../pages/sales/SaleDetail'
import OrdersPage from '../pages/orders/Orders'
import OrderForm from '../pages/orders/OrderForm'
import OrderDetail from '../pages/orders/OrderDetail'
import RefillDetailPage from '../pages/refill/RefillDetail'
import RefillFormPage from '../pages/refill/RefillForm'

import Login from '../pages/auth/Login'
import NotFound from '../pages/NotFound'

function ProtectedRoute({ allowedRoles, children }: { allowedRoles: Role[], children: ReactNode }) {
  const { role } = useAuth()
  if (!role) return <Navigate to="/login" />
  if (!allowedRoles.includes(role)) return <Navigate to="/" />
  return children
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/sales/new" element={<SaleForm />} />
        <Route path="/sales/:id" element={<SaleDetail />} />
        <Route path="/sales/orders" element={<OrdersPage />} />
        <Route path="/orders/new" element={<OrderForm />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/orders/:id/edit" element={<OrderForm />} />
        
        {/* Refill - Lista de pedidos grandes */}
        <Route path="/refill" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'REFILL', 'SELLER']}>
            <Refill />
          </ProtectedRoute>
        } />
        
        {/* Refill Detail - Detalle de productos del pedido */}
        <Route path="/refill/:id" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'REFILL', 'SELLER']}>
            <RefillDetailPage />
          </ProtectedRoute>
        } />
        
        {/* Refill Form - Agregar productos (solo ADMIN y SUPERVISOR) */}
        <Route path="/refill/:id/add-products" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR']}>
            <RefillFormPage />
          </ProtectedRoute>
        } />
        
        {/* Refill Form - Editar producto (solo ADMIN y SUPERVISOR) */}
        <Route path="/refill/:id/edit-product/:productId" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR']}>
            <RefillFormPage />
          </ProtectedRoute>
        } />

        <Route
          path="/reports"
          element={<ProtectedRoute allowedRoles={['ADMIN']}><Reports /></ProtectedRoute>}
        />
        <Route
          path="/users"
          element={<ProtectedRoute allowedRoles={['ADMIN']}><Users /></ProtectedRoute>}
        />
        <Route
          path="/products"
          element={<ProtectedRoute allowedRoles={['ADMIN','SUPERVISOR']}><Products /></ProtectedRoute>}
        />
        <Route
          path="/refill"
          element={<ProtectedRoute allowedRoles={['ADMIN','SUPERVISOR','REFILL']}><Refill /></ProtectedRoute>}
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
