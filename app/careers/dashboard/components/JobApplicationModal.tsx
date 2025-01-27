import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

// Form Schema with file size validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const applicationSchema = z.object({
  resume: z.custom<FileList>()
    .refine((files) => files?.length === 1, 'Resume is required')
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      'File size should be less than 5MB'
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only .pdf, .doc, and .docx formats are supported'
    ),
  coverLetter: z.custom<FileList>()
    .refine((files) => files?.length === 1, 'Cover letter is required')
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      'File size should be less than 5MB'
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only .pdf, .doc, and .docx formats are supported'
    ),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  onSuccess?: () => void;
}

const ApplicationModal = ({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  onSuccess
}: ApplicationModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState<{
    isValid: boolean;
    missingFields: string[];
  }>({ isValid: true, missingFields: [] });

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema)
  });

  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [coverLetterFileName, setCoverLetterFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!isOpen || !jobId) return;
      
      try {
        const response = await fetch('/api/job-application');
        if (!response.ok) throw new Error('Failed to fetch applications');
        
        const { data: applications } = await response.json();
        
        // Check if user has already applied
        const hasApplied = applications.some((app: any) => app.job_id === jobId);
        if (hasApplied) {
          setProfileStatus({
            isValid: false,
            missingFields: ['You have already applied for this position']
          });
        }
      } catch (error) {
        console.error('Error checking application status:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify application status"
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingApplication();
  }, [isOpen, jobId, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'resume' | 'coverLetter') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 5MB"
      });
      return;
    }

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, or DOCX file"
      });
      return;
    }

    setValue(fileType, files);
    if (fileType === 'resume') {
      setResumeFileName(file.name);
    } else {
      setCoverLetterFileName(file.name);
    }
  };

  const handleClose = () => {
    reset();
    setResumeFileName('');
    setCoverLetterFileName('');
    setSubmitError(null);
    setProfileStatus({ isValid: true, missingFields: [] });
    onClose();
  };

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('jobId', jobId);
      
      if (data.resume[0]) {
        formData.append('resume', data.resume[0]);
      }
      if (data.coverLetter[0]) {
        formData.append('coverLetter', data.coverLetter[0]);
      }

      const response = await fetch('/api/job-application', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400 && result.error === 'Profile incomplete') {
          setProfileStatus({
            isValid: false,
            missingFields: result.missingFields
          });
          throw new Error('Please complete your profile before applying');
        }
        if (response.status === 409) {
          setProfileStatus({
            isValid: false,
            missingFields: ['You have already applied for this position']
          });
          throw new Error('You have already applied for this position');
        }
        throw new Error(result.error || 'Failed to submit application');
      }

      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted.",
      });

      handleClose();
      onSuccess?.();

    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Failed to submit application. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-slate-200">
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Apply for {jobTitle}
          </DialogTitle>
          <DialogDescription className="mt-1 text-slate-500">
            Please ensure your profile is complete and upload required documents
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="p-6">Checking application status...</div>
        ) : !profileStatus.isValid ? (
          <div className="p-6 space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {profileStatus.missingFields[0] === 'You have already applied for this position' ? (
                  'You have already applied for this position'
                ) : (
                  <>
                    Please complete your profile before applying. Missing information:
                    <ul className="list-disc ml-6 mt-2">
                      {profileStatus.missingFields.map((field, index) => (
                        <li key={index}>{field}</li>
                      ))}
                    </ul>
                  </>
                )}
              </AlertDescription>
            </Alert>
            {profileStatus.missingFields[0] !== 'You have already applied for this position' && (
              <Button
                onClick={() => window.location.href = '/careers/dashboard'}
                className="w-full"
              >
                Complete Profile
              </Button>
            )}
          </div>
        ) : (
          <>
            {submitError && (
              <Alert variant="destructive" className="mx-6 mt-4">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
              <div className="space-y-6 px-6 py-4">
                <div className="space-y-2">
                  <Label>Resume/CV</Label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-4 
                      ${errors.resume ? 'border-red-300' : 'border-slate-200'}
                      hover:border-slate-300 transition-colors`}
                  >
                    <div className="flex items-center justify-center">
                      <label className="flex items-center justify-center space-x-2 cursor-pointer">
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {resumeFileName || 'Upload Resume/CV'}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange(e, 'resume')}
                        />
                      </label>
                    </div>
                  </div>
                  {errors.resume && (
                    <p className="text-sm text-red-500 mt-1">{errors.resume.message}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    Accepted formats: PDF, DOC, DOCX (max 5MB)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Cover Letter</Label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-4 
                      ${errors.coverLetter ? 'border-red-300' : 'border-slate-200'}
                      hover:border-slate-300 transition-colors`}
                  >
                    <div className="flex items-center justify-center">
                      <label className="flex items-center justify-center space-x-2 cursor-pointer">
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {coverLetterFileName || 'Upload Cover Letter'}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange(e, 'coverLetter')}
                        />
                      </label>
                    </div>
                  </div>
                  {errors.coverLetter && (
                    <p className="text-sm text-red-500 mt-1">{errors.coverLetter.message}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    Accepted formats: PDF, DOC, DOCX (max 5MB)
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 px-6 py-4 bg-white mt-auto">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  By clicking Submit, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;