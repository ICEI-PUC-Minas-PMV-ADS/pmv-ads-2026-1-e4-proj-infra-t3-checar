import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Layout from './components/Layout';
import BuscarVeiculos from './pages/BuscarVeiculos';
import UploadFotos from './pages/UploadFotos';
import ModeloChecklistSelection from './pages/ModeloChecklistSelection';
import ModeloChecklistEdit from './pages/ModeloChecklistEdit';
import ChecklistExecution from './pages/ChecklistExecution';
import UserRegistration from './pages/userRegistration';
import Login from './pages/Login';
import RecuperarSenha from './pages/RecuperarSenha';
import PoliticaPrivacidade from './pages/PoliticaPrivacidade';
import Relatorios from './pages/Relatorios';
import Historico from './pages/Historico';
import Notificacoes from './pages/Notificacoes';
import Exportacoes from './pages/Exportacoes';

// Auth-aware redirect: goes directly to /login or /veiculos without a double-hop
function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#00112b]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00b7eb] border-t-transparent" />
      </div>
    );
  }
  return <Navigate to={isAuthenticated ? '/veiculos' : '/login'} replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes — apenas login e cadastro */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/cadastro" element={<PublicRoute><UserRegistration /></PublicRoute>} />
            {/* Fluxo de autenticação (acessível sem login) */}
            <Route path="/recuperar-senha" element={<PublicRoute><RecuperarSenha /></PublicRoute>} />
            <Route path="/privacidade" element={<PoliticaPrivacidade />} />

            {/* Root: auth-aware redirect (no double-hop through ProtectedRoute) */}
            <Route path="/" element={<RootRedirect />} />

            {/* Protected routes */}
            <Route path="/veiculos" element={<ProtectedRoute><BuscarVeiculos /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><UploadFotos /></ProtectedRoute>} />
            <Route path="/modelos" element={<ProtectedRoute><ModeloChecklistSelection /></ProtectedRoute>} />
            <Route path="/modelos/novo" element={<ProtectedRoute><ModeloChecklistEdit /></ProtectedRoute>} />
            <Route path="/modelos/:modeloId" element={<ProtectedRoute><ModeloChecklistEdit /></ProtectedRoute>} />
            <Route path="/checklist/:modeloId" element={<ProtectedRoute><ChecklistExecution /></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
            <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
            <Route path="/notificacoes" element={<ProtectedRoute><Notificacoes /></ProtectedRoute>} />
            <Route path="/exportacoes" element={<ProtectedRoute><Exportacoes /></ProtectedRoute>} />

            {/* Fallback: same auth-aware logic */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
