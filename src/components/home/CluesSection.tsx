
import { Button } from "@/components/ui/button";
import ClueCard from "@/components/clues/ClueCard";

const clues = [
  {
    id: 1,
    title: "Primo Indizio",
    description: "L'auto si trova in una città che inizia con la lettera 'M'.",
    week: 1,
    isLocked: false,
    subscriptionType: "Base"
  },
  {
    id: 2,
    title: "Colore e Dettagli",
    description: "L'auto è di colore rosso con dettagli in fibra di carbonio.",
    week: 1,
    isLocked: true,
    subscriptionType: "Silver"
  },
  {
    id: 3,
    title: "Localizzazione",
    description: "L'auto è parcheggiata vicino a un famoso monumento.",
    week: 1,
    isLocked: true,
    subscriptionType: "Gold"
  },
  {
    id: 4,
    title: "Coordinate Precise",
    description: "Coordinate GPS precise della posizione dell'auto.",
    week: 1,
    isLocked: true,
    subscriptionType: "Black"
  },
];

export const CluesSection = () => {
  return (
    <section className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Indizi Disponibili</h2>
        <div className="text-xs px-2 py-1 rounded-full bg-projectx-deep-blue">
          Settimana 1/4
        </div>
      </div>
      
      {clues.map((clue) => (
        <ClueCard 
          key={clue.id} 
          title={clue.title} 
          description={clue.description} 
          week={clue.week} 
          isLocked={clue.isLocked} 
          subscriptionType={clue.subscriptionType as any}
        />
      ))}
      
      <div className="mt-6">
        <Button 
          className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
        >
          Sblocca Tutti gli Indizi
        </Button>
      </div>
    </section>
  );
};

export default CluesSection;
