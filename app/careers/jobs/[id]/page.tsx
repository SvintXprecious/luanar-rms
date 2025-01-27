'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Calendar, 
  MapPin,
  Clock,
  Building2,
  ChevronRight,
  GraduationCap,
  Award
} from 'lucide-react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';

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
  accent: {
    amber: '#d97706'
  }
};

interface Qualification {
  description: string;
  type: string;
}

interface JobDetails {
  id: number;
  title: string;
  department_name: string;
  employment_type_name: string;
  experience_level_label: string;
  created_at: string;
  closing_date: string;
  location: string;
  description: string;
  responsibilities: string[];
  qualifications: Array<string | Qualification>;
  terms_and_conditions: string;
  education_level_name: string;
  experience_year_range: string;
  posted_by_name: string;
}

interface BulletPointProps {
  children: React.ReactNode;
}

interface LoadingSectionProps {
  message?: string;
}

interface ErrorStateProps {
  message: string;
}

interface JobDetailsContentProps {
  jobDetails: JobDetails;
}

const BulletPoint: React.FC<BulletPointProps> = ({ children }) => (
  <li className="flex items-start">
    <span className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" 
          style={{ backgroundColor: colors.primary.main }} />
    <span style={{ color: colors.neutral[600] }}>{children}</span>
  </li>
);

const LoadingState: React.FC<LoadingSectionProps> = ({ message = "Loading job details..." }) => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.neutral[50] }}>
    <div className="text-center">
      <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto" 
           style={{ 
             borderColor: colors.neutral[200],
             borderTopColor: colors.primary.main 
           }} />
      <p className="mt-4" style={{ color: colors.neutral[600] }}>{message}</p>
    </div>
  </div>
);

const ErrorState: React.FC<ErrorStateProps> = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.neutral[50] }}>
    <div className="max-w-md text-center px-4">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-2" style={{ color: colors.neutral[900] }}>
            Something went wrong
          </h2>
          <p className="mb-6" style={{ color: colors.neutral[600] }}>{message}</p>
          <Button 
            asChild 
            className="hover:opacity-90 transition-colors"
            style={{ backgroundColor: colors.primary.main, color: colors.primary.contrast }}
          >
            <Link href="/careers">Back to Jobs</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
);

