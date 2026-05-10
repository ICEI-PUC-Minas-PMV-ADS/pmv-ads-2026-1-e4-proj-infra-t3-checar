// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import BuscarVeiculos from './pages/BuscarVeiculos';
import UploadFotos from './pages/UploadFotos';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<BuscarVeiculos />} />
          <Route path="/veiculos" element={<BuscarVeiculos />} />
          <Route path="/upload" element={<UploadFotos />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;