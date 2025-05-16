
import React from 'react';
import AdminPrizeForm from './AdminPrizeForm';

export default function Admin() {
  console.log('Admin component rendering');
  
  return (
    <div>
      <div style={{
        padding: '2rem',
        fontSize: '24px',
        color: 'lime',
        background: 'black',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        ✅ TEST OK - PAGINA /admin FUNZIONANTE
      </div>
      
      <AdminPrizeForm />
    </div>
  );
}
