
import { Button } from "@/components/ui/button";

interface SuggestionProps {
  text: string;
  onClick: () => void;
}

const Suggestion = ({ text, onClick }: SuggestionProps) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onClick}
    className="text-sm bg-black/40 border-projectx-deep-blue/40 hover:bg-black/60 press-effect"
  >
    {text}
  </Button>
);

interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const ChatSuggestions = ({ onSuggestionClick }: ChatSuggestionsProps) => {
  const suggestions = [
    'Dove dovrei cercare?',
    'Qual è l\'indizio più importante?',
    'Consigli per il prossimo passo?',
    'Riassumi la situazione',
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <Suggestion
          key={suggestion}
          text={suggestion}
          onClick={() => onSuggestionClick(suggestion)}
        />
      ))}
    </div>
  );
};
