import { useState } from 'react';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../services/api';

export default function AguardandoAprovacao() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleVerificar = async () => {
    setLoading(true);
    setError('');

    try {
      // Busca dados atualizados do usuário
      const updatedUser = await usersApi.login(user.email, user.password);
      
      if (updatedUser.role !== 'pendente') {
        // Atualiza o usuário no contexto e localStorage
        updateUser(updatedUser);
        // Redireciona para a página inicial
        navigate('/');
      } else {
        setError('Seu cargo ainda não foi atribuído. Aguarde o diretor.');
      }
    } catch (err) {
      setError('Erro ao verificar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Ícone animado */}
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Clock className="text-amber-600" size={48} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Aguardando Aprovação</h1>
        
        <p className="text-gray-600 mb-6">
          Olá, <span className="font-semibold">{user?.name}</span>! Sua conta foi criada com sucesso.
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-amber-800 text-sm">
              O diretor precisa atribuir um cargo à sua conta para que você possa acessar o sistema.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3 text-left">
            <h3 className="font-medium text-gray-900">Próximos passos:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                <span>Entre em contato com o diretor da sua equipe</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                <span>Informe que você criou sua conta no sistema</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                <span>Após a atribuição do cargo, clique em "Verificar Novamente"</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleVerificar}
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar Novamente'
            )}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Email cadastrado: {user?.email}
        </p>
      </div>
    </div>
  );
}
