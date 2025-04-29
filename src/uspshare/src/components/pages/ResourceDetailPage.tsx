import React from 'react';
import { useParams, Link } from 'react-router-dom';
// import './ResourceDetailPage.css';

export default function ResourceDetailPage() {
  const { id } = useParams();
  return (
    <div className="resource-detail">
      <Link to="/resources">← Voltar</Link>
      <h1>Recurso {id}</h1>
      <p>Disciplina: Exemplo • Autor: Fulano • 15/03/2025</p>
      <div className="actions">
        <button>Download</button>
        <button>Favoritar</button>
        <button>Avaliar ★★★★☆</button>
      </div>
      <section>
        <h2>Descrição</h2>
        <p>Descrição detalhada do recurso.</p>
      </section>
      <section>
        <h2>Comentários</h2>
        <p>Maria: "Ótimo material!"</p>
      </section>
    </div>
  );
}