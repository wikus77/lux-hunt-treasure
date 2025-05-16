
import React, { useEffect } from 'react';
import AdminPrizeForm from './AdminPrizeForm';
import { toast } from 'sonner';

export default function Admin() {
  console.log('Admin component rendering');
  
  useEffect(() => {
    // Show a toast notification when the Admin component mounts
    toast.success('Admin page loaded successfully', {
      duration: 5000,
    });
  }, []);
  
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
