'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MoreVertical, 
  User,
  CheckCircle,
  XCircle,
  FileText,
  File,
  CalendarClock,
  Filter,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomAlertDialog from '@/components/CustomAlertDialog';

interface Document {
  type: string;
  url: string;
  fileName: string;
}

interface Applicant {
  id: string;
  applicationId: string;
  name: string;
  email: string;
  appliedDate: string;
  status: string;
  score: number;
  documents: Document[];
}

interface JobApplicantsProps {
  jobId: string;
  jobTitle: string;
  onViewProfile?: (id: string) => void;
}

const APPLICATION_STATUSES = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  REJECTED: 'rejected',
  OFFERED: 'offered',
  HIRED: 'hired'
} as const;

const getScoreColor = (score: number) => {
  if (score >= 90) return 'bg-green-600';
  if (score >= 70) return 'bg-blue-600';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'shortlisted':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'interview_scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'offered':
      return 'bg-purple-100 text-purple-800';
    case 'hired':
      return 'bg-indigo-100 text-indigo-800';
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const JobApplicants = ({ 
  jobId,
  jobTitle,
  onViewProfile 
}: JobApplicantsProps) => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showInvalidActionDialog, setShowInvalidActionDialog] = useState(false);
  const [invalidActionDetails, setInvalidActionDetails] = useState({ name: '', action: '', currentStatus: '' });
  const [showMassUpdateDialog, setShowMassUpdateDialog] = useState(false);
  const [showConfirmActionDialog, setShowConfirmActionDialog] = useState(false);
  const [confirmActionDetails, setConfirmActionDetails] = useState({ 
    applicationId: '', 
    name: '', 
    action: '', 
    status: '' 
  });
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    return () => {
      setApplicants([]);
      setLoading(true);
      setError(null);
      setStatusFilter('all');
      setShowInvalidActionDialog(false);
      setInvalidActionDetails({ name: '', action: '', currentStatus: '' });
      setShowMassUpdateDialog(false);
      setShowConfirmActionDialog(false);
      setConfirmActionDetails({ applicationId: '', name: '', action: '', status: '' });
      setOpenDropdownId(null);
    };
  }, [jobId]);

  useEffect(() => {
    if (showInvalidActionDialog || showMassUpdateDialog || showConfirmActionDialog) {
      setOpenDropdownId(null);
    }
  }, [showInvalidActionDialog, showMassUpdateDialog, showConfirmActionDialog]);

  const fetchApplicants = useCallback(async () => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      const url = new URL('/api/job-application/applicants', window.location.origin);
      url.searchParams.append('jobId', jobId);
      if (statusFilter && statusFilter !== 'all') {
        url.searchParams.append('status', statusFilter);
      }

      const response = await fetch(url.toString());
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch applicants');
      }

      setApplicants(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [jobId, statusFilter]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);


  // Add this console.log
