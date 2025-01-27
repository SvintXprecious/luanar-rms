'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Building2,
  ChevronLeft,
  ChevronRight,
  Users,
  GraduationCap,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Award,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Enhanced color system
const colors = {
  primary: {
    main: '#2eb135',     // Updated to correct green
    light: '#e6f8e7',    // Light green for contrast
    dark: '#25902b',     // Darker shade of the main green
    contrast: '#ffffff', 
    complement: '#b12eaa' // Complementary color
  },
  secondary: {
    main: '#0f766e',     
    light: '#e7f9f7',
    dark: '#0c5a55',
    contrast: '#ffffff',
    complement: '#760f17'
  },
  accent: {
    amber: '#d97706',    
    purple: '#7e22ce',   
    blue: '#2563eb'     
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
  }
};

// Types
interface Department {
  id: number;
  name: string;
  is_active: boolean;
}

interface EmploymentType {
  id: number;
  name: string;
  is_active: boolean;
}

interface ExperienceLevel {
  id: number;
  level_id: string;
  label: string;
  year_range: string;
  is_active: boolean;
}

interface Job {
  id: number;
  title: string;
  department_id: number;
  location: string;
  employment_type_id: number;
  closing_date: string;
  description: string;
  responsibilities: string[];
  education_level_id: number;
  experience_level_id: number;
  skills: string[];
  qualifications: string[];
  terms_and_conditions: string;
  additional_information?: string;
  posted_by: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Components
const Header = () => (
  <header className="bg-white border-b shadow-sm sticky top-0 z-50" 
          style={{ borderColor: colors.neutral[200] }}>
    <div className="max-w-7xl mx-auto px-6">
      <nav className="flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/luanar.png" 
            alt="LUANAR Logo" 
            width={40} 
            height={40}
            className="rounded-lg"
          />
          <div className="flex items-baseline">
            <span className="text-xl font-bold" style={{ color: colors.neutral[800] }}>LUA</span>
            <span className="text-xl font-bold" style={{ color: colors.primary.main }}>NAR</span>
            <span className="ml-2 text-lg font-semibold" style={{ color: colors.neutral[700] }}>Careers</span>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            href="/about" 
            className="text-sm hover:text-slate-900 transition-colors"
            style={{ color: colors.neutral[600] }}
          >
            About Us
          </Link>
          <Link 
            href="/" 
            className="text-sm hover:text-slate-900 transition-colors"
            style={{ color: colors.neutral[600] }}
          >
            Careers
          </Link>
          <Button 
            asChild 
            className="text-white hover:opacity-90 transition-colors"
            style={{ backgroundColor: colors.primary.main }}
          >
            <Link href="/careers/dashboard">Sign in</Link>
          </Button>
        </div>
      </nav>
    </div>
  </header>
);

const JobCard = ({ 
  job, 
  getDepartmentName, 
  getEmploymentTypeName, 
  getExperienceLevelLabel 
}: {
  job: Job;
  getDepartmentName: (id: number) => string;
  getEmploymentTypeName: (id: number) => string;
  getExperienceLevelLabel: (id: number) => string;
}) => {
  const isClosingSoon = (date: string) => {
    const closing = new Date(date);
    const today = new Date();
    const diffTime = closing.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden"
          style={{ borderColor: colors.neutral[200] }}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold" 
                style={{ color: colors.neutral[900] }}>{job.title}</h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: `${colors.primary.main}15`,
                      color: colors.primary.main 
                    }}>
                <Building2 className="w-4 h-4 mr-1.5" />
                {getDepartmentName(job.department_id)}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: `${colors.secondary.main}15`,
                      color: colors.secondary.main 
                    }}>
                <MapPin className="w-4 h-4 mr-1.5" />
                {job.location}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm"
                 style={{ color: colors.neutral[600] }}>
              <Calendar className="w-4 h-4 mr-1.5" />
              Posted: {new Date(job.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm font-medium"
                 style={{ 
                   color: isClosingSoon(job.closing_date) ? colors.accent.amber : colors.secondary.main 
                 }}>
              <Clock className="w-4 h-4 mr-1.5" />
              {isClosingSoon(job.closing_date) ? 'Closing Soon! ' : 'Closes: '}
              {new Date(job.closing_date).toLocaleDateString()}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" 
                   className="text-white"
                   style={{ backgroundColor: colors.accent.purple }}>
              {getEmploymentTypeName(job.employment_type_id)}
            </Badge>
            <Badge variant="secondary" 
                   className="text-white"
                   style={{ backgroundColor: colors.accent.blue }}>
              {getExperienceLevelLabel(job.experience_level_id)}
            </Badge>
          </div>

          <p className="text-sm line-clamp-2" 
             style={{ color: colors.neutral[600] }}>{job.description}</p>

          <div className="flex justify-end">
            <Button 
              asChild
              className="text-white hover:opacity-90 transition-colors gap-1.5"
              style={{ backgroundColor: colors.primary.main }}
            >
              <Link href={`/careers/jobs/${job.id}`}>
                View Details
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ValueProposition = ({ icon: Icon, title, description }: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
}) => (
  <div className="flex items-center gap-3">
    <div className="p-3 rounded-lg" style={{ backgroundColor: colors.primary.dark }}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h3 className="font-medium text-white">{title}</h3>
      <p className="text-sm" style={{ color: colors.primary.light }}>{description}</p>
    </div>
  </div>
);

const FilterSection = ({ 
  title, 
  options, 
  selectedValue, 
  onChange 
}: {
  title: string;
  options: { id: number; name?: string; label?: string; year_range?: string; }[];
  selectedValue: string;
  onChange: (value: string) => void;
}) => (
  <div className="mb-6">
    <h3 className="px-4 mb-3 text-xs font-semibold uppercase tracking-wider" 
        style={{ color: colors.neutral[500] }}>
      {title}
    </h3>
    <div className="space-y-1">
      <label className="flex items-center w-full px-4 py-2 rounded-lg text-sm font-medium 
                     transition-all hover:bg-slate-100 cursor-pointer"
             style={{ color: colors.neutral[600] }}>
        <input
          type="radio"
          checked={selectedValue === 'all'}
          onChange={() => onChange('all')}
          className="rounded border-slate-200 text-primary-600 focus:ring-primary-600"
        />
        <span className="ml-2">All {title}</span>
      </label>
      {options.map((option) => (
        <label 
          key={option.id} 
          className="flex items-center w-full px-4 py-2 rounded-lg text-sm font-medium 
                   transition-all hover:bg-slate-100 cursor-pointer"
          style={{ color: colors.neutral[600] }}
        >
          <input
            type="radio"
            checked={selectedValue === option.id.toString()}
            onChange={() => onChange(option.id.toString())}
            className="rounded border-slate-200 text-primary-600 focus:ring-primary-600"
          />
          <span className="ml-2">
            {option.name || option.label}
            {option.year_range && ` (${option.year_range})`}
          </span>
        </label>
      ))}
    </div>
  </div>
);

const ITEMS_PER_PAGE = 10;

export default function CareersPage() {
  // States
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<ExperienceLevel[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('all');
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [deptResponse, empTypeResponse, expLevelResponse, jobsResponse] = await Promise.all([
        fetch('/api/settings/departments'),
        fetch('/api/settings/employment'),
        fetch('/api/settings/experience-levels'),
        fetch('/api/jobs')
      ]);

      const [deptData, empTypeData, expLevelData, jobsData] = await Promise.all([
        deptResponse.json(),
        empTypeResponse.json(),
        expLevelResponse.json(),
        jobsResponse.json()
      ]);

      if (deptData.success) {
        setDepartments(deptData.departments.filter((dept: Department) => dept.is_active));
      }
      if (empTypeData.success) {
        setEmploymentTypes(empTypeData.employmentTypes.filter((type: EmploymentType) => type.is_active));
      }
      if (expLevelData.success) {
        setExperienceLevels(expLevelData.experience_levels.filter((level: ExperienceLevel) => level.is_active));
      }
      if (jobsData.success) {
        setJobs(jobsData.data);
      }

    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const closingDate = new Date(job.closing_date);
    const today = new Date();
    
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesDepartment = selectedDepartment === 'all' || 
      job.department_id.toString() === selectedDepartment;

    const matchesEmploymentType = selectedEmploymentType === 'all' ||
      job.employment_type_id.toString() === selectedEmploymentType;

    const matchesExperienceLevel = selectedExperienceLevel === 'all' ||
      job.experience_level_id.toString() === selectedExperienceLevel;

    const isOpen = closingDate > today;

    return matchesSearch && matchesDepartment && 
           matchesEmploymentType && matchesExperienceLevel && isOpen;
  });

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Helper functions
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('all');
    setSelectedEmploymentType('all');
    setSelectedExperienceLevel('all');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const getDepartmentName = (id: number) => {
    const department = departments.find(dept => dept.id === id);
    return department?.name || 'Unknown Department';
  };

  const getEmploymentTypeName = (id: number) => {
    const employmentType = employmentTypes.find(type => type.id === id);
    return employmentType?.name || 'Unknown Type';
  };

  const getExperienceLevelLabel = (id: number) => {
    const experienceLevel = experienceLevels.find(level => level.id === id);
    return experienceLevel?.label || 'Unknown Level';
  };

  // Value propositions data
  const valueProps = [
    {
      icon: Award,
      title: "Excellence",
      description: "Contribute to education, research and effective administration"
    },
    {
      icon: GraduationCap,
      title: "Innovation",
      description: "Shape the future through academic and operational excellence"
    },
    {
      icon: Users,
      title: "Professionalism",
      description: "Join our diverse team of educators and professionals"
    }
   ];

  // Loading state
  if (isLoading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto"
               style={{ 
                 borderColor: colors.neutral[200],
                 borderTopColor: colors.primary.main 
               }} />
          <p className="mt-4" style={{ color: colors.neutral[600] }}>
            Loading available positions...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center" style={{ color: colors.neutral[600] }}>
          <p>Error loading jobs: {error}</p>
          <Button 
            onClick={fetchData}
            className="mt-4 text-white hover:opacity-90 transition-colors"
            style={{ backgroundColor: colors.primary.main }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.neutral[50] }}>
      <Header />
      
      {/* Hero Section */}
      <div style={{ backgroundColor: colors.primary.main }} className="text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Join LUANAR</h1>
            <p className="text-xl mb-8" style={{ color: colors.primary.light }}>
              Be part of Malawi's leading institution in agriculture, natural resources, and development studies
            </p>
            
            {/* Value Propositions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {valueProps.map((prop, index) => (
                <ValueProposition key={index} {...prop} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-8">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 max-w-3xl">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                      style={{ color: colors.neutral[400] }} />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search opportunities at LUANAR"
                className="pl-9 w-full focus:ring-2 focus:ring-primary-600"
                style={{ borderColor: colors.neutral[200] }}
              />
            </div>
            <Select 
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleSearch}
              className="text-white hover:opacity-90 transition-colors px-6"
              style={{ backgroundColor: colors.primary.main }}
            >
              Search
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 bg-white rounded-xl shadow-sm p-6"
               style={{ borderColor: colors.neutral[200] }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold" 
                  style={{ color: colors.neutral[900] }}>Filters</h2>
              {(selectedEmploymentType !== 'all' || selectedExperienceLevel !== 'all') && (
                <Badge variant="secondary" className="text-white"
                       style={{ backgroundColor: colors.primary.main }}>
                  {(selectedEmploymentType !== 'all' ? 1 : 0) + 
                   (selectedExperienceLevel !== 'all' ? 1 : 0)} active
                </Badge>
              )}
            </div>

            <FilterSection
              title="Employment Type"
              options={employmentTypes}
              selectedValue={selectedEmploymentType}
              onChange={setSelectedEmploymentType}
            />

            <FilterSection
              title="Experience Level"
              options={experienceLevels}
              selectedValue={selectedExperienceLevel}
              onChange={setSelectedExperienceLevel}
            />

            {(selectedEmploymentType !== 'all' || selectedExperienceLevel !== 'all') && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full"
                style={{ color: colors.primary.main }}
              >
                Clear all filters
              </Button>
            )}
          </div>

          {/* Jobs Section */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6"
                 style={{ borderColor: colors.neutral[200] }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold" 
                    style={{ color: colors.neutral[800] }}>
                  Current Opportunities
                  <span className="text-sm ml-2" 
                        style={{ color: colors.neutral[600] }}>
                    {filteredJobs.length} {filteredJobs.length === 1 ? 'position' : 'positions'}
                  </span>
                </h2>
              </div>

              <div className="space-y-4">
                {paginatedJobs.length > 0 ? (
                  <>
                    {paginatedJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        getDepartmentName={getDepartmentName}
                        getEmploymentTypeName={getEmploymentTypeName}
                        getExperienceLevelLabel={getExperienceLevelLabel}
                      />
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex flex-col md:flex-row items-center justify-between border-t pt-6 mt-6"
                           style={{ borderColor: colors.neutral[200] }}>
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                          <p className="text-sm" style={{ color: colors.neutral[600] }}>
                            Showing {startIndex + 1} to{' '}
                            {Math.min(startIndex + ITEMS_PER_PAGE, filteredJobs.length)} of{' '}
                            {filteredJobs.length} opportunities
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            disabled={currentPage === 1}
                            style={{ color: colors.neutral[600] }}
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={currentPage === page ? "text-white" : ""}
                                style={{ 
                                  backgroundColor: currentPage === page ? colors.primary.main : 'transparent',
                                  color: currentPage === page ? colors.primary.contrast : colors.neutral[600]
                                }}
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage === totalPages}
                            style={{ color: colors.neutral[600] }}
                          >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 mx-auto mb-3" 
                            style={{ color: colors.neutral[400] }} />
                    <h3 className="text-lg font-medium mb-1" 
                        style={{ color: colors.neutral[900] }}>
                      No positions match your criteria
                    </h3>
                    {(searchTerm || selectedDepartment !== 'all' || 
                      selectedEmploymentType !== 'all' || 
                      selectedExperienceLevel !== 'all') && (
                      <>
                        <p className="mb-4" style={{ color: colors.neutral[600] }}>
                          Try adjusting your filters or search terms
                        </p>
                        <Button
                          onClick={clearFilters}
                          variant="outline"
                          style={{ color: colors.primary.main }}
                        >
                          Clear all filters
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && jobs.length > 0 && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 rounded-full animate-spin"
               style={{ 
                 borderColor: colors.neutral[200],
                 borderTopColor: colors.primary.main 
               }} />
        </div>
      )}
    </div>
  );
}