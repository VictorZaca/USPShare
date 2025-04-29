import React from 'react';
// import './ProfilePage.css';

export default function ProfilePage() {
  return (
    <div className="profile">
      <div className="avatar-placeholder">👤</div>
      <h1>Enzo Spinella</h1>
      <div className="tabs">
        <button className="tab active">Meus Recursos</button>
        <button className="tab">Favoritos</button>
      </div>
      <div className="tab-content">
        <ul>
          <li>Prova P2 - Estruturas de Dados</li>
          <li>Anotações - Cálculo II</li>
        </ul>
      </div>
    </div>
  );
}