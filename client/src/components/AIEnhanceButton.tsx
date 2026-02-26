import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface AIEnhanceButtonProps {
  originalText: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  monthlyRent?: number;
  onAccept: (enhancedText: string) => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AIEnhanceButton({
  originalText,
  propertyType,
  bedrooms,
  bathrooms,
  monthlyRent,
  onAccept,
  variant = "outline",
  size = "sm",
  className = "",
}: AIEnhanceButtonProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedText, setEnhancedText] = useState<string | null>(null);
  const [originalSaved, setOriginalSaved] = useState<string>("");
  const { toast } = useToast();

  const handleEnhance = async () => {
    if (!originalText || originalText.trim().length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some text first.",
      });
      return;
    }

    setIsEnhancing(true);
    setOriginalSaved(originalText);

    try {
      const response = await apiClient.post('/api/ai/enhance-property-description', {
        originalDescription: originalText,
        propertyType,
        bedrooms,
        bathrooms,
        monthlyRent,
      });

      if (!response.ok) {
        throw new Error('Failed to enhance description');
      }

      const data = await response.json();
      setEnhancedText(data.enhancedDescription);

      // Temporarily show the enhanced text
      onAccept(data.enhancedDescription);

      toast({
        title: "AI Enhancement Ready",
        description: "Review the enhanced description and accept or reject it.",
      });
    } catch (error) {
      console.error('AI enhancement error:', error);
      toast({
        variant: "destructive",
        title: "Enhancement Failed",
        description: "Failed to enhance description. Your original text is preserved.",
      });
      // Keep original text if API fails
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAccept = () => {
    if (enhancedText) {
      // Already set by onAccept in handleEnhance
      toast({
        title: "Accepted",
        description: "Enhanced description has been applied.",
      });
    }
    setEnhancedText(null);
    setOriginalSaved("");
  };

  const handleReject = () => {
    // Restore original text
    onAccept(originalSaved);
    setEnhancedText(null);
    setOriginalSaved("");

    toast({
      title: "Rejected",
      description: "Original description has been restored.",
    });
  };

  // If we have enhanced text, show Accept/Reject buttons
  if (enhancedText) {
    return (
      <div className="flex gap-2">
        <Button
          type="button"
          variant="default"
          size={size}
          onClick={handleAccept}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          <Check className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} mr-2`} />
          Accept
        </Button>
        <Button
          type="button"
          variant="outline"
          size={size}
          onClick={handleReject}
        >
          <X className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} mr-2`} />
          Reject
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleEnhance}
      disabled={isEnhancing || !originalText || originalText.trim().length === 0}
      className={className}
    >
      <Sparkles className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} mr-2`} />
      {isEnhancing ? "Enhancing..." : "Enhance with AI"}
    </Button>
  );
}
