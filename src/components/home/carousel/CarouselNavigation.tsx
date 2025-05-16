
import { MagneticButton } from "@/components/ui/magnetic-button";

interface CarouselNavigationProps {
  onPrevClick: () => void;
  onNextClick: () => void;
}

export const CarouselNavigation: React.FC<CarouselNavigationProps> = ({ 
  onPrevClick, 
  onNextClick 
}) => {
  return (
    <div className="hidden md:block">
      <MagneticButton
        className="absolute -left-12 top-1/2 -translate-y-1/2 bg-black/30 border border-purple-400/40 hover:bg-black/60 hover:border-purple-400/70 text-white transition-all duration-300 w-10 h-10 rounded-full flex items-center justify-center"
        onClick={onPrevClick}
        strength={15}
      >
        <span className="sr-only">Previous</span>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
          <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
        </svg>
      </MagneticButton>
      
      <MagneticButton
        className="absolute -right-12 top-1/2 -translate-y-1/2 bg-black/30 border border-purple-400/40 hover:bg-black/60 hover:border-purple-400/70 text-white transition-all duration-300 w-10 h-10 rounded-full flex items-center justify-center"
        onClick={onNextClick}
        strength={15}
      >
        <span className="sr-only">Next</span>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
          <path d="M6.1584 3.13508C5.95694 3.32395 5.94673 3.64036 6.1356 3.84182L9.56499 7.49991L6.1356 11.158C5.94673 11.3594 5.95694 11.6759 6.1584 11.8647C6.35986 12.0536 6.67627 12.0434 6.86514 11.8419L10.6151 7.84182C10.7954 7.64949 10.7954 7.35042 10.6151 7.15808L6.86514 3.15808C6.67627 2.95663 6.35986 2.94642 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
        </svg>
      </MagneticButton>
    </div>
  );
};
