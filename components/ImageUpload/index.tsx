'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getWineFromAI } from '@/actions/getWineFromAI';
import {
  convertFileToBase64,
  validateImageType,
  validateImageSize,
} from '@/lib/imageUtils';
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ImageUpload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    try {
      setIsProcessing(true);

      if (!validateImageType(file)) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a valid image file (JPEG, PNG)',
          variant: 'destructive',
        });
        return;
      }

      if (!validateImageSize(file)) {
        toast({
          title: 'File too large',
          description: 'Image size must be less than 10MB',
          variant: 'destructive',
        });
        return;
      }

      const base64Image = await convertFileToBase64(file);
      const wineInfoText = await getWineFromAI(base64Image);

      console.log('AI Response:', wineInfoText);

      toast({
        title: 'Analysis complete',
        description: 'Check the console for the AI response.',
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: 'Analysis failed',
        description: 'Failed to analyze the wine image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={isProcessing}
      />
      <Button
        onClick={handleButtonClick}
        disabled={isProcessing}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" />
            Scan Wine
          </>
        )}
      </Button>
    </div>
  );
};
