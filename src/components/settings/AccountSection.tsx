
import { User, Shield, CreditCard, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AccountSection = () => {
  const navigate = useNavigate();

  return (
    <section className="p-4">
      <h2 className="text-xl font-bold mb-4">Account</h2>
      
      <div className="space-y-2">
        <div 
          className="glass-card flex justify-between items-center p-4 cursor-pointer"
          onClick={() => navigate('/personal-info')}
        >
          <div className="flex items-center">
            <User className="h-5 w-5 mr-3 text-projectx-neon-blue" />
            <span>Informazioni Personali</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div 
          className="glass-card flex justify-between items-center p-4 cursor-pointer"
          onClick={() => navigate('/privacy-security')}
        >
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-3 text-projectx-neon-blue" />
            <span>Privacy e Sicurezza</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>

        <div 
          className="glass-card flex justify-between items-center p-4 cursor-pointer"
          onClick={() => navigate('/payment-methods')}
        >
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 mr-3 text-projectx-neon-blue" />
            <span>Metodi di Pagamento</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div 
          className="glass-card flex justify-between items-center p-4 cursor-pointer"
          onClick={() => navigate('/subscriptions')}
        >
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-3 text-projectx-neon-blue" />
            <span>Abbonamento</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
};

export default AccountSection;
