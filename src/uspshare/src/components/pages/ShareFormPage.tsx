import React, { useState } from 'react';
// import './ShareFormPage.css';

export default function ShareFormPage() {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="share-form">
      <h1>Compartilhar Recurso</h1>
      <form>
        <label>
          Título
          <input type="text" />
        </label>
        <label>
          Descrição
          <textarea />
        </label>
        <label>
          Disciplina
          <select>
            <option value="">Selecione</option>
            <option>Banco de Dados</option>
          </select>
        </label>
        <label>
          Tags (vírgula)
          <input type="text" />
        </label>
        <label>
          Arquivo
          <input type="file" onChange={e => {
            if (e.target.files) {
              setFile(e.target.files[0]);
            }
          }} />
        </label>
        <label>
          <input type="checkbox" /> Público USP
        </label>
        <label>
          <input type="checkbox" /> Somente CC
        </label>
        <button type="submit">Publicar</button>
      </form>
    </div>
  );
}