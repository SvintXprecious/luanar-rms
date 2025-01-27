'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { toast } from "sonner";

const colors = {
  primary: {
    main: '#2eb135',
    light: '#e6f8e7',
    dark: '#25902b',
    contrast: '#ffffff'
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  error: {
    main: '#ef4444',
    light: '#fee2e2'
  }
};

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email: string;
  password: string;
}

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState<FormErrors>({
    email: '',
    password: ''
  });
  const [formData, setFormData] = React.useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  const validateForm = () => {
    const errors: FormErrors = {
      email: '',
      password: ''
    };

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setFormErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setFormErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        role: 'APPLICANT',
        callbackUrl: '/careers/dashboard',
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid credentials');
      } else {
        router.push('/careers/dashboard');
        toast.success('Logged in successfully');
      }
    } catch (error) {
      toast.error('Something went wrong');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.neutral[50] }}>
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="mb-8">
          <Image 
            src="/luanar.png" 
            alt="LUANAR Logo" 
            width={80} 
            height={80} 
            priority
          />
        </div>

        <div className="w-full max-w-md">
          <Card className="bg-white shadow-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold text-center" style={{ color: colors.neutral[900] }}>
                Welcome to Career Portal
              </CardTitle>
              <CardDescription className="text-center" style={{ color: colors.neutral[600] }}>
                Sign in to access your job applications and profile
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium"
                    style={{ color: colors.neutral[700] }}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.neutral[400] }}>
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 ${formErrors.email ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {formErrors.email && (
                    <span className="text-xs" style={{ color: colors.error.main }}>{formErrors.email}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-medium"
                    style={{ color: colors.neutral[700] }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.neutral[400] }}>
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-10 ${formErrors.password ? 'border-red-500' : ''}`}
                      placeholder="••••••••"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-slate-600 focus:outline-none"
                      style={{ color: colors.neutral[400] }}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <span className="text-xs" style={{ color: colors.error.main }}>{formErrors.password}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-slate-300"
                      style={{ color: colors.primary.main }}
                      disabled={isLoading}
                    />
                    <label 
                      htmlFor="rememberMe" 
                      className="ml-2 block text-sm"
                      style={{ color: colors.neutral[600] }}
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    href="/careers/auth/forgot-password"
                    className="text-sm font-medium hover:opacity-90 transition-colors"
                    style={{ color: colors.primary.main }}
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full hover:opacity-90 transition-colors"
                  style={{ 
                    backgroundColor: colors.primary.main,
                    color: colors.primary.contrast
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </Button>

                <div className="text-center text-sm" style={{ color: colors.neutral[600] }}>
                  Don't have an account?{' '}
                  <Link 
                    href="/applicant/signup" 
                    className="font-medium hover:opacity-90 transition-colors"
                    style={{ color: colors.primary.main }}
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}