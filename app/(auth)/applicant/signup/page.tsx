'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  },
  success: {
    main: '#22c55e',
    light: '#dcfce7'
  }
};

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  acceptTerms: boolean;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
}

interface PasswordRequirementProps {
  met: boolean;
  text: string;
}

const initialFormData: FormData = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'APPLICANT',
  acceptTerms: false
};

const PasswordRequirement: React.FC<PasswordRequirementProps> = ({ met, text }) => (
  <div className="flex items-center space-x-2">
    {met ? (
      <CheckCircle2 className="w-4 h-4" style={{ color: colors.success.main }} />
    ) : (
      <XCircle className="w-4 h-4" style={{ color: colors.neutral[300] }} />
    )}
    <span style={{ 
      color: met ? colors.success.main : colors.neutral[500]
    }} className="text-sm">
      {text}
    </span>
  </div>
);

const SignUpPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = React.useState<FormData>(initialFormData);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [formErrors, setFormErrors] = React.useState<FormErrors>({});
  const [isPasswordFocused, setIsPasswordFocused] = React.useState(false);

  const passwordCriteria = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    } else if (formData.first_name.length < 2) {
      errors.first_name = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s-']{2,}$/.test(formData.first_name)) {
      errors.first_name = 'Please enter a valid first name';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    } else if (formData.last_name.length < 2) {
      errors.last_name = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s-']{2,}$/.test(formData.last_name)) {
      errors.last_name = 'Please enter a valid last name';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!allCriteriaMet) {
      errors.password = 'Password does not meet all requirements';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast({
        title: "Registration Successful!",
        description: "Redirecting to login...",
        duration: 3000,
      });

      setTimeout(() => router.push('/applicant/signin'), 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
                Create Account
              </CardTitle>
              <CardDescription className="text-center" style={{ color: colors.neutral[600] }}>
                Join LUANAR Careers to explore opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" style={{ 
                    backgroundColor: colors.error.light,
                    color: colors.error.main,
                    borderColor: colors.error.main 
                  }}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: colors.neutral[700] }}>
                      First Name
                    </label>
                    <Input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={formErrors.first_name ? 'border-red-500' : ''}
                      required
                    />
                    {formErrors.first_name && (
                      <span className="text-xs" style={{ color: colors.error.main }}>
                        {formErrors.first_name}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: colors.neutral[700] }}>
                      Last Name
                    </label>
                    <Input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={formErrors.last_name ? 'border-red-500' : ''}
                      required
                    />
                    {formErrors.last_name && (
                      <span className="text-xs" style={{ color: colors.error.main }}>
                        {formErrors.last_name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium" style={{ color: colors.neutral[700] }}>
                    Email Address
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={formErrors.email ? 'border-red-500' : ''}
                    required
                  />
                  {formErrors.email && (
                    <span className="text-xs" style={{ color: colors.error.main }}>
                      {formErrors.email}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium" style={{ color: colors.neutral[700] }}>
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => {
                        if (!formData.password || allCriteriaMet) {
                          setIsPasswordFocused(false);
                        }
                      }}
                      className={`pr-10 ${formErrors.password ? 'border-red-500' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-slate-600"
                      style={{ color: colors.neutral[400] }}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {(isPasswordFocused || formData.password) && !allCriteriaMet && (
                    <div className="mt-2 p-3 rounded-lg space-y-2" style={{ backgroundColor: colors.neutral[50] }}>
                      <h4 className="text-sm font-medium mb-2" style={{ color: colors.neutral[700] }}>
                        Password must contain:
                      </h4>
                      <PasswordRequirement met={passwordCriteria.minLength} text="At least 8 characters" />
                      <PasswordRequirement met={passwordCriteria.hasUppercase} text="One uppercase letter" />
                      <PasswordRequirement met={passwordCriteria.hasLowercase} text="One lowercase letter" />
                      <PasswordRequirement met={passwordCriteria.hasNumber} text="One number" />
                      <PasswordRequirement met={passwordCriteria.hasSymbol} text="One special character" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium" style={{ color: colors.neutral[700] }}>
                    Confirm Password
                  </label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={formErrors.confirmPassword ? 'border-red-500' : ''}
                    required
                  />
                  {formData.confirmPassword && (
                    <>
                      {formData.password !== formData.confirmPassword ? (
                        <span className="text-xs" style={{ color: colors.error.main }}>
                          Passwords do not match
                        </span>
                      ) : (
                        <div className="flex items-center space-x-1 text-sm mt-1" 
                             style={{ color: colors.success.main }}>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Passwords match</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start">
                    <input
                      name="acceptTerms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 rounded border-slate-300"
                      style={{ color: colors.primary.main }}
                    />
                    <label className="ml-2 text-sm" style={{ color: colors.neutral[600] }}>
                      I agree to the{' '}
                      <Link 
                        href="/terms" 
                        className="hover:opacity-90 transition-colors"
                        style={{ color: colors.primary.main }}
                      >
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link 
                        href="/privacy"
                        className="hover:opacity-90 transition-colors"
                        style={{ color: colors.primary.main }}
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {formErrors.acceptTerms && (
                    <span className="text-xs" style={{ color: colors.error.main }}>
                      {formErrors.acceptTerms}
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: colors.primary.main,
                    color: colors.primary.contrast
                  }}
                  disabled={isLoading || !formData.acceptTerms}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <div className="text-center text-sm" style={{ color: colors.neutral[600] }}>
                  Already have an account?{' '}
                  <Link 
                    href="/applicant/signin"
                    className="font-medium hover:opacity-90 transition-colors"
                    style={{ color: colors.primary.main }}
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;