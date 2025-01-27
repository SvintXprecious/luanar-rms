'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Edit2,
  Share2,
  Trash2,
  MoreVertical,
  AlertCircle,
  FileText
} from 'lucide-react';
import JobDescriptionContent from './components/JobDescriptionContent';
import JobApplicants from './components/JobApplicants';
import JobMatches from './components/JobMatches';
import ScheduledInterviews from './components/ScheduledInterviews';

// Types
interface Job {
  id: number;
  title: string;
  department_name: string;
  education_level_name: string;
  employment_type_name: string;
  experience_level_label: string;
  experience_year_range: string;
  posted_by_name: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  closing_date: string;
  created_at: string;
  is_active: boolean;
  additional_information?: string;
}

type SortDirection = 'asc' | 'desc' | null;
type SortField = 'title' | 'department_name' | null;

interface SortState {
  field: SortField;
  direction: SortDirection;
}

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-6 p-4 border rounded-lg">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ))}
  </div>
);

// Custom hooks
const useJobDetails = (jobId: number | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<Job | null>(null);

  const fetchJobDetails = useCallback(async () => {
    if (!jobId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/jobs?id=${jobId}`);
      if (!response.ok) throw new Error('Failed to fetch job details');

      const data = await response.json();
      if (data.success) {
        setJobDetails(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch job details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  React.useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  return { jobDetails, loading, error, refetch: fetchJobDetails };
};

const useJobs = (isActive: boolean, currentPage: number, pageSize: number) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      
      const data = await response.json();
      if (data.success) {
        const filteredJobs = data.data.filter((job: Job) => job.is_active === isActive);
        setJobs(filteredJobs);
        
        setPagination({
          totalItems: filteredJobs.length,
          totalPages: Math.ceil(filteredJobs.length / pageSize)
        });
      } else {
        throw new Error(data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [isActive, pageSize]);

  React.useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, pagination, refetch: fetchJobs };
};

// Job Details Component
const JobDetailsView = ({ 
  jobId,
  onBack
}: { 
  jobId: number;
  onBack: () => void;
}) => {
  const { jobDetails: job, loading, error } = useJobDetails(jobId);
  const [activeTab, setActiveTab] = useState('jobdescription');
  const [isScrolled, setIsScrolled] = useState(false);
  const { toast } = useToast();

  // Handle scroll for sticky header
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle share button click
  const handleShare = useCallback(async () => {
    try {
      const shareUrl = `${window.location.origin}/careers/${jobId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Success",
        description: "Link copied to clipboard!",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [jobId, toast]);

  // Prevent event bubbling for tab clicks
  const handleTabClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-white min-h-screen p-8">
        <div className="max-w-[90rem] mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-white min-h-screen p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex-1 bg-white min-h-screen p-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No job details found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white min-h-screen">
      <div className="space-y-6">
        {/* Header */}
        <div className={`bg-white ${!isScrolled ? 'border-b' : 'shadow-sm'} sticky top-0 z-50`}>
          <div className="max-w-[90rem] mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Back to Jobs
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Title and Status */}
        <div className="max-w-[90rem] mx-auto px-4 md:px-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-semibold">{job.title}</h1>
                <span className={`px-4 py-1 rounded-full text-xs font-medium 
                  ${job.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {job.is_active ? 'Active' : 'Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Meta Information */}
        <div className="max-w-[90rem] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-xl">
            <div>
              <div className="text-sm text-slate-600">Department</div>
              <div className="mt-1 font-medium">{job.department_name}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600">Employment Type</div>
              <div className="mt-1 font-medium">{job.employment_type_name}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600">Experience Level</div>
              <div className="mt-1 font-medium">{job.experience_level_label}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600">Education Level</div>
              <div className="mt-1 font-medium">{job.education_level_name}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600">Posted By</div>
              <div className="mt-1 font-medium">{job.posted_by_name}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600">Closing Date</div>
              <div className="mt-1 font-medium">
                {new Date(job.closing_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className={`sticky top-16 bg-white z-40 transition-all duration-200
          ${isScrolled ? 'border-b shadow-sm' : ''}
        `}>
          <div className="max-w-[90rem] mx-auto px-4 md:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList 
                className="w-full justify-start h-auto p-0 bg-transparent overflow-x-auto"
                onClick={handleTabClick}
              >
                {[
                  { id: 'jobdescription', label: 'Job Description' },
                  { id: 'applicants', label: 'Applicants' },
                  { id: 'matches', label: 'Matches' },
                  { id: 'interviews', label: 'Interviews' },
                ].map(tab => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    onClick={handleTabClick}
                    className="px-4 py-2 rounded-full data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 whitespace-nowrap"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="jobdescription" className="mt-6">
                <div className="max-w-[90rem] mx-auto">
                  <JobDescriptionContent job={job} />
                </div>
              </TabsContent>

              <TabsContent value="applicants" className="mt-6">
                <div className="max-w-[90rem] mx-auto">
                  <JobApplicants 
                    jobId={job.id.toString()} 
                    jobTitle={job.title.toString()}
                    onViewProfile={(id) => {
                      console.log('View profile:', id);
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="matches" className="mt-6">
                <div className="max-w-[90rem] mx-auto">
                  <JobMatches 
                    jobId={job.id.toString()}
                    onScheduleInterview={(id) => {
                      console.log('Schedule interview:', id);
                    }}
                    onRemoveMatch={(id) => {
                      console.log('Remove match:', id);
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="interviews" className="mt-6">
                <div className="max-w-[90rem] mx-auto">
                  <ScheduledInterviews 
                    jobId={job.id.toString()}
                    onReschedule={(id) => {
                      console.log('Reschedule interview:', id);
                    }}
                    onCancel={(id) => {
                      console.log('Cancel interview:', id);
                    }}
                    onViewDetails={(id) => {
                      console.log('View interview details:', id);
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function JobsContent() {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  const [sort, setSort] = useState<SortState>({ field: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { toast } = useToast();

  // Fetch jobs data
  const { jobs, loading, error, pagination } = useJobs(
    activeTab === 'active',
    currentPage,
    pageSize
  );

  // Sort jobs
  const sortedJobs = useMemo(() => {
    if (!sort.field || !sort.direction || !jobs) return jobs;
    
    return [...jobs].sort((a, b) => {
      const aValue = a[sort.field].toLowerCase();
      const bValue = b[sort.field].toLowerCase();
      return sort.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [jobs, sort]);

  // Handle sort click
  const handleSort = useCallback((field: SortField) => {
    setSort(prev => ({
      field,
      direction: 
        prev.field === field 
          ? prev.direction === 'asc'
            ? 'desc'
            : prev.direction === 'desc'
              ? null
              : 'asc'
          : 'asc'
    }));
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((newSize: string) => {
    const size = parseInt(newSize);
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  // Handle share
  const handleShare = useCallback(async (jobId: number) => {
    try {
      const shareUrl = `${window.location.origin}/careers/${jobId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Success",
        description: "Link copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Prevent event bubbling
  const handleDropdownClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (selectedJobId) {
    return (
      <JobDetailsView 
        jobId={selectedJobId} 
        onBack={() => setSelectedJobId(null)}
      />
    );
  }

  return (
    <div className="flex-1 bg-slate-50 px-4 md:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Status Tabs */}
        <div className="mb-6">
          <Tabs defaultValue="active" onValueChange={setActiveTab}>
            <TabsList className="inline-flex h-10 p-1 bg-slate-100 rounded-full">
              <TabsTrigger value="active" className="px-6 rounded-full">
                Active
              </TabsTrigger>
              <TabsTrigger value="closed" className="px-6 rounded-full">
                Closed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl border shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-6 p-4 bg-slate-50 border-b">
            <button 
              onClick={() => handleSort('title')}
              className="flex items-center text-sm font-medium text-slate-600"
            >
              Title
              {sort.field === 'title' && (
                sort.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> :
                sort.direction === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> :
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => handleSort('department_name')}
              className="flex items-center text-sm font-medium text-slate-600"
            >
              Department
              {sort.field === 'department_name' && (
                sort.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> :
                sort.direction === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> :
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </button>
            <div>Employment Type</div>
            <div className="w-[48px]" />
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="p-4">
              <LoadingSkeleton />
            </div>
          ) : (
            /* Table Body */
            <div className="divide-y">
              {sortedJobs.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-slate-500">
                  No jobs found
                </div>
              ) : (
                sortedJobs
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className="grid grid-cols-[1fr_1fr_1fr_auto] gap-6 p-4 hover:bg-slate-50 cursor-pointer"
                    >
                      <div>{job.title}</div>
                      <div>{job.department_name}</div>
                      <div>{job.employment_type_name}</div>
                      <div 
                        className="flex items-center w-[48px]"
                        onClick={handleDropdownClick}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100">
                              <MoreVertical className="h-4 w-4" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJobId(job.id);
                            }}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              console.log('Edit job:', job.id);
                            }}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit Job
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleShare(job.id);
                            }}>
                              <Share2 className="mr-2 h-4 w-4" />
                              Share Position
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Delete job:', job.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Job
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && sortedJobs.length > 0 && (
            <div className="p-4 border-t">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="hidden sm:inline">Showing</span>{' '}
                  <span className="font-medium">
                    {((currentPage - 1) * pageSize) + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, pagination.totalItems)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.totalItems}</span>{' '}
                  jobs
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-l-full rounded-r-none border-r-0"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none border-r-0"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center border border-input bg-white px-3 h-9">
                      <span className="text-sm">
                        Page {currentPage} of {pagination.totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none border-l-0"
                      onClick={() => setCurrentPage(prev => 
                        Math.min(pagination.totalPages, prev + 1)
                      )}
                      disabled={currentPage === pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-r-full rounded-l-none border-l-0"
                      onClick={() => setCurrentPage(pagination.totalPages)}
                      disabled={currentPage === pagination.totalPages}
                    >
                      Last
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  
                  <Select
                    value={pageSize.toString()}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 50].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}