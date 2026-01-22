"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface OnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OnboardingWizard({ open, onOpenChange }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const steps = [
    {
      title: "Welcome to Your Dashboard",
      description: "Let's get you set up with the essential features.",
      content: "This wizard will help you configure your seller account."
    },
    {
      title: "Set Up Your Store",
      description: "Configure your store information and preferences.",
      content: "Add your business details, payment methods, and shipping settings."
    },
    {
      title: "Add Your First Product",
      description: "Time to start selling!",
      content: "Add your first product to begin your selling journey."
    }
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onOpenChange(false);
      setStep(1);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{steps[step - 1].title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Progress value={(step / totalSteps) * 100} className="w-full" />
            <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">{steps[step - 1].description}</h3>
            <p className="text-sm text-muted-foreground">{steps[step - 1].content}</p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSkip} variant="outline" className="flex-1">
              Skip
            </Button>
            <Button onClick={handleNext} className="flex-1">
              {step === totalSteps ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}