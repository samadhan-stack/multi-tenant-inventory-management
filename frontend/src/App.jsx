
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import PurchaseOrders from "./pages/PurchaseOrders";
import SalesOrders from "./pages/SalesOrders";
import Inventory from "./pages/Inventory";
import Register from "./pages/Register";
import Users from "./pages/Users";

function App() {
  return (
      <BrowserRouter>
        <AuthProvider>
          <Routes>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/purchase-orders" element={<PurchaseOrders />} />
                <Route path="/sales-orders" element={<SalesOrders />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/users" element={<Users />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
  );
}

export default App;
