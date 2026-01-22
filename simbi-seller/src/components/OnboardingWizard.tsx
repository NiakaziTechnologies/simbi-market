// @ts-nocheck
"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function OnboardingWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  function next() {
    setStep((s) => Math.min(3, s + 1));
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function submit() {
    // Basic validation
    if (!businessName || !email || !bankName || !accountNumber) {
      toast({ title: "Missing information", description: "Please fill the required fields." });
      return;
    }

    const onboarding = { businessName, email, registrationNumber, address, bankName, accountName, accountNumber };
    localStorage.setItem("simbi_onboarding", JSON.stringify(onboarding));

    toast({ title: "Onboarding saved", description: "Your store information has been saved (mock)." });
    onOpenChange(false);
    setStep(0);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#3498DB] to-[#2ECC71] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            Seller Onboarding
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 0 && (
            <div>
              <label className="text-sm font-medium">Business Name</label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              <label className="text-sm font-medium mt-2">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          )}

          {step === 1 && (
            <div>
              <label className="text-sm font-medium">Registration Number</label>
              <Input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
              <label className="text-sm font-medium mt-2">Business Address</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="text-sm font-medium">Bank Name</label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} />
              <label className="text-sm font-medium mt-2">Account Name</label>
              <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
              <label className="text-sm font-medium mt-2">Account Number</label>
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="font-medium">Review</p>
              <pre className="text-xs bg-muted p-2 rounded mt-2">{JSON.stringify({ businessName, email, registrationNumber, address, bankName, accountName, accountNumber }, null, 2)}</pre>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {step > 0 && (
              <Button variant="outline" onClick={back} className="mr-2 border-gray-300 text-gray-700 hover:bg-gray-50">
                Back
              </Button>
            )}
          </div>

          <div>
            {step < 3 && (
              <Button onClick={next} className="mr-2 bg-[#3498DB] hover:bg-[#2980B9] text-white">
                Next
              </Button>
            )}
            {step === 3 && (
              <Button onClick={submit} className="bg-[#2ECC71] hover:bg-[#27AE60] text-white">
                Finish
              </Button>
            )}
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50">
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
