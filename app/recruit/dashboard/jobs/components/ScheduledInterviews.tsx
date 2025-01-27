import React, { useState, useEffect } from 'react';
import { 
  MoreVertical,
  User,
  RotateCcw
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

interface Interview {
  id: string;
  name: string;
  email: string;
}

interface ScheduledInterviewsProps {
  jobId: string;
}

const ScheduledInterviews = ({ jobId }: ScheduledInterviewsProps) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setError('Job ID is required');
      setLoading(false);
      return;
    }
    fetchInterviews();
  }, [jobId]);

  const fetchInterviews = async () => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/job-application/applicants?jobId=${jobId}&status=interview_scheduled`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch interviews');
      }

      const formattedInterviews = result.data.map((applicant: any) => ({
        id: applicant.applicationId,
        name: applicant.name,
        email: applicant.email,
      }));

      setInterviews(formattedInterviews);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToShortlisted = async (interviewId: string) => {
    try {
      const response = await fetch('/api/job-application/applicants', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          applicationId: interviewId, 
          status: 'shortlisted'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status');
      }
      
      // Refresh the interviews list
      await fetchInterviews();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
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
        <h2 className="text-lg font-semibold">Scheduled Interviews ({interviews.length})</h2>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[48px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-slate-500">
                  No interviews scheduled
                </TableCell>
              </TableRow>
            ) : (
              interviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      
                      <div>
                        <div className="font-medium">{interview.name}</div>
                        <div className="text-sm text-slate-500">{interview.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100 cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={() => handleReturnToShortlisted(interview.id)}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Return to Shortlisted
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

export default ScheduledInterviews;