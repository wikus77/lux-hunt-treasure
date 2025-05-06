
import React from 'react';

const Admin = () => {
  return (
    <div className="min-h-screen bg-black p-6">
      <h1 className="text-3xl font-orbitron text-cyan-400 mb-4">Pannello Amministratore</h1>
      <p className="text-white mb-4">Questa pagina è in fase di sviluppo.</p>
      
      <div className="bg-zinc-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl text-white mb-2">Funzionalità in arrivo:</h2>
        <ul className="list-disc pl-5 text-gray-300">
          <li>Gestione utenti</li>
          <li>Statistiche newsletter</li>
          <li>Analisi conversioni</li>
          <li>Gestione campagne marketing</li>
          <li>Dashboard analitica</li>
        </ul>
      </div>
    </div>
  );
};

export default Admin;
