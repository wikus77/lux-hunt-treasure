
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AdminPrizeForm() {
  const [loading, setLoading] = useState(false);
  const [connectionTest, setConnectionTest] = useState<{success: boolean, message: string} | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    power: '',
    engine: '',
    acceleration: '',
    traction: ''
  });

  // Test Supabase connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('prizes').select('count()');
        
        if (error) {
          console.error('Supabase connection test failed:', error);
          setConnectionTest({ success: false, message: `Error: ${error.message}` });
          return;
        }
        
        console.log('Supabase connection successful:', data);
        setConnectionTest({ success: true, message: `Connection successful. Found records: ${data?.[0]?.count || 0}` });
      } catch (err) {
        console.error('Exception during Supabase test:', err);
        setConnectionTest({ success: false, message: `Exception: ${err instanceof Error ? err.message : String(err)}` });
      }
    };
    
    testConnection();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('prizes')
        .insert([formData]);
        
      if (error) throw error;
      
      toast.success('Premio aggiunto con successo!');
      // Reset form
      setFormData({
        name: '',
        description: '',
        image_url: '',
        power: '',
        engine: '',
        acceleration: '',
        traction: ''
      });
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      toast.error('Errore durante il salvataggio del premio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Aggiungi Nuovo Premio</h1>
      
      {/* Connection Test Banner */}
      {connectionTest && (
        <div className={`mb-6 p-4 rounded-md ${connectionTest.success ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
          <p className="font-medium">
            {connectionTest.success ? '✅ ' : '❌ '}
            Database Connection: {connectionTest.message}
          </p>
        </div>
      )}
      
      <div className="glass-card max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-200">Nome Auto</label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-gray-800 border-gray-700"
              placeholder="Ferrari 488 GTB"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-200">Descrizione</label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="bg-gray-800 border-gray-700"
              placeholder="Eleganza italiana e prestazioni incredibili in pista"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-200">URL Immagine</label>
            <Input
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              required
              className="bg-gray-800 border-gray-700"
              placeholder="/lovable-uploads/your-image-id.png"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="power" className="block text-sm font-medium text-gray-200">Potenza</label>
              <Input
                id="power"
                name="power"
                value={formData.power}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700"
                placeholder="670 CV"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="acceleration" className="block text-sm font-medium text-gray-200">0-100 km/h</label>
              <Input
                id="acceleration"
                name="acceleration"
                value={formData.acceleration}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700"
                placeholder="3.0s"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="engine" className="block text-sm font-medium text-gray-200">Motore</label>
              <Input
                id="engine"
                name="engine"
                value={formData.engine}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700"
                placeholder="V8 Turbo"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="traction" className="block text-sm font-medium text-gray-200">Cambio</label>
              <Input
                id="traction"
                name="traction"
                value={formData.traction}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700"
                placeholder="Automatico 7"
              />
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:opacity-90"
            >
              {loading ? 'Salvataggio...' : 'Salva Premio'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
