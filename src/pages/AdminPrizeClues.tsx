
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Search, Filter, Download, Award } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth';

interface PrizeFormData {
  title: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface PrizeClue {
  id?: string;
  prize_id: string;
  week: number;
  description_it: string;
  description_en: string;
  description_fr: string;
  clue_type: string;
}

interface Prize {
  id: string;
  title: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminPrizeClues() {
  const [loading, setLoading] = useState(false);
  const [generatingClues, setGeneratingClues] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [filteredPrizes, setFilteredPrizes] = useState<Prize[]>([]);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [prizeClues, setPrizeClues] = useState<Record<string, PrizeClue[]>>({});
  
  const [formData, setFormData] = useState<PrizeFormData>({
    title: '',
    city: '',
    address: '',
    latitude: 0,
    longitude: 0,
    radius: 500,
    start_date: '',
    end_date: '',
    is_active: true
  });

  const { hasRole, isRoleLoading } = useAuthContext();
  const isAdmin = hasRole('admin');
  
  useEffect(() => {
    if (!isRoleLoading && !isAdmin) {
      toast.error("Accesso non autorizzato");
      return;
    }
    
    fetchPrizes();
  }, [isAdmin, isRoleLoading]);
  
  useEffect(() => {
    if (!prizes) return;
    
    const filtered = prizes.filter(prize => {
      const matchesCity = !citySearch || prize.city.toLowerCase().includes(citySearch.toLowerCase());
      const matchesStatus = filterActive === null || prize.is_active === filterActive;
      return matchesCity && matchesStatus;
    });
    
    setFilteredPrizes(filtered);
  }, [prizes, citySearch, filterActive]);

  const fetchPrizes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPrizes(data || []);
      setFilteredPrizes(data || []);
      
      // Fetch clues for each prize
      for (const prize of data || []) {
        fetchCluesForPrize(prize.id);
      }
    } catch (error) {
      console.error('Error fetching prizes:', error);
      toast.error('Errore durante il caricamento dei premi');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCluesForPrize = async (prizeId: string) => {
    try {
      const { data, error } = await supabase
        .from('prize_clues')
        .select('*')
        .eq('prize_id', prizeId)
        .order('week', { ascending: true });
        
      if (error) throw error;
      
      setPrizeClues(prev => ({
        ...prev,
        [prizeId]: data || []
      }));
    } catch (error) {
      console.error(`Error fetching clues for prize ${prizeId}:`, error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked
    }));
  };
  
  const handleDateChange = (date: Date | undefined, field: 'start_date' | 'end_date') => {
    if (!date) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: date.toISOString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error("Solo gli amministratori possono aggiungere premi");
      return;
    }
    
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.title || !formData.city || !formData.address || !formData.start_date || !formData.end_date) {
        toast.error('Tutti i campi sono obbligatori');
        return;
      }
      
      // Insert prize
      const { data, error } = await supabase
        .from('prizes')
        .insert([formData])
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Premio aggiunto con successo!');
      
      // Reset form
      setFormData({
        title: '',
        city: '',
        address: '',
        latitude: 0,
        longitude: 0,
        radius: 500,
        start_date: '',
        end_date: '',
        is_active: true
      });
      
