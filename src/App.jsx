import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AguardandoAprovacao from './pages/AguardandoAprovacao';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Plantoes from './pages/Plantoes';
import GestorPlantoes from './pages/GestorPlantoes';
import CorretorPlantoes from './pages/CorretorPlantoes';
import MeusPlantoes from './pages/MeusPlantoes';
import Agenda from './pages/Agenda';
import GestaoEquipe from './pages/GestaoEquipe';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/aguardando-aprovacao" element={<AguardandoAprovacao />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/plantoes" element={<Plantoes />} />
              <Route path="/gestor-plantoes" element={<GestorPlantoes />} />
              <Route path="/corretor-plantoes" element={<CorretorPlantoes />} />
              <Route path="/meus-plantoes" element={<MeusPlantoes />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/equipe" element={<GestaoEquipe />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