useEffect(() => {
  console.log('Applicants data:', applicants);
}, [applicants]);


  const handleMassUpdateToUnderReview = async () => {
    try {
      const response = await fetch('/api/job-application/applicants/mass-update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          fromStatus: APPLICATION_STATUSES.PENDING,
          toStatus: APPLICATION_STATUSES.UNDER_REVIEW
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update applicants');
      }

      await fetchApplicants();
      setShowMassUpdateDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const validateStatusTransition = useCallback((currentStatus: string, newStatus: string, applicant: Applicant): boolean => {
    const normalizedCurrentStatus = currentStatus.toLowerCase();
    const normalizedNewStatus = newStatus.toLowerCase();
    
    if (
      normalizedCurrentStatus === APPLICATION_STATUSES.PENDING && 
      (normalizedNewStatus === APPLICATION_STATUSES.SHORTLISTED || normalizedNewStatus === APPLICATION_STATUSES.REJECTED)
    ) {
      setInvalidActionDetails({
        name: applicant.name,
        action: normalizedNewStatus === APPLICATION_STATUSES.SHORTLISTED ? 'shortlisted' : 'rejected',
        currentStatus: normalizedCurrentStatus
      });
      setShowInvalidActionDialog(true);
      return false;
    }
    return true;
  }, []);

  const handleUpdateStatus = async (e: React.MouseEvent, applicationId: string, status: string) => {
    e.preventDefault();
    e.stopPropagation();

    setOpenDropdownId(null);

    const applicant = applicants.find(a => a.applicationId === applicationId);
    if (!applicant) return;

    const isValid = validateStatusTransition(applicant.status, status, applicant);
    if (!isValid) {
      return;
    }

    if (status === APPLICATION_STATUSES.SHORTLISTED || status === APPLICATION_STATUSES.REJECTED) {
      setConfirmActionDetails({
        applicationId,
        name: applicant.name,
        action: status === APPLICATION_STATUSES.SHORTLISTED ? 'shortlist' : 'reject',
        status
      });
      setShowConfirmActionDialog(true);
      return;
    }

    try {
      const response = await fetch('/api/job-application/applicants', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId, status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status');
      }

      await fetchApplicants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleConfirmedStatusUpdate = async () => {
    try {
      setEmailSending(true);
      
      if (confirmActionDetails.applicationId === 'mass-reject') {
        const response = await fetch('/api/job-application/applicants/mass-update', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId,
            fromStatus: APPLICATION_STATUSES.UNDER_REVIEW,
            toStatus: APPLICATION_STATUSES.REJECTED
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to update applicants');
        }

        const underReviewApplicants = applicants.filter(a => 
          a.status.toLowerCase() === APPLICATION_STATUSES.UNDER_REVIEW
        );

        try {
          const response = await fetch('/api/notifications/email/mass', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recipients: underReviewApplicants.map(applicant => ({
                to: applicant.email,
                jobTitle,
                applicantName: applicant.name,
                status: "rejected" as const
              }))
            }),
          });

          const emailResult = await response.json();
          if (!response.ok) {
            console.error('Failed to send some rejection emails:', emailResult);
          } else if (emailResult.failedEmails?.length > 0) {
            console.error('Some rejection emails failed:', emailResult.failedEmails);
          }
        } catch (error) {
          console.error('Error sending rejection emails:', error);
        }

        await fetchApplicants();
        setEmailSending(false);
        setShowConfirmActionDialog(false);
        setConfirmActionDetails({ applicationId: '', name: '', action: '', status: '' });
        return;
      }

      const response = await fetch('/api/job-application/applicants', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          applicationId: confirmActionDetails.applicationId, 
          status: confirmActionDetails.status 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status');
      }

      const applicant = applicants.find(a => a.applicationId === confirmActionDetails.applicationId);
      if (applicant) {
        try {
          await fetch('/api/notifications/email/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: applicant.email,
              jobTitle,
              applicantName: applicant.name,
              status: confirmActionDetails.status === APPLICATION_STATUSES.SHORTLISTED ? "shortlisted" as const : "rejected" as const
            }),
          });
        } catch (error) {
          console.error('Failed to send email notification:', error);
        }
      }

      await fetchApplicants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setEmailSending(false);
      setShowConfirmActionDialog(false);
      setConfirmActionDetails({ applicationId: '', name: '', action: '', status: '' });
    }
  };

  const handleViewDocument = useCallback((e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdownId(null);
    window.open(url, '_blank');
  }, []);

  const handleViewProfile = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdownId(null);
    onViewProfile?.(id);
  }, [onViewProfile]);

  const getDocumentByType = useCallback((documents: Document[], type: string) => {
    return documents.find(doc => doc.type.toLowerCase() === type.toLowerCase());
  }, []);

  const renderStatusActions = useCallback((applicant: Applicant) => {
    const currentStatus = applicant.status.toLowerCase();
    
    const actions = [];
    
    switch (currentStatus) {
      case APPLICATION_STATUSES.PENDING:
        actions.push(
          { status: APPLICATION_STATUSES.UNDER_REVIEW, label: 'Review', icon: FileText, color: 'text-blue-600' },
          { status: APPLICATION_STATUSES.SHORTLISTED, label: 'Shortlist', icon: CheckCircle, color: 'text-green-600' },
          { status: APPLICATION_STATUSES.REJECTED, label: 'Reject', icon: XCircle, color: 'text-red-600' }
        );
        break;
      
      case APPLICATION_STATUSES.UNDER_REVIEW:
        actions.push(
          { status: APPLICATION_STATUSES.SHORTLISTED, label: 'Shortlist', icon: CheckCircle, color: 'text-green-600' },
          { status: APPLICATION_STATUSES.REJECTED, label: 'Reject', icon: XCircle, color: 'text-red-600' }
        );
        break;
      
      case APPLICATION_STATUSES.SHORTLISTED:
        actions.push(
          { status: APPLICATION_STATUSES.INTERVIEW_SCHEDULED, label: 'Schedule Interview', icon: CalendarClock, color: 'text-blue-600' }
        );
        break;
      
      case APPLICATION_STATUSES.INTERVIEW_SCHEDULED:
        actions.push(
          { status: APPLICATION_STATUSES.OFFERED, label: 'Make Offer', icon: CheckCircle, color: 'text-green-600' }
        );
        break;
        
      case APPLICATION_STATUSES.OFFERED:
        actions.push({ status: APPLICATION_STATUSES.HIRED, label: 'Mark as Hired', icon: CheckCircle, color: 'text-green-600' }
        );
        break;
      
      case APPLICATION_STATUSES.REJECTED:
        // No actions available for rejected status
        break;
    }

    if (actions.length === 0) return null;

    return (
      <><DropdownMenuSeparator />
      {actions.map(({ status, label, icon: Icon, color }) => (
        <DropdownMenuItem
          key={status}
          onClick={(e) => handleUpdateStatus(e, applicant.applicationId, status)}
          className={`${color} cursor-pointer`}
        >
          <Icon className="mr-2 h-4 w-4" />
          {label}
        </DropdownMenuItem>
      ))}
    </>
  );
}, [handleUpdateStatus]);

