// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import BuscarVeiculos from './pages/BuscarVeiculos';
import UploadFotos from './pages/UploadFotos';
import ModeloChecklistSelection from './pages/ModeloChecklistSelection';
import ModeloChecklistEdit from './pages/ModeloChecklistEdit';
import ChecklistExecution from './pages/ChecklistExecution';
import UserRegistration from './pages/userRegistration';
import Login from './pages/Login';
import RecuperarSenha from './pages/RecuperarSenha';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<BuscarVeiculos />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/veiculos" element={<BuscarVeiculos />} />
          <Route path="/upload" element={<UploadFotos />} />
          <Route path="/modelos" element={<ModeloChecklistSelection />} />
          <Route path="/modelos/novo" element={<ModeloChecklistEdit />} />
          <Route path="/modelos/:modeloId" element={<ModeloChecklistEdit />} />
          <Route path="/checklist" element={<ChecklistExecution />} />
          <Route path="/cadastro" element={<UserRegistration />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;