      // Refresh prizes list
      fetchPrizes();
    } catch (error) {
      console.error('Error saving prize:', error);
      toast.error('Errore durante il salvataggio del premio');
    } finally {
      setLoading(false);
    }
  };
  
  const generateClues = async (prizeId: string, city: string, address: string) => {
    if (!isAdmin) {
      toast.error("Solo gli amministratori possono generare indizi");
      return;
    }
    
    try {
      setGeneratingClues(true);
      
      // Call AI function to generate clues
      const { data: generatedData, error: generatorError } = await supabase.functions.invoke('generate-prize-clues', {
        body: {
          prizeId,
          city,
          address
        }
      });
      
      if (generatorError) throw generatorError;
      
      if (!generatedData || !generatedData.clues || generatedData.clues.length === 0) {
        throw new Error("Nessun indizio generato");
      }
      
      // Insert generated clues
      const { error: insertError } = await supabase
        .from('prize_clues')
        .insert(generatedData.clues.map((clue: any, index: number) => ({
          prize_id: prizeId,
          week: index + 1,
          description_it: clue.italian,
          description_en: clue.english,
          description_fr: clue.french,
          clue_type: 'weekly'
        })));
        
      if (insertError) throw insertError;
      
      toast.success('Indizi generati con successo!');
      fetchCluesForPrize(prizeId);
    } catch (error: any) {
      console.error('Error generating clues:', error);
      toast.error(`Errore durante la generazione degli indizi: ${error.message}`);
    } finally {
      setGeneratingClues(false);
    }
  };
  
  const sendManualBuzzClue = async (prizeId: string) => {
    if (!isAdmin) {
      toast.error("Solo gli amministratori possono inviare indizi Buzz");
      return;
    }
    
    try {
      setLoading(true);
      
      // Call edge function to send manual buzz clue
      const { error } = await supabase.functions.invoke('send-buzz-clue', {
        body: { prizeId, isManualTrigger: true }
      });
      
      if (error) throw error;
      
      toast.success('Indizio Buzz inviato manualmente con successo!');
    } catch (error: any) {
      console.error('Error sending manual buzz clue:', error);
      toast.error(`Errore durante l'invio dell'indizio Buzz: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const exportPrizes = () => {
    if (!prizes.length) {
      toast.error('Nessun premio da esportare');
      return;
    }
    
    const prizesWithClues = prizes.map(prize => {
      const clues = prizeClues[prize.id] || [];
      return {
        ...prize,
        clues: clues.map(clue => ({
          week: clue.week,
          description_it: clue.description_it,
          description_en: clue.description_en,
          description_fr: clue.description_fr,
          clue_type: clue.clue_type
        }))
      };
    });
    
    const dataStr = JSON.stringify(prizesWithClues, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileName = `m1ssion_prizes_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  };
  
  if (!isAdmin && !isRoleLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold text-center text-red-500">
          Accesso non autorizzato
        </h1>
        <p className="text-center mt-4">
          Questa sezione è riservata agli amministratori.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Gestione Indizi Premio</h1>
      
      <Tabs defaultValue="new">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="new">Nuovo Premio</TabsTrigger>
          <TabsTrigger value="list">Lista Premi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Aggiungi Nuovo Premio</CardTitle>
              <CardDescription>
                Inserisci i dettagli del premio per generare gli indizi automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titolo Premio</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ferrari 488 GTB"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">Città</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Milano"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Indirizzo Completo</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Piazza Duomo, 1"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitudine</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="45.4642"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitudine</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="9.1900"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="radius">Area stimata in metri</Label>
                  <Input
                    id="radius"
                    name="radius"
                    type="number"
                    value={formData.radius}
                    onChange={handleChange}
                    placeholder="500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Inizio</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.start_date ? (
                            format(new Date(formData.start_date), 'PPP')
                          ) : (
                            <span>Seleziona data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.start_date ? new Date(formData.start_date) : undefined}
                          onSelect={(date) => handleDateChange(date, 'start_date')}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Data Fine</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.end_date ? (
                            format(new Date(formData.end_date), 'PPP')
                          ) : (
                            <span>Seleziona data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.end_date ? new Date(formData.end_date) : undefined}
                          onSelect={(date) => handleDateChange(date, 'end_date')}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="is_active" 
                    checked={formData.is_active} 
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="is_active">Attivo</Label>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Salvataggio...' : 'Salva Premio'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Cerca per città..."
                    className="pl-8"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFilterActive(null)}
                  className={filterActive === null ? "bg-primary/20" : ""}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Tutti
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFilterActive(true)}
                  className={filterActive === true ? "bg-primary/20" : ""}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Attivi
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFilterActive(false)}
                  className={filterActive === false ? "bg-primary/20" : ""}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Non Attivi
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportPrizes}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Esporta
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-10">Caricamento premi...</div>
            ) : filteredPrizes.length === 0 ? (
              <div className="text-center py-10">Nessun premio trovato</div>
            ) : (
              <div className="space-y-6">
                {filteredPrizes.map((prize) => (
                  <Card key={prize.id} className="overflow-hidden">
                    <CardHeader className={`${prize.is_active ? 'bg-green-900/20' : 'bg-gray-900/20'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{prize.title}</CardTitle>
                          <CardDescription>
                            {prize.city}, {prize.address}
                          </CardDescription>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded text-xs ${prize.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {prize.is_active ? 'Attivo' : 'Non attivo'}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid gap-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-sm font-medium">Data Inizio:</p>
                            <p className="text-sm">{format(new Date(prize.start_date), 'dd/MM/yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Data Fine:</p>
                            <p className="text-sm">{format(new Date(prize.end_date), 'dd/MM/yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Area:</p>
                            <p className="text-sm">{prize.radius}m</p>
                          </div>
                        </div>
                      </div>
                      
                      <h4 className="font-medium mt-4 mb-2">Indizi:</h4>
                      {!prizeClues[prize.id] || prizeClues[prize.id].length === 0 ? (
                        <div className="py-2 flex justify-between">
                          <p className="text-sm text-gray-500">Nessun indizio generato</p>
                          <Button 
                            size="sm" 
                            onClick={() => generateClues(prize.id, prize.city, prize.address)}
                            disabled={generatingClues}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Genera Indizi
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {prizeClues[prize.id].map((clue) => (
                            <div key={clue.id} className="text-sm border rounded-md p-3 bg-gray-900/10">
                              <p className="font-medium mb-1">Settimana {clue.week} - {clue.clue_type === 'buzz' ? 'Buzz' : 'Standard'}</p>
                              <details>
                                <summary className="cursor-pointer text-primary mb-1">🇮🇹 Italiano</summary>
                                <p className="pl-4 text-xs">{clue.description_it}</p>
                              </details>
                              <details>
                                <summary className="cursor-pointer text-primary mb-1">🇬🇧 English</summary>
                                <p className="pl-4 text-xs">{clue.description_en}</p>
                              </details>
                              <details>
                                <summary className="cursor-pointer text-primary">🇫🇷 Français</summary>
                                <p className="pl-4 text-xs">{clue.description_fr}</p>
                              </details>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t pt-4 bg-gray-900/5">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => sendManualBuzzClue(prize.id)}
                        disabled={loading}
                      >
                        <Award className="mr-2 h-4 w-4" />
                        Invia Buzz Test
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
