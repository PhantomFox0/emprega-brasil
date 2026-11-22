import { useEffect, useId, useState } from 'react';

const TIPOS_PERMITIDOS = [
  'image/jpeg',
  'image/jpg',
  'image/png',

];

export default function FotoPerfilInput({
  nomeUsuario = 'usuário',
  imagemAtualUrl = '',
  arquivoSelecionado = null,
  onSelecionarArquivo,
  onErroArquivo,
}) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState(imagemAtualUrl || '');

  useEffect(() => {
    if (arquivoSelecionado instanceof File) {
      const objectUrl = URL.createObjectURL(arquivoSelecionado);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreviewUrl(imagemAtualUrl || '');
    return undefined;
  }, [arquivoSelecionado, imagemAtualUrl]);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      if (typeof onErroArquivo === 'function') {
        onErroArquivo('Selecione uma imagem válida (JPG, PNG, WEBP ou GIF).');
      }
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      if (typeof onErroArquivo === 'function') {
        onErroArquivo('A imagem deve ter no máximo 5 MB.');
      }
      e.target.value = '';
      return;
    }

    if (typeof onErroArquivo === 'function') {
      onErroArquivo(null);
    }

    if (typeof onSelecionarArquivo === 'function') {
      onSelecionarArquivo(file);
    }
  }

  function handleLimparSelecao() {
    const inputEl = document.getElementById(inputId);
    if (inputEl) inputEl.value = '';
    if (typeof onSelecionarArquivo === 'function') {
      onSelecionarArquivo(null);
    }
  }

  return (
    <div className="foto-curricular-card">
      <div className="foto-curricular-frame">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`Imagem de perfil de ${nomeUsuario}`}
            className="perfil-avatar-img"
          />
        ) : (
          <div className="perfil-avatar-placeholder">
            <span>Adicione sua foto profissional</span>
          </div>
        )}
      </div>

      <div className="foto-curricular-acoes">
        <label htmlFor={inputId} className="btn-upload-foto">
          {previewUrl ? 'Alterar foto' : 'Adicionar foto'}
        </label>

        {arquivoSelecionado instanceof File && (
          <button
            type="button"
            className="btn-remover-selecao"
            onClick={handleLimparSelecao}
          >
            Descartar seleção
          </button>
        )}

        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="foto-input-oculto"
        />

        <span className="foto-curricular-ajuda">
          JPG, PNG ou WEBP até 5 MB (estilo currículo / LinkedIn).
        </span>
      </div>
    </div>
  );
}