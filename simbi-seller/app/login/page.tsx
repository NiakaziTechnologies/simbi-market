// @ts-nocheck
"use client";

import { useState, useEffect } from 'react';
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');

  const { login, seller, staff, userType, loading } = useSellerAuth();
  const router = useRouter();

  // Redirect if already logged in (seller or staff)
  useEffect(() => {
    if ((seller || staff) && !loading) {
      router.push('/dashboard');
    }
  }, [seller, staff, loading, router]);

  // Check for verification success message
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('verified') === 'true') {
      setSuccess('Email verified successfully! Please log in to continue.');
      // Remove query parameter from URL
      router.replace('/login', { scroll: false });
    }
    if (searchParams.get('reset') === 'success') {
      setSuccess('Password reset successfully! You can now log in with your new password.');
      // Remove query parameter from URL
      router.replace('/login', { scroll: false });
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError('');
    setForgotPasswordLoading(true);
    setForgotPasswordSuccess(false);

    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        timestamp?: string;
      }>('/api/auth/forgot-password', {
        email: forgotPasswordEmail,
        userType: 'seller'
      });

      if (response.success) {
        setForgotPasswordSuccess(true);
        setForgotPasswordError('');
        // Close dialog after 3 seconds
        setTimeout(() => {
          setForgotPasswordOpen(false);
          setForgotPasswordEmail('');
          setForgotPasswordSuccess(false);
        }, 3000);
      } else {
        setForgotPasswordError(response.message || 'Failed to send reset email');
      }
    } catch (err: any) {
      setForgotPasswordError(err?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Simbi Seller</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your seller account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your seller dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
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
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Register here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-center text-2xl">Reset Password</DialogTitle>
            <DialogDescription className="text-center">
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleForgotPassword} className="space-y-4">
            {forgotPasswordError && (
              <Alert variant="destructive">
                <AlertDescription>{forgotPasswordError}</AlertDescription>
              </Alert>
            )}
            
            {forgotPasswordSuccess && (
              <Alert>
                <AlertDescription>
                  If an account exists with this email, a password reset link has been sent. Please check your inbox.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="forgotEmail">Email Address</Label>
              <Input
                id="forgotEmail"
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={forgotPasswordLoading || forgotPasswordSuccess}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={forgotPasswordLoading || forgotPasswordSuccess}
            >
              {forgotPasswordLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : forgotPasswordSuccess ? (
                'Email Sent!'
              ) : (
                'Send Reset Link'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setForgotPasswordOpen(false);
                setForgotPasswordEmail('');
                setForgotPasswordError('');
                setForgotPasswordSuccess(false);
              }}
              disabled={forgotPasswordLoading}
            >
              Cancel
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}