const renderDocumentMenuItems = useCallback((applicant: Applicant) => {
  const resumeDoc = getDocumentByType(applicant.documents, 'resume');
  const coverLetterDoc = getDocumentByType(applicant.documents, 'cover_letter');

  return (
    <>
      {onViewProfile && (
        <DropdownMenuItem 
          onClick={(e) => handleViewProfile(e, applicant.id)}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
      )}
      {resumeDoc && (
        <DropdownMenuItem 
          onClick={(e) => handleViewDocument(e, resumeDoc.url)}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4" />
          View Resume
        </DropdownMenuItem>
      )}
      {coverLetterDoc && (
        <DropdownMenuItem 
          onClick={(e) => handleViewDocument(e, coverLetterDoc.url)}
          className="cursor-pointer"
        >
          <File className="mr-2 h-4 w-4" />
          View Cover Letter
        </DropdownMenuItem>
      )}
      {renderStatusActions(applicant)}
    </>
  );
}, [getDocumentByType, handleViewDocument, handleViewProfile, onViewProfile, renderStatusActions]);

if (loading) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

if (error) {
  return (
    <Alert variant="destructive" className="mb-4">
      {error}
    </Alert>
  );
}

return (
  <>
    <CustomAlertDialog
      isOpen={showMassUpdateDialog}
      onClose={() => setShowMassUpdateDialog(false)}
      title="Mass Update Pending Applications"
      description="This will move all pending applications to 'Under Review' status. Are you sure you want to continue?"
      confirmText="Continue"
      onConfirm={handleMassUpdateToUnderReview}
    />

    <CustomAlertDialog
      isOpen={showInvalidActionDialog}
      onClose={() => setShowInvalidActionDialog(false)}
      title="Action Not Allowed"
      description={`${invalidActionDetails.name} cannot be ${invalidActionDetails.action} until their application has been reviewed. Please change their status to "Under Review" first.`}
      confirmText="Understood"
      variant="danger"
    />

    <CustomAlertDialog
      isOpen={showConfirmActionDialog}
      onClose={() => {
        setShowConfirmActionDialog(false);
        setConfirmActionDetails({ applicationId: '', name: '', action: '', status: '' });
      }}
      title={`Confirm ${confirmActionDetails.action.charAt(0).toUpperCase() + confirmActionDetails.action.slice(1)}`}
      description={`Are you sure you want to ${confirmActionDetails.action} ${confirmActionDetails.name}? This action cannot be undone. An email will be sent to the applicant regarding the status of their application.`}
      confirmText={emailSending ? "Sending..." : "Confirm"}
      variant={confirmActionDetails.action === 'reject' ? 'danger' : 'default'}
      onConfirm={handleConfirmedStatusUpdate}
      disabled={emailSending}
    />

    <div className={`space-y-6 ${(showInvalidActionDialog || showMassUpdateDialog || showConfirmActionDialog) ? 'pointer-events-none' : ''}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Applicants ({applicants.length})</h2>
        
        <div className="flex items-center gap-2">
          {applicants.some(a => a.status.toLowerCase() === APPLICATION_STATUSES.PENDING) && (
            <Button
              variant="outline"
              onClick={() => setShowMassUpdateDialog(true)}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Review All Pending
            </Button>
          )}
          {applicants.some(a => a.status.toLowerCase() === APPLICATION_STATUSES.UNDER_REVIEW) && (
            <Button
              variant="outline"
              onClick={() => {
                setConfirmActionDetails({
                  applicationId: 'mass-reject',
                  name: 'all under review applicants',
                  action: 'reject',
                  status: APPLICATION_STATUSES.REJECTED
                });
                setShowConfirmActionDialog(true);
              }}
              className="gap-2 text-red-600 hover:text-red-700"
            >
              <XCircle className="h-4 w-4" />
              Reject All Under Review
            </Button>
          )}
          
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(APPLICATION_STATUSES).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  {key.split('_').map(word => 
                    word.charAt(0) + word.slice(1).toLowerCase()
                  ).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="w-[48px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applicants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500">
                  No applicants found
                </TableCell>
              </TableRow>
            ) : (
              applicants.map((applicant) => (
                <TableRow key={applicant.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <div className="font-medium">{applicant.name}</div>
                        <div className="text-sm text-slate-500">{applicant.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(applicant.appliedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(applicant.status)}`}>
                      {applicant.status.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-100 rounded-full h-2">
                        <div 
                          className={`${getScoreColor(applicant.score)} h-2 rounded-full`}
                          style={{ width: `${applicant.score}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600">{applicant.score}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu
                      open={openDropdownId === applicant.id}
                      onOpenChange={(open) => setOpenDropdownId(open ? applicant.id : null)}
                    >
                      <DropdownMenuTrigger 
                        asChild
                        className={showInvalidActionDialog || showMassUpdateDialog || showConfirmActionDialog ? 'pointer-events-none' : ''}
                      >
                        <div className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100 cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="w-48"
                      >
                        {renderDocumentMenuItems(applicant)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  </>
);
};

export default JobApplicants;