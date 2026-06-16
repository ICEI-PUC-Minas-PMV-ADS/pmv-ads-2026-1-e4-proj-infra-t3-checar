import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
            <Route path="/cadastro" element={<UserRegistration />} />
            <Route path="/privacidade" element={<PoliticaPrivacidade />} />

            {/* Redirect root to vehicles list */}
            <Route path="/" element={<Navigate to="/veiculos" replace />} />

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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/veiculos" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
