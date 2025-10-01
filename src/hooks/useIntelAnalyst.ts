// © 2025 Joseph MULÉ – M1SSION™ - AI Analyst Hook (Local Logic)
import { useState, useCallback } from 'react';

interface AnalystMessage {
  id: string;
  role: 'user' | 'analyst';
  content: string;
  timestamp: number;
  metadata?: {
    probability?: string;
    risk?: string;
  };
}

interface UseIntelAnalystReturn {
  messages: AnalystMessage[];
  isProcessing: boolean;
  voiceEnergy: number;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
}

export const useIntelAnalyst = (): UseIntelAnalystReturn => {
  const [messages, setMessages] = useState<AnalystMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnergy, setVoiceEnergy] = useState(0);

  const analyzeInput = useCallback((input: string): { response: string; metadata?: { probability?: string; risk?: string } } => {
    const lower = input.toLowerCase();

    // Gentle refusal for location/prize requests
    if (
      lower.includes('dov') || 
      lower.includes('location') || 
      lower.includes('coordinate') ||
      lower.includes('address') ||
      lower.includes('prize') ||
      lower.includes('premio') ||
      lower.includes('cos\'è') ||
      lower.includes('what is') ||
      lower.includes('soluzione')
    ) {
      return {
        response: `⚠️ **TACTICAL CONSTRAINT**

I cannot provide explicit locations, coordinates, addresses, or prize details. This would compromise mission integrity.

**Alternative Approaches:**
• Review clue patterns and classifications
• Analyze temporal and spatial hints
• Cross-reference decoded fragments
• Assess probability clusters

Would you like me to classify your current clues or perform pattern analysis instead?`,
        metadata: { probability: 'N/A', risk: 'N/A' }
      };
    }

    // Classification request
    if (lower.includes('classif') || lower.includes('categor') || lower.includes('organiz')) {
      return {
        response: `📊 **CLUE CLASSIFICATION**

**Tactical Categories:**
• **LOCATION**: Geographical hints, landmarks, city references
• **PRIZE**: Vehicle characteristics, features, specifications  
• **TEMPORAL**: Time-based clues, historical references
• **TECHNICAL**: Codes, patterns, encrypted data
• **CONTEXT**: Background information, mission history

**Risk Assessment:**
• **HIGH CONFIDENCE**: Multiple corroborating clues
• **MEDIUM CONFIDENCE**: Single-source validation
• **LOW CONFIDENCE**: Ambiguous or contradictory data

Request specific clue analysis for detailed classification.`,
        metadata: { probability: '70-80%', risk: 'Low' }
      };
    }

    // Analysis request
    if (lower.includes('analy') || lower.includes('summary') || lower.includes('riassun')) {
      return {
        response: `🔍 **INTELLIGENCE SUMMARY**

**Current Mission Status:**
• Clue collection: Active
• Data correlation: In progress
• Pattern detection: Ongoing

**Tactical Recommendations:**
1. Cross-reference geographical clues with historical data
2. Analyze temporal patterns for mission timeline
3. Decode technical fragments for hidden information
4. Validate high-confidence leads through multiple sources

**Next Steps:**
• Request detailed clue classification
• Perform pattern analysis on specific data
• Decode suspected encrypted content

Probability of successful mission completion increases with systematic analysis.`,
        metadata: { probability: '65-75%', risk: 'Moderate' }
      };
    }

    // Decoding request
    if (
      lower.includes('decod') || 
      lower.includes('decrypt') || 
      lower.includes('cipher') ||
      lower.includes('decode')
    ) {
      return {
        response: `🔐 **DECODING PROTOCOL**

**Available Techniques:**
• **Caesar Cipher**: Shift ±1-25 positions
• **Base64**: Standard encoding/decoding
• **Anagram**: Letter rearrangement detection
• **ASCII**: Numeric to character conversion
• **Pattern**: Repeating sequence analysis

**Example:**
Input: "NJTTJPO"
→ Caesar -1: "MISSION" ✓

Provide suspected encoded text for analysis. I'll apply systematic decoding techniques and report results.`,
        metadata: { probability: '50-60%', risk: 'Medium' }
      };
    }

    // Probability/risk request
    if (lower.includes('probab') || lower.includes('risk') || lower.includes('chance')) {
      return {
        response: `📈 **PROBABILITY ASSESSMENT**

**Mission Success Factors:**
• **Data Quality**: MEDIUM → More clues needed for HIGH confidence
• **Source Reliability**: ASSESSING → Validate through cross-reference
• **Temporal Accuracy**: GOOD → Timeline analysis consistent

**Risk Factors:**
• False lead probability: ~30% (typical for early mission phase)
• Data contradiction risk: LOW (no conflicting sources detected)
• Time pressure: MODERATE (mission window closing)

**CIA-Style Assessment:**
"Current intelligence suggests multiple viable leads. Recommend systematic elimination of low-probability zones before final shot attempt. Confidence level: 60-70%."

Continue gathering intelligence to reduce uncertainty margin.`,
        metadata: { probability: '60-70%', risk: 'Moderate' }
      };
    }

    // Mentor/motivational
    if (
      lower.includes('help') || 
      lower.includes('stuck') || 
      lower.includes('aiut') ||
      lower.includes('difficult')
    ) {
      return {
        response: `💪 **TACTICAL GUIDANCE**

**Remember, Agent:**
Every great operative faces obstacles. Your systematic approach shows professional discipline.

**Current Strengths:**
✓ Methodical clue collection
✓ Pattern recognition capability
✓ Persistence under pressure

**Recommended Actions:**
1. Step back and review all clues holistically
2. Look for connections between seemingly unrelated data
3. Trust the intelligence gathering process
4. Precision over speed – one perfect shot beats many rushed attempts

**M1SSION Principle:**
"The best agents don't rush to conclusions. They let the intelligence reveal itself through careful analysis."

You have the skills. Trust your training. 🎯`,
        metadata: { probability: 'N/A', risk: 'N/A' }
      };
    }

    // Default: General guidance
    return {
      response: `👤 **AI ANALYST READY**

**Capabilities:**
• Clue analysis and classification
• Pattern detection and correlation
• Basic decoding (Caesar, Base64, ASCII, anagrams)
• Probability and risk assessment
• Tactical recommendations

**What I Can't Do:**
❌ Reveal final locations or coordinates
❌ Provide explicit prize details
❌ Give complete solutions

**What I Can Do:**
✓ Analyze your collected clues
✓ Classify and organize intelligence
✓ Decode encrypted fragments
✓ Assess probabilities and risks
✓ Provide tactical guidance

Ask me to "classify clues", "analyze patterns", "decode [text]", or "assess probability".`,
      metadata: { probability: 'N/A', risk: 'N/A' }
    };
  }, []);

  const simulateVoiceEnergy = useCallback(() => {
    let frame = 0;
    const totalFrames = 90; // ~1.5s at 60fps
    
    const animate = () => {
      if (frame >= totalFrames) {
        setVoiceEnergy(0);
        return;
      }
      
      // Ease-in-out energy curve
      const progress = frame / totalFrames;
      const energy = Math.sin(progress * Math.PI) * 0.8; // 0 -> 0.8 -> 0
      
      setVoiceEnergy(energy);
      frame++;
      requestAnimationFrame(animate);
    };
    
    animate();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMsg: AnalystMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    // Simulate processing delay (500-1200ms)
    const delay = 500 + Math.random() * 700;
    
    simulateVoiceEnergy();
    
    await new Promise((resolve) => setTimeout(resolve, delay));

    const { response, metadata } = analyzeInput(text);
    const analystMsg: AnalystMessage = {
      id: `analyst-${Date.now()}`,
      role: 'analyst',
      content: response,
      timestamp: Date.now(),
      metadata
    };

    setMessages((prev) => [...prev, analystMsg]);
    setIsProcessing(false);
  }, [isProcessing, analyzeInput, simulateVoiceEnergy]);

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isProcessing,
    voiceEnergy,
    sendMessage,
    clearHistory
  };
};
