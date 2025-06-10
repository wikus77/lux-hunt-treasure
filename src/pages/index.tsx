
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeveloperAutoLogin } from '@/hooks/useDeveloperAutoLogin';
import IndexContent from '@/components/index/IndexContent';

const Index = () => {
  const navigate = useNavigate();
  
  // Enable developer auto-login for iPhone/Capacitor
  useDeveloperAutoLogin();

  return <IndexContent />;
};

export default Index;