const JobKeyFeatures: React.FC<{ jobDetails: JobDetails }> = ({ jobDetails }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.primary.main}15` }}>
          <GraduationCap className="w-6 h-6" style={{ color: colors.primary.main }} />
        </div>
        <div>
          <h3 className="font-medium" style={{ color: colors.neutral[700] }}>Education</h3>
          <p className="text-sm" style={{ color: colors.neutral[600] }}>{jobDetails.education_level_name}</p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.primary.main}15` }}>
          <Award className="w-6 h-6" style={{ color: colors.primary.main }} />
        </div>
        <div>
          <h3 className="font-medium" style={{ color: colors.neutral[700] }}>Experience</h3>
          <p className="text-sm" style={{ color: colors.neutral[600] }}>{jobDetails.experience_year_range}</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const JobDetailsContent: React.FC<JobDetailsContentProps> = ({ jobDetails }) => {
  const isClosingSoon = () => {
    const closing = new Date(jobDetails.closing_date);
    const today = new Date();
    const diffTime = closing.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: colors.neutral[50] }}>
      <div className="max-w-7xl mx-auto px-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <nav className="flex items-center text-sm mb-6">
              <Link 
                href="/careers/jobs" 
                className="hover:text-primary-600 transition-colors"
                style={{ color: colors.neutral[600] }}
              >
                Careers
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" style={{ color: colors.neutral[400] }} />
              <span style={{ color: colors.neutral[900] }}>{jobDetails.title}</span>
            </nav>

            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4" style={{ color: colors.neutral[900] }}>
                  {jobDetails.title}
                </h1>

                <div className="flex flex-wrap gap-4 mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: `${colors.primary.main}15`,
                          color: colors.primary.main 
                        }}>
                    <Building2 className="w-4 h-4 mr-1.5" />
                    {jobDetails.department_name}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: `${colors.primary.main}15`,
                          color: colors.primary.main 
                        }}>
                    <MapPin className="w-4 h-4 mr-1.5" />
                    {jobDetails.location}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center text-sm" style={{ color: colors.neutral[600] }}>
                    <Calendar className="w-4 h-4 mr-1.5" />
                    Posted: {new Date(jobDetails.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm font-medium"
                       style={{ 
                         color: isClosingSoon() ? colors.accent.amber : colors.neutral[600]
                       }}>
                    <Clock className="w-4 h-4 mr-1.5" />
                    {isClosingSoon() ? 'Closing Soon! ' : 'Closes: '}
                    {new Date(jobDetails.closing_date).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    asChild
                    className="hover:opacity-90 transition-colors"
                    style={{ backgroundColor: colors.primary.main, color: colors.primary.contrast }}
                  >
                    <Link href={`/careers/dashboard?jobId=${jobDetails.id}`}>Apply Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <JobKeyFeatures jobDetails={jobDetails} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8 space-y-8">
                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: colors.neutral[900] }}>
                    About the Role
                  </h2>
                  <p className="leading-relaxed" style={{ color: colors.neutral[600] }}>
                    {jobDetails.description}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: colors.neutral[900] }}>
                    Key Responsibilities
                  </h2>
                  <ul className="space-y-2">
                    {jobDetails.responsibilities.map((item, index) => (
                      <BulletPoint key={index}>{item}</BulletPoint>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: colors.neutral[900] }}>
                    Required Qualifications
                  </h2>
                  <ul className="space-y-2">
                    {Array.isArray(jobDetails.qualifications) ? 
                      jobDetails.qualifications.map((item, index) => (
                        <BulletPoint key={index}>{typeof item === 'string' ? item : item.description}</BulletPoint>
                      ))
                      : null
                    }
                  </ul>
                </section>

                {jobDetails.terms_and_conditions && (
                  <section>
                    <h2 className="text-xl font-semibold mb-4" style={{ color: colors.neutral[900] }}>
                      Terms and Conditions
                    </h2>
                    <p className="leading-relaxed" style={{ color: colors.neutral[600] }}>
                      {jobDetails.terms_and_conditions}
                    </p>
                  </section>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4" style={{ color: colors.neutral[900] }}>
                  Quick Apply
                </h2>
                <p className="text-sm mb-6" style={{ color: colors.neutral[600] }}>
                  Join our team at LUANAR and help shape the future of agricultural education.
                </p>
                <Button 
                  asChild
                  className="w-full hover:opacity-90 transition-colors mb-4"
                  style={{ backgroundColor: colors.primary.main, color: colors.primary.contrast }}
                >
                  <Link href={`/careers/dashboard?jobId=${jobDetails.id}`}>Apply Now</Link>
                </Button>
                <div className="text-xs text-center" style={{ color: colors.neutral[500] }}>
                  You can also email your resume to{' '}
                  <a 
                    href="mailto:careers@luanar.ac.mw" 
                    className="hover:underline"
                    style={{ color: colors.primary.main }}
                  >
                    careers@luanar.ac.mw
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const getJobDetails = async (id: string): Promise<JobDetails> => {
  const response = await fetch(`/api/jobs?id=${id}`);
  if (!response.ok) throw new Error('Failed to fetch job details');
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Invalid API response');
  return result.data;
};

export default function JobDetailsPage() {
  const params = useParams();
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (!params.id) throw new Error('No job ID provided');
        const details = await getJobDetails(params.id as string);
        setJobDetails(details);
      } catch (err) {
        setError('Failed to fetch job details. Please try again later.');
        console.error('Error:', err);
      }
    };

    fetchDetails();
  }, [params.id]);

  if (error) return <ErrorState message={error} />;
  if (!jobDetails) return <LoadingState />;
  return <JobDetailsContent jobDetails={jobDetails} />;
}