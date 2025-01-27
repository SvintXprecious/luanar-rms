'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Briefcase,
  FileText,
  LogOut,
  Menu,
  Search,
  User,
  BookMarked,
  MoreVertical,
} from 'lucide-react';
import { signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProfilePage from './ProfilePage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import CustomAlertDialog from "@/components/CustomAlertDialog";
import FindJobs from './FindJobs';
import ApplicationModal from './JobApplicationModal';

const formatStatus = (status) => {
  const statusMap = {
    'pending': 'Pending Review',
    'under_review': 'Under Review',
    'shortlisted': 'Shortlisted',
    'interview_scheduled': 'Interview Scheduled',
    'rejected': 'Unsuccessful',
    'offered': 'Offer Extended',
    'hired': 'Hired'
  };
  return statusMap[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const CareerDashboard = ({ session }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobCount, setJobCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newestJobs, setNewestJobs] = useState([]);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [jobsMap, setJobsMap] = useState({});
  const [jobs, setJobs] = useState([]);
  const [withdrawingApplication, setWithdrawingApplication] = useState(false);
  const [showWithdrawConfirmation, setShowWithdrawConfirmation] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  useEffect(() => {
    fetchJobCount();
    fetchNewestJobs();
    fetchApplicationsAndJobs();
  }, []);

  const fetchJobCount = async () => {
    try {
      const response = await fetch('/api/jobs?counts=true');
      if (!response.ok) throw new Error('Failed to fetch job counts');
      const { data } = await response.json();
      setJobCount(data.active_jobs);
    } catch (error) {
      console.error('Error fetching job counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewestJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const { data } = await response.json();
      setJobs(data);
      setNewestJobs(data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchApplicationsAndJobs = async () => {
    try {
      setLoadingApplications(true);
      
      const applicationsResponse = await fetch('/api/job-application');
      if (!applicationsResponse.ok) throw new Error('Failed to fetch applications');
      const applicationsData = await applicationsResponse.json();
      
      const jobsResponse = await fetch('/api/jobs');
      if (!jobsResponse.ok) throw new Error('Failed to fetch jobs');
      const jobsData = await jobsResponse.json();
      
      const jobsMapping = {};
      jobsData.data.forEach(job => {
        jobsMapping[job.id] = job;
      });
      
      setJobsMap(jobsMapping);
      setApplications(applicationsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleWithdrawConfirmation = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setShowWithdrawConfirmation(true);
  };

  const handleWithdrawApplication = async () => {
    if (!selectedApplicationId) return;
    
    try {
      setWithdrawingApplication(true);
      const response = await fetch('/api/job-application', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: selectedApplicationId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to withdraw application');
      }

      // Refresh applications after withdrawal
      await fetchApplicationsAndJobs();
    } catch (error) {
      console.error('Error withdrawing application:', error);
    } finally {
      setWithdrawingApplication(false);
      setShowWithdrawConfirmation(false);
      setSelectedApplicationId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'under_review':
        return 'text-blue-600 bg-blue-50';
      case 'shortlisted':
        return 'text-indigo-600 bg-indigo-50';
      case 'interview_scheduled':
        return 'text-purple-600 bg-purple-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'offered':
        return 'text-green-600 bg-green-50';
      case 'hired':
        return 'text-emerald-600 bg-emerald-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const navigation = [
    {
      title: 'Main',
      items: [
        { icon: Briefcase, label: 'Overview', id: 'overview' },
        { icon: Search, label: 'Find Jobs', id: 'jobs', badge: loading ? '...' : jobCount },
        { icon: FileText, label: 'Applications', id: 'applications', badge: applications.length }
      ]
    },
    {
      title: 'Profile',
      items: [
        { 
          icon: User, 
          label: 'My Profile', 
          id: 'profile',
          onClick: () => setActiveSection('profile')
        }
      ]
    }
  ];

  const JobDetailsModal = ({ job, isOpen, onClose }) => {
    if (!job) return null;
  
    const isClosingDatePassed = new Date(job.closing_date) < new Date();
    
    const handleApplyClick = () => {
      setIsApplicationModalOpen(true);
    };
  
    const handleApplicationModalClose = () => {
      setIsApplicationModalOpen(false);
    };
     
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">{job.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                  {job.employment_type_name}
                </span>
                <span className="text-sm text-slate-600">Department: {job.department_name?.toUpperCase()}</span>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Job Description</h3>
                <p className="text-slate-600">{job.description}</p>
              </div>
     
              <div>
                <h3 className="font-medium mb-2">Key Responsibilities</h3>
                <ul className="list-disc list-inside space-y-1">
                  {job.responsibilities?.map((resp, index) => (
                    <li key={index} className="text-slate-600">{resp}</li>
                  ))}
                </ul>
              </div>
     
              <div>
                <h3 className="font-medium mb-2">Qualifications</h3>
                <ul className="list-disc list-inside space-y-1">
                  {job.qualifications?.map((qual, index) => (
                    <li key={index} className="text-slate-600">{qual}</li>
                  ))}
                </ul>
              </div>
     
              <div>
                <h3 className="font-medium mb-2">Application Deadline</h3>
                <p className={`text-slate-600 ${isClosingDatePassed ? 'text-red-500' : ''}`}>
                  {new Date(job.closing_date).toLocaleDateString()}
                  {isClosingDatePassed && ' (Closed)'}
                </p>
              </div>
     
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button 
                  className="bg-[#0041E9] hover:bg-[#0036c4] text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                  onClick={handleApplyClick}
                  disabled={isClosingDatePassed}
                >
                  {isClosingDatePassed ? 'Applications Closed' : 'Apply Now'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
  
        <ApplicationModal 
          isOpen={isApplicationModalOpen}
          onClose={handleApplicationModalClose}
          jobId={job.id}
          jobTitle={job?.title || ''}
        />
      </>
    );
  };

  const renderApplicationCard = (app, jobDetails) => (
    <Card key={app.id}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-start w-full">
              <div>
                <h3 className="font-medium text-lg text-slate-900">
                  {jobDetails.title || 'Loading job details...'}
                </h3>
                <div className="flex gap-2 mt-2">
                  {jobDetails.department_name && (
                    <span className="bg-[#0041E9] bg-opacity-10 text-[#0041E9] px-3 py-1 rounded-full text-sm">
                      {jobDetails.department_name}
                    </span>
                  )}
                  {jobDetails.employment_type_name && (
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                      {jobDetails.employment_type_name}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-sm text-slate-500">
                    Applied: {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  getStatusColor(app.status)
                }`}>
                  {formatStatus(app.status)}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-red-600"
                      disabled={withdrawingApplication}
                      onClick={() => handleWithdrawConfirmation(app.id)}
                    >
                      Withdraw Application
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {app.documents.map((doc, index) => (
            <a
              key={index}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <FileText className="w-4 h-4" />
              {doc.type === 'resume' ? 'Resume' : 'Cover Letter'}
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderDashboardMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">
            Active Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">
            {loadingApplications ? '...' : applications.length}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {loadingApplications ? 'Loading...' : 'Applications in progress'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">
            Available Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">
            {loading ? '...' : jobCount}
          </div>
          <p className="text-sm text-slate-500 mt-1">Open positions</p>
        </CardContent>
      </Card>
      </div>
  );

  const renderApplications = () => (
    <div className="space-y-4">
      {loadingApplications ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-slate-500">Loading applications...</p>
          </CardContent>
        </Card>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-slate-500">No applications found.</p>
          </CardContent>
        </Card>
      ) : (
        applications.map((app) => {
          const jobDetails = jobsMap[app.job_id] || {};
          return renderApplicationCard(app, jobDetails);
        })
      )}
    </div>
  );

  const renderNewestPositions = () => (
    <div className="space-y-4">
      {newestJobs.map((job) => (
        <Card 
          key={job.id} 
          className="cursor-pointer hover:border-[#0041E9] transition-colors"
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg text-slate-900">{job.title}</h3>
                <p className="text-slate-600">{job.employment_type_name}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedJob(job);
                  setShowJobModal(true);
                }}
              >
                View Details
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs text-slate-500">
                Posted {new Date(job.created_at).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="text-xs text-slate-500">
                Deadline: {new Date(job.closing_date).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfilePage />;
      case 'jobs':
        return (
          <FindJobs 
            jobs={jobs}
            searchQuery={searchQuery}
            onJobSelect={(job) => {
              setSelectedJob(job);
              setShowJobModal(true);
            }}
          />
        );
      case 'applications':
        return (
          <div className="p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Applications</CardTitle>
                  <CardDescription>
                    Track your job applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderApplications()}
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'overview':
      default:
        return (
          <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {renderDashboardMetrics()}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderApplications()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Newest Positions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderNewestPositions()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`${
          isCollapsed ? 'w-16' : 'w-56'
        } bg-white border-r border-slate-200 flex flex-col transition-all duration-300`}>
          <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && <h1 className="text-xl font-bold text-slate-800">Careers</h1>}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-6">
            {navigation.map(category => (
              <div key={category.title}>
                {!isCollapsed && (
                  <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {category.title}
                  </div>
                )}
                <div className="space-y-1">
                  {category.items.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={item.onClick || (() => setActiveSection(item.id))}
                        className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium
                          ${activeSection === item.id 
                            ? 'bg-[#0041E9] text-white' 
                            : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        <Icon className={`w-5 h-5 ${
                          activeSection === item.id ? 'text-white' : 'text-slate-600'
                        }`} />
                        {!isCollapsed && (
                          <>
                            <span className="ml-3">{item.label}</span>
                            {item.badge !== undefined && (
                              <span className={`ml-auto px-2 py-0.5 text-xs rounded-lg ${
                                activeSection === item.id
                                  ? 'bg-white bg-opacity-20 text-white'
                                  : 'bg-[#0041E9] bg-opacity-10 text-[#0041E9]'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className={`flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-slate-100 cursor-pointer ${
                  isCollapsed ? 'justify-center' : 'justify-start'
                }`}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#0041E9] text-white">
                      {session.user.name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <span className="text-sm font-medium text-slate-900">
                      {session.user.name}
                    </span>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setActiveSection('profile')}>
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <Separator className="my-2" />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-slate-200">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-slate-800">
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                </h2>
                {activeSection === 'jobs' && (
                  <span className="px-2 py-0.5 text-xs rounded-lg bg-[#0041E9] bg-opacity-10 text-[#0041E9]">
                    {loading ? '...' : jobCount} positions
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                {activeSection === 'jobs' && (
                  <div className="relative w-64">
                    <Input
                      type="search"
                      placeholder="Search positions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  </div>
                )}
                
                <button className="p-2 rounded-full hover:bg-slate-100 relative">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              </div>
            </div>
          </header>

          {/* Dynamic Content Area */}
          <div className="flex-1 overflow-auto">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal 
        job={selectedJob}
        isOpen={showJobModal}
        onClose={() => {
          setShowJobModal(false);
          setSelectedJob(null);
        }}
      />

      {/* Withdraw Confirmation Dialog */}
      <CustomAlertDialog
        isOpen={showWithdrawConfirmation}
        onClose={() => {
          setShowWithdrawConfirmation(false);
          setSelectedApplicationId(null);
        }}
        title="Withdraw Application"
        description="Are you sure you want to withdraw this application? This action cannot be undone."
        confirmText="Withdraw"
        onConfirm={handleWithdrawApplication}
        variant="danger"
      />
    </div>
  );
};

export default CareerDashboard;