
import React, { useState, useEffect } from 'react';
import { 
  MoreVertical,
  User,
  CalendarClock,
  FileText,
  File
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

interface Document {
  type: string;
  url: string;
  fileName: string;
}

interface ShortlistedApplicant {
  id: string;
  applicationId: string;
  name: string;
  email: string;
  appliedDate: string;
  status: string;
  score: number;
  documents: Document[];
}

interface JobMatchesProps {
  jobId: string;
  onScheduleInterview?: (id: string) => void;
  onViewProfile?: (id: string) => void;
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'bg-green-600';
  if (score >= 70) return 'bg-blue-600';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

const JobMatches = ({ jobId, onScheduleInterview, onViewProfile }: JobMatchesProps) => {
  const [applicants, setApplicants] = useState<ShortlistedApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setError('Job ID is required');
      setLoading(false);
      return;
    }
    fetchShortlistedApplicants();
  }, [jobId]);

  const fetchShortlistedApplicants = async () => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/job-application/applicants?jobId=${jobId}&status=shortlisted`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch shortlisted applicants');
      }

      const shortlisted = result.data.filter((applicant: ShortlistedApplicant) => 
        applicant.status === 'shortlisted'
      );
      setApplicants(shortlisted);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async (applicationId: string) => {
    try {
      if (!applicationId) {
        throw new Error('Application ID is required');
      }

      const response = await fetch('/api/job-application/applicants', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          applicationId, 
          status: 'interview_scheduled'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update application status');
      }

      if (onScheduleInterview) {
        onScheduleInterview(applicationId);
      }

      setApplicants(current => current.filter(app => app.applicationId !== applicationId));
      setOpenDropdownId(null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error scheduling interview:', errorMessage);
    }
  };

  const handleViewDocument = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdownId(null);
    window.open(url, '_blank');
  };

  const handleViewProfile = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdownId(null);
    onViewProfile?.(id);
  };

  const getDocumentByType = (documents: Document[], type: string) => {
    return documents.find(doc => doc.type.toLowerCase() === type.toLowerCase());
  };

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Shortlisted Candidates ({applicants.length})</h2>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="w-[48px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applicants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-500">
                  No shortlisted candidates found
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
                      <DropdownMenuTrigger asChild>
                        <div className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100 cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {onViewProfile && (
                          <DropdownMenuItem 
                            onClick={(e) => handleViewProfile(e, applicant.id)}
                            className="cursor-pointer"
                          >
                            <User className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                        )}
                        {getDocumentByType(applicant.documents, 'resume') && (
                          <DropdownMenuItem 
                            onClick={(e) => handleViewDocument(e, getDocumentByType(applicant.documents, 'resume')?.url || '')}
                            className="cursor-pointer"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View Resume
                          </DropdownMenuItem>
                        )}
                        {getDocumentByType(applicant.documents, 'cover_letter') && (
                          <DropdownMenuItem 
                            onClick={(e) => handleViewDocument(e, getDocumentByType(applicant.documents, 'cover_letter')?.url || '')}
                            className="cursor-pointer"
                          >
                            <File className="mr-2 h-4 w-4" />
                            View Cover Letter
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleScheduleInterview(applicant.applicationId)}
                          className="cursor-pointer text-blue-600"
                        >
                          <CalendarClock className="mr-2 h-4 w-4" />
                          Schedule Interview
                        </DropdownMenuItem>
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
  );
};

export default JobMatches;