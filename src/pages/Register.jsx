import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowRight, ArrowLeft, UserPlus, CheckCircle } from 'lucide-react';
import { usersApi } from '../services/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      await usersApi.register({ name, email, password });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Conta Criada!</h1>
            <p className="text-gray-400">
              Sua conta foi criada com sucesso. Aguarde o diretor atribuir seu cargo para ter acesso completo ao sistema.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="text-center">
              <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg mb-4">
                <p className="font-medium">Próximos passos:</p>
                <p className="text-sm mt-1">
                  Entre em contato com o diretor para que ele atribua seu cargo (Corretor, Gestor ou Recepcionista).
                </p>
              </div>
              
              <Link
                to="/login"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Ir para Login
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-gray-400">Junte-se à equipe de plantões</p>
        </div>

        {/* Register Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Repita a senha"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Criando conta...'
              ) : (
                <>
                  <UserPlus size={20} />
                  Criar Conta
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft size={16} />
              Já tem conta? Faça login
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-500 text-xs">
          <p>Após criar sua conta, o diretor irá atribuir seu cargo.</p>
        </div>
      </div>
    </div>
  );
}
