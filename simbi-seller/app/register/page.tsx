// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerAuth } from '@/hooks/useSellerAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Eye, EyeOff, Mail } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    tradingName: '',
    businessAddress: '',
    contactNumber: '',
    tin: '',
    registrationNumber: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verificationError, setVerificationError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    specialChar: false
  });

  const { register, seller, loading } = useSellerAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (seller && !loading) {
      router.push('/dashboard');
    }
  }, [seller, loading, router]);

  // Auto-focus first input when verification dialog opens
  useEffect(() => {
    if (showVerificationDialog) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [showVerificationDialog]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validate password in real-time
    if (field === 'password') {
      validatePasswordComplexity(value);
    }
  };

  const validatePasswordComplexity = (password: string) => {
    setPasswordErrors({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }

    // Check for special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      setError('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
      return false;
    }

    const requiredFields = [
      'email', 'password', 'businessName', 'businessAddress',
      'contactNumber', 'tin', 'bankAccountName', 'bankName'
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }

    return true;
  };

  // Handle verification code input
  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setVerificationError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerifyEmail();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setVerificationCode(newCode);
      setVerificationError('');
      // Focus the last input
      inputRefs.current[5]?.focus();
      // Auto-verify after a short delay
      setTimeout(() => {
        handleVerifyEmail();
      }, 100);
    }
  };

  // Verify email with PIN
  const handleVerifyEmail = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setVerificationError('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data?: {
          seller: any;
          accessToken: string;
        };
      }>('/api/seller/auth/verify-email', {
        email: verificationEmail,
        code: code
      });

      if (response.success) {
        // Success! Redirect to login page
        setShowVerificationDialog(false);
        router.push('/login?verified=true');
      } else {
        setVerificationError(response.message || 'Invalid verification code');
        setVerificationCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationError(
        error?.data?.message || 
        'Verification failed. Please check your code and try again.'
      );
      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    setIsResending(true);
    setVerificationError('');

    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>('/api/seller/auth/resend-verification', {
        email: verificationEmail
      });

      if (response.success) {
        setSuccess('Verification code sent to your email');
        setVerificationCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setVerificationError(response.message || 'Failed to resend verification code');
      }
    } catch (error: any) {
      console.error('Resend error:', error);
      setVerificationError(
        error?.data?.message || 
        'Failed to resend verification code. Please try again.'
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        businessName: formData.businessName,
        tradingName: formData.tradingName || undefined,
        businessAddress: formData.businessAddress,
        contactNumber: formData.contactNumber,
        tin: formData.tin,
        registrationNumber: formData.registrationNumber || undefined,
        bankAccountName: formData.bankAccountName,
        bankAccountNumber: formData.bankAccountNumber || undefined,
        bankName: formData.bankName
      });

      if (result.success) {
        // Show verification dialog instead of redirecting
        setVerificationEmail(formData.email);
        setShowVerificationDialog(true);
        setSuccess('Registration successful! Please check your email for verification code.');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Join Simbi Seller</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create your seller account to start selling on our platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Registration</CardTitle>
            <CardDescription>
              Fill in your business details to create your seller account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Account Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="business@example.com"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number *</Label>
                    <Input
                      id="contactNumber"
                      type="tel"
                      value={formData.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      placeholder="+263771234567"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Min 8 chars, 1 uppercase, 1 special"
                        required
                        disabled={isLoading}
                        className={formData.password && (!passwordErrors.length || !passwordErrors.uppercase || !passwordErrors.specialChar) ? 'border-red-300 focus:border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {formData.password && (
                      <div className="space-y-1 text-xs">
                        <div className={`flex items-center gap-2 ${passwordErrors.length ? 'text-green-600' : 'text-gray-500'}`}>
                          <span>{passwordErrors.length ? '✓' : '○'}</span>
                          <span>At least 8 characters</span>
                        </div>
                        <div className={`flex items-center gap-2 ${passwordErrors.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                          <span>{passwordErrors.uppercase ? '✓' : '○'}</span>
                          <span>At least one uppercase letter</span>
                        </div>
                        <div className={`flex items-center gap-2 ${passwordErrors.specialChar ? 'text-green-600' : 'text-gray-500'}`}>
                          <span>{passwordErrors.specialChar ? '✓' : '○'}</span>
                          <span>At least one special character (!@#$%^&*)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Business Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="Your Business Ltd"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tradingName">Trading Name</Label>
                    <Input
                      id="tradingName"
                      value={formData.tradingName}
                      onChange={(e) => handleInputChange('tradingName', e.target.value)}
                      placeholder="Trading As Name"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Business Address *</Label>
                  <Input
                    id="businessAddress"
                    value={formData.businessAddress}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    placeholder="123 Main Street, City, Country"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tin">Tax Identification Number (TIN) *</Label>
                    <Input
                      id="tin"
                      value={formData.tin}
                      onChange={(e) => handleInputChange('tin', e.target.value)}
                      placeholder="TIN123456"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Business Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                      placeholder="REG123456"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Banking Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      placeholder="CBZ Bank"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccountName">Account Name *</Label>
                    <Input
                      id="bankAccountName"
                      value={formData.bankAccountName}
                      onChange={(e) => handleInputChange('bankAccountName', e.target.value)}
                      placeholder="Business Account Name"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">Account Number</Label>
                  <Input
                    id="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                    placeholder="Account number"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Seller Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={(open) => {
        if (!open && !isVerifying) {
          setShowVerificationDialog(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-center text-2xl">Verify Your Email</DialogTitle>
            <DialogDescription className="text-center">
              We've sent a 6-digit verification code to
              <br />
              <span className="font-semibold text-gray-900">{verificationEmail}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {verificationError && (
              <Alert variant="destructive">
                <AlertDescription>{verificationError}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Label className="text-center block text-sm font-medium text-gray-700">Enter Verification Code</Label>
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {verificationCode.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    className="h-14 w-14 text-center text-2xl font-bold border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:bg-gray-50 disabled:opacity-50"
                    disabled={isVerifying}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={handleVerifyEmail}
              disabled={isVerifying || verificationCode.some(digit => !digit)}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending || isVerifying}
                className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Didn't receive the code? Resend"
                )}
              </button>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <p className="text-xs text-blue-800">
                The verification code will expire in 15 minutes
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}