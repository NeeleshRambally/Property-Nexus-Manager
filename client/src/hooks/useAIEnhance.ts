import { useState } from "react";
import { useToast } from "./use-toast";

interface UseAIEnhanceOptions {
  onSuccess?: (enhancedText: string) => void;
}

export function useAIEnhance(options?: UseAIEnhanceOptions) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();

  const enhance = async (text: string, type: 'description' | 'general' = 'description') => {
    if (!text || text.trim().length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some text first.",
      });
      return null;
    }

    setIsEnhancing(true);

    try {
      // Call your backend AI endpoint
      const response = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance text');
      }

      const data = await response.json();
      const enhancedText = data.enhancedText;

      if (options?.onSuccess) {
        options.onSuccess(enhancedText);
      }

      toast({
        title: "Success",
        description: "Text enhanced with AI!",
      });

      return enhancedText;
    } catch (error) {
      console.error('AI enhancement error:', error);
      toast({
        variant: "destructive",
        title: "Enhancement Failed",
        description: "Failed to enhance text. Please try again.",
      });
      return null;
    } finally {
      setIsEnhancing(false);
    }
  };

  return {
    enhance,
    isEnhancing,
  };
}
