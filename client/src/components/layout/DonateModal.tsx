import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, X } from "lucide-react";

interface DonateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DonateModal({ open, onOpenChange }: DonateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md bg-black/90 border-white/10 p-4 sm:p-6 w-[90vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            Support Our Developers
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 flex items-center justify-center shadow-lg">
            <img 
              src="/uploads/donate-qr.jpg" 
              alt="Donate QR Code" 
              className="w-56 h-56 object-contain"
            />
          </div>
          
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              Scan the QR code with your phone to donate
            </p>
            <p className="text-sm text-muted-foreground">
              Every contribution helps support our amazing game developers and keeps the platform growing.
            </p>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full border-white/10"
            data-testid="button-close-donate"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
