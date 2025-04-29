import React from 'react';
// import './HomePage.css';

export default function HomePage() {
  return (
    <div className="home">
      <h1>Bem-vindo ao USPShare</h1>
      <input
        type="text"
        placeholder="Buscar provas, resumos, exercícios..."
        className="search-input"
      />
      <div className="card-grid">
        <div className="card">
          <h2>Provas Recentes</h2>
          <p>Prova P1 - Algoritmos 1</p>
        </div>
        <div className="card">
          <h2>Resumos Populares</h2>
          <p>Resumo de Estruturas de Dados</p>
        </div>
        <div className="card">
          <h2>Exercícios em Alta</h2>
          <p>Lista - Cálculo II</p>
        </div>
      </div>
    </div>
  );
}