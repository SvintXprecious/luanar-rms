'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/app/api/auth/g/route';


const SignUpPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  
  // Initialize form state with all required fields, including the role from our API
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    role: UserRole.HR // Default role for career portal signup
  });

  // UI state management
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [isPasswordFocused, setIsPasswordFocused] = React.useState(false);

  // Define comprehensive password validation criteria
  const passwordCriteria = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);

  // Form validation function that checks all fields
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Validate first name
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (!/^[a-zA-Z\s-']{2,}$/.test(formData.firstName)) {
      errors.firstName = 'Please enter a valid first name';
    }
    
    // Validate last name
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Z\s-']{2,}$/.test(formData.lastName)) {
      errors.lastName = 'Please enter a valid last name';
    }
    
    // Validate email using the API's regex pattern
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!allCriteriaMet) {
      errors.password = 'Password does not meet all requirements';
    }
    
    // Validate password confirmation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Validate terms acceptance
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission with API integration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/g', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          confirmPassword: formData.confirmPassword,
          acceptTerms: formData.acceptTerms
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Email already exists');
        }
        throw new Error(data.error || 'Registration failed');
      }

      // Show success toast and redirect
      toast({
        title: "Registration Successful!",
        description: "Your account has been created. Redirecting to login...",
        duration: 3000,
      });

      setTimeout(() => {
        router.push('/careers/auth/signin');
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during registration';
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

  // Password requirement indicator component
  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center space-x-2">
      {met ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-slate-300" />
      )}
      <span className={`text-sm ${met ? 'text-green-500' : 'text-slate-500'}`}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center text-xl font-bold">
              <span>LUA</span>
              <span className="text-green-600">NAR</span>
              <span className="ml-2 text-slate-900">Careers</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Section */}
      <main className="flex items-center justify-center min-h-[calc(100vh-64px)] py-8 px-4">
        <div className="w-full max-w-md">
          <Card className="bg-white shadow-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                Join LUANAR Careers to explore opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className={formErrors.firstName ? 'border-red-500' : ''}
                      required
                    />
                    {formErrors.firstName && (
                      <span className="text-xs text-red-500">{formErrors.firstName}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className={formErrors.lastName ? 'border-red-500' : ''}
                      required
                    />
                    {formErrors.lastName && (
                      <span className="text-xs text-red-500">{formErrors.lastName}</span>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={formErrors.email ? 'border-red-500' : ''}
                    required
                  />
                  {formErrors.email && (
                    <span className="text-xs text-red-500">{formErrors.email}</span>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => {
                        if (formData.password === '' || allCriteriaMet) {
                          setIsPasswordFocused(false);
                        }
                      }}
                      className={`pr-10 ${formErrors.password ? 'border-red-500' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  {(isPasswordFocused || formData.password.length > 0) && !allCriteriaMet && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg space-y-2">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Password must contain:</h4>
                      <PasswordRequirement met={passwordCriteria.minLength} text="At least 8 characters" />
                      <PasswordRequirement met={passwordCriteria.hasUppercase} text="One uppercase letter" />
                      <PasswordRequirement met={passwordCriteria.hasLowercase} text="One lowercase letter" />
                      <PasswordRequirement met={passwordCriteria.hasNumber} text="One number" />
                      <PasswordRequirement met={passwordCriteria.hasSymbol} text="One special character" />
                    </div>
                  )}
                  
                  {formErrors.password && (
                    <span className="text-xs text-red-500">{formErrors.password}</span>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={formErrors.confirmPassword ? 'border-red-500' : ''}
                    required
                  />
                  {formData.confirmPassword && (
                    <>
                      {formData.password !== formData.confirmPassword ? (
                        <span className="text-xs text-red-500">Passwords do not match</span>
                      ) : (
                        <div className="flex items-center space-x-1 text-green-500 text-sm mt-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Passwords match</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

             
                {/* Terms and Conditions Section */}
                <div className="space-y-2">
                  <div className="flex items-start">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={e => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0041E9]"
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-slate-600">
                      I agree to the{' '}
                      <Link href="/terms" className="text-[#0041E9] hover:text-[#0036c4]">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-[#0041E9] hover:text-[#0036c4]">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {formErrors.acceptTerms && (
                    <span className="text-xs text-red-500">{formErrors.acceptTerms}</span>
                  )}
                </div>

                {/* Submit Button Section */}
                <div>
                  <Button
                    type="submit"
                    className="w-full bg-[#0041E9] hover:bg-[#0036c4] text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                </div>

                {/* Sign In Link Section */}
                <div className="text-center text-sm text-slate-600">
                  Already have an account?{' '}
                  <Link 
                    href="/careers/auth/signin" 
                    className="font-medium text-[#0041E9] hover:text-[#0036c4]"
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