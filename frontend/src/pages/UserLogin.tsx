import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserLogin() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nome.trim() || !telefone.trim()) {
      setError('Preencha nome e telefone.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${telefone}`);
      if (res.status === 304) {
        
      }
      if (res.ok) {
        let user = null;
        let rawText = '';
        try {
          rawText = await res.text();
          user = JSON.parse(rawText);
        } catch (e) {
          setError('Erro ao buscar usuário. Resposta recebida: ' + rawText);
          setLoading(false);
          return;
        }
        if (user && user.nome) {
          localStorage.setItem('nome', user.nome);
          localStorage.setItem('telefone', user.telefone);
          localStorage.setItem('userId', user.id);
          navigate('/chat');
          setLoading(false);
          return;
        }
      } else if (res.status === 404) {
        const createRes = await fetch('api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, telefone }),
        });
        if (createRes.ok) {
          const user = await createRes.json();
          localStorage.setItem('nome', user.nome);
          localStorage.setItem('telefone', user.telefone);
          localStorage.setItem('userId', user.id);
          navigate('/chat');
        } else {
          const err = await createRes.json();
          setError(err.error || 'Erro ao cadastrar usuário');
        }
      } else {
        setError('Erro ao buscar usuário');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #f7b733 0%, #fc4a1a 100%)' }}>
      <div style={{ width: 370, padding: 32, borderRadius: 16, background: '#fff', boxShadow: '0 4px 24px #0002', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <img src="https://cdn-icons-png.flaticon.com/512/3132/3132693.png" alt="Pizza" style={{ width: 64, marginBottom: 8 }} />
          <h2 style={{ margin: 0, fontWeight: 700, color: '#fc4a1a', fontSize: 28 }}>Bem-vindo à Pizzaria!</h2>
          <p style={{ color: '#555', marginTop: 8, fontSize: 15 }}>Preencha seus dados para começar o atendimento</p>
        </div>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600, color: '#333' }}>Nome do cliente</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', marginTop: 6, borderRadius: 8, border: '1px solid #ddd', fontSize: 16, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }}
              placeholder="Digite seu nome"
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600, color: '#333' }}>Telefone</label>
            <input
              type="tel"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', marginTop: 6, borderRadius: 8, border: '1px solid #ddd', fontSize: 16, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }}
              placeholder="Digite seu telefone"
            />
          </div>
          {error && <div style={{ color: '#d32f2f', marginBottom: 10, textAlign: 'center', fontWeight: 500 }}>{error}</div>}
          <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 8, background: 'linear-gradient(90deg, #fc4a1a 0%, #f7b733 100%)', color: '#fff', fontWeight: 700, fontSize: 17, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px #fc4a1a22', transition: 'background 0.2s' }} disabled={loading}>
            {loading ? 'Carregando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}