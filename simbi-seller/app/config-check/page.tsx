// @ts-nocheck
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function ConfigCheckPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_SELLER_API_BASE_URL || "/api/seller";
  const isRelativeUrl = apiBaseUrl.startsWith('/');
  const isCorrectConfig = isRelativeUrl;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Configuration Check</h1>
          <p className="mt-2 text-sm text-gray-600">
            Verify your API configuration
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration Status</CardTitle>
            <CardDescription>
              This page helps you verify that your API is configured correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                {isCorrectConfig ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium">API Base URL</p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {apiBaseUrl}
                  </code>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {isRelativeUrl ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium">URL Type</p>
                  <p className="text-sm text-gray-600">
                    {isRelativeUrl ? 'Relative URL (Correct - No CORS issues)' : 'Absolute URL (May cause CORS issues)'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Environment</p>
                  <p className="text-sm text-gray-600">
                    {process.env.NODE_ENV || 'development'}
                  </p>
                </div>
              </div>
            </div>

            {!isCorrectConfig && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Configuration Issue Detected!</strong>
                  <br />
                  Your API base URL should be a relative path (starting with /) to avoid CORS issues.
                  <br />
                  <br />
                  <strong>To fix this:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Go to your Vercel project dashboard</li>
                    <li>Navigate to Settings → Environment Variables</li>
                    <li>Set <code className="bg-red-100 px-1">NEXT_PUBLIC_SELLER_API_BASE_URL=/api/seller</code></li>
                    <li>Redeploy your application</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}

            {isCorrectConfig && (
              <Alert>
                <AlertDescription>
                  <strong>Configuration looks good!</strong>
                  <br />
                  Your API is configured to use same-domain routes, which avoids CORS issues.
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Test API Endpoint</h3>
              <p className="text-sm text-gray-600 mb-3">
                The login API will be called at:
              </p>
              <code className="text-sm bg-gray-100 px-3 py-2 rounded block break-all">
                {isRelativeUrl
                  ? `${typeof window !== 'undefined' ? window.location.origin : ''}${apiBaseUrl}/api/seller/auth/login`
                  : `${apiBaseUrl}/api/seller/auth/login`
                }
              </code>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}