import React from 'react';
import { Link } from 'react-router-dom';
// import './ResourceListPage.css';

export default function ResourceListPage() {
  return (
    <div className="resource-list">
      <div className="filters">
        <select>
          <option value="">Tipo</option>
          <option>Anotações</option>
          <option>Provas</option>
          <option>Resumos</option>
          <option>Exercícios</option>
        </select>
        <select>
          <option value="">Disciplina</option>
          <option>Algoritmos</option>
        </select>
        <select>
          <option value="">Semestre</option>
          <option>2025/1</option>
        </select>
        <select>
          <option value="">Ordenar</option>
          <option>Mais Recentes</option>
          <option>Melhor Avaliados</option>
        </select>
      </div>
      <div className="card-grid-2">
        {[1,2,3,4].map(id => (
          <div key={id} className="card">
            <Link to={`/resources/${id}`}><h3>Recurso {id}</h3></Link>
            <p>Disciplina Exemplo</p>
          </div>
        ))}
      </div>
    </div>
  );
}