import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Campo from '../components/Campo';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../services/apiError';

const ESTADO_INICIAL = { nome: '', email: '', usuario: '', senha: '', confirmarSenha: '' };

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Sem "@" no usuário: o login aceita e-mail ou usuário no mesmo campo e os dois não podem se confundir.
const REGEX_USUARIO = /^[a-zA-Z0-9._-]{3,30}$/;

function validar(form) {
  const erros = {};

  if (form.nome.trim().length < 2) erros.nome = 'Informe seu nome completo.';
  if (!REGEX_EMAIL.test(form.email.trim())) erros.email = 'Informe um e-mail válido, como nome@exemplo.com.';
  if (!REGEX_USUARIO.test(form.usuario.trim())) {
    erros.usuario = 'Use de 3 a 30 caracteres: letras, números, ponto, hífen ou sublinhado.';
  }
  if (form.senha.length < 8 || form.senha.length > 72) {
    erros.senha = 'A senha precisa ter de 8 a 72 caracteres.';
  }
  if (form.confirmarSenha !== form.senha) erros.confirmarSenha = 'As senhas não são iguais.';

  return erros;
}

export default function Cadastro() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [form, setForm] = useState(ESTADO_INICIAL);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Leva o foco ao primeiro campo com erro depois que a tela é atualizada.
  useEffect(() => {
    formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [erros]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
    if (erros[name]) setErros((anteriores) => ({ ...anteriores, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (carregando) return;

    setErroGeral('');
    const encontrados = validar(form);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setCarregando(true);
    try {
      await register({
        nome: form.nome.trim(),
        email: form.email.trim(),
        usuario: form.usuario.trim(),
        senha: form.senha,
      });
    } catch (error) {
      const mensagem = getErrorMessage(error, 'Não foi possível criar a conta. Tente novamente.');
      if (error.response?.status === 409 && /e-?mail/i.test(mensagem)) {
        setErros({ email: mensagem });
      } else if (error.response?.status === 409) {
        setErros({ usuario: mensagem });
      } else {
        setErroGeral(mensagem);
      }
      setCarregando(false);
      return;
    }

    // Conta criada: entra direto e leva a pessoa para completar o perfil.
    try {
      await login({ username: form.usuario.trim(), password: form.senha });
      navigate('/perfil', { replace: true, state: { primeiroAcesso: true } });
    } catch {
      navigate('/login', {
        replace: true,
        state: { aviso: 'Conta criada! Entre com seu e-mail ou usuário e sua senha.' },
      });
    }
  }

  return (
    <AuthLayout
      painelTitulo="Comece pelo perfil."
      painelTexto="Crie sua conta, conte suas habilidades e encontre vagas nas principais plataformas do país."
      titulo="Criar conta"
      subtitulo="Leva um minuto. Os dados profissionais você completa depois."
      rodape={
        <>
          Já tem conta? <Link to="/login">Entrar</Link>
        </>
      }
    >
      <form className="auth-form" ref={formRef} onSubmit={handleSubmit} noValidate>
        {erroGeral && (
          <p className="auth-erro" role="alert">
            {erroGeral}
          </p>
        )}

        <Campo
          label="Nome completo"
          name="nome"
          autoComplete="name"
          autoFocus
          value={form.nome}
          onChange={handleChange}
          error={erros.nome}
        />

        <Campo
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={form.email}
          onChange={handleChange}
          error={erros.email}
        />

        <Campo
          label="Nome de usuário"
          name="usuario"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={form.usuario}
          onChange={handleChange}
          error={erros.usuario}
          hint="Você poderá entrar com ele ou com o e-mail."
        />

        <Campo
          label="Senha"
          type="password"
          name="senha"
          autoComplete="new-password"
          value={form.senha}
          onChange={handleChange}
          error={erros.senha}
          hint="De 8 a 72 caracteres."
        />

        <Campo
          label="Confirmar senha"
          type="password"
          name="confirmarSenha"
          autoComplete="new-password"
          value={form.confirmarSenha}
          onChange={handleChange}
          error={erros.confirmarSenha}
        />

        <button type="submit" className="btn btn--primario auth-enviar" disabled={carregando}>
          {carregando ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>
    </AuthLayout>
  );
}
