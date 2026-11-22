import { useId, useState } from 'react';

// Campo de formulário com rótulo visível, dica/erro ligados por aria e botão "Mostrar" para senhas.
export default function Campo({ label, error, hint, type = 'text', ...inputProps }) {
  const id = useId();
  const mensagemId = `${id}-msg`;
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const ehSenha = type === 'password';
  const mensagem = error || hint;

  return (
    <div className={`campo ${error ? 'campo--erro' : ''}`}>
      <label htmlFor={id}>{label}</label>

      <div className="campo-controle">
        <input
          id={id}
          type={ehSenha && senhaVisivel ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={mensagem ? mensagemId : undefined}
          {...inputProps}
        />

        {ehSenha && (
          <button
            type="button"
            className="campo-toggle"
            onClick={() => setSenhaVisivel((visivel) => !visivel)}
            aria-pressed={senhaVisivel}
            aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {senhaVisivel ? 'Ocultar' : 'Mostrar'}
          </button>
        )}
      </div>

      {mensagem && (
        <p id={mensagemId} className={`campo-msg ${error ? 'campo-msg--erro' : ''}`}>
          {mensagem}
        </p>
      )}
    </div>
  );
}
