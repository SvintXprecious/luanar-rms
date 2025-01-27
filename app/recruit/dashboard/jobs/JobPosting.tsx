'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, X, Send, Briefcase, ClipboardList, 
  Users, Settings, Loader2, AlertTriangle, LucideIcon
} from 'lucide-react';
import {
  Form, FormControl, FormField, FormItem, 
  FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface JobPostingModalProps {
  open: boolean;
  onClose: () => void;
  session: any;
}

interface ConfigData {
  departments: Array<{ id: string; name: string; }>;
  educationLevels: Array<{ id: string; name: string; }>;
  employmentTypes: Array<{ id: string; name: string; }>;
  experienceLevels: Array<{ 
    id: string; 
    level_id: string; 
    label: string; 
    year_range: string; 
  }>;
  skillCategories: Array<{ id: string; name: string; }>;
}

interface Skill {
  name: string;
  category: string;
}

interface FormStep {
  id: number;
  title: string;
  icon: LucideIcon;
  fields: string[];
}

interface StepProps {
  form: any;
  configData: ConfigData;
}

interface JobFormData {
  title: string;
  department_id: string;
  location: string;
  employment_type_id: string;
  closing_date: string;
  description: string;
  responsibilities: string[];
  education_level_id: string;
  experience_level_id: string;
  skills: Skill[];
  qualifications: string[];
  termsAndConditions: string;
  additionalInformation?: string;
}

const formSteps: FormStep[] = [
  {
    id: 1,
    title: 'Basic Details',
    icon: Briefcase,
    fields: ['title', 'department_id', 'employment_type_id', 'closing_date']
  },
  {
    id: 2,
    title: 'Job Description',
    icon: ClipboardList,
    fields: ['description', 'responsibilities', 'education_level_id']
  },
  {
    id: 3,
    title: 'Requirements',
    icon: Users,
    fields: ['experience_level_id', 'skills', 'qualifications']
  },
  {
    id: 4,
    title: 'Additional Details',
    icon: Settings,
    fields: ['termsAndConditions', 'additionalInformation']
  }
];

const ProgressSteps: React.FC<{ currentStep: number; steps: FormStep[] }> = ({ currentStep, steps }) => {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-6 py-6">
        <div className="relative flex justify-between">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-500"
            style={{ 
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              maxWidth: currentStep === 1 ? '0%' : '100%'
            }}
          />
          
          {steps.map((step) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="relative flex flex-col items-center z-10">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center 
                    transition-all duration-300 
                    ${isCompleted ? "bg-blue-600 text-white" : 
                      isActive ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                      "bg-white border-2 border-slate-300 text-slate-400"}
                  `}
                >
                  <StepIcon className="w-5 h-5" />
                </div>
                <span 
                  className={`
                    absolute -bottom-6 whitespace-nowrap text-sm font-medium
                    ${isActive || isCompleted ? "text-blue-600" : "text-slate-400"}
                  `}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const BasicDetailsStep: React.FC<StepProps> = ({ form, configData }) => {
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="title"
          rules={{ required: "Job title is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Senior Product Designer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="department_id"
          rules={{ required: "Department is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {configData.departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="employment_type_id"
          rules={{ required: "Employment type is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {configData.employmentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="closing_date"
          rules={{ 
            required: "Closing date is required",
            validate: {
              futureDate: (value) => {
                const date = new Date(value);
                const now = new Date();
                return date > now || "Closing date must be in the future";
              }
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application Closing Date</FormLabel>
              <FormControl>
                <Input 
                  type="date"
                  min={today}
                  max={maxDateStr}
                  className="h-10"
                  {...field}
                />
              </FormControl>
              <div className="text-xs text-slate-500">Select a date within the next 6 months</div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

const JobDescriptionStep: React.FC<StepProps> = ({ form, configData }) => {
  return (
    <div className="space-y-8">
      <FormField
        control={form.control}
        name="description"
        rules={{ 
          required: "Job description is required",
          minLength: {
            value: 100,
            message: "Description should be at least 100 characters"
          }
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe the role, its impact, and what success looks like..."
                className="h-48 resize-y min-h-[12rem]"
                {...field}
              />
            </FormControl>
            <div className="text-xs text-slate-500">
              Provide a comprehensive description of the role, responsibilities, and expectations.
              Minimum 100 characters.
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="responsibilities"
        rules={{ 
          required: "At least one responsibility is required",
          validate: {
            notEmpty: (value) => 
              value.every((item: string) => item.trim() !== '') || 
              "All responsibilities must be filled"
          }
        }}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Key Responsibilities</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => field.onChange([...field.value, ''])}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Responsibility
              </Button>
            </div>
            <div className="space-y-3">
              {field.value.map((item: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={item}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const newValue = [...field.value];
                        newValue[index] = e.target.value;
                        field.onChange(newValue);
                      }}
                      placeholder="Add a key responsibility"
                    />
                  </div>
                  {field.value.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newValue = field.value.filter((_, i) => i !== index);
                        field.onChange(newValue);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="education_level_id"
        rules={{ required: "Education requirement is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Education Requirements</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select minimum education requirement" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {configData.educationLevels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

const RequirementsStep: React.FC<StepProps> = ({ form, configData }) => {
  const [newSkill, setNewSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && selectedCategory) {
      const currentSkills = form.getValues('skills') || [];
      form.setValue('skills', [
        ...currentSkills,
        {
          name: newSkill.trim(),
          category: selectedCategory
        }
      ], { shouldValidate: true });
      setNewSkill('');
      setSelectedCategory('');
    }
  };

  return (
    <div className="space-y-8">
      <FormField
        control={form.control}
        name="experience_level_id"
        rules={{ required: "Experience level is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Required Experience</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select required experience" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {configData.experienceLevels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.label} ({level.year_range})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="skills"
        rules={{ 
          validate: {
            required: (value) => value.length > 0 || "At least one skill is required"
          }
        }}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Required Skills</FormLabel>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSkill}
                disabled={!newSkill.trim() || !selectedCategory}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </div>

            <div className="flex gap-3 mt-2">
              <Select 
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {configData.skillCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex-1">
                <Input
                  placeholder="Enter a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSkill.trim() && selectedCategory) {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {field.value?.map((skill: Skill, index: number) => {
                const category = configData.skillCategories.find(c => c.id === skill.category);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <span className="font-medium">{skill.name}</span>
                        <div className="text-sm text-slate-500">
                          {category?.name || 'Unknown Category'}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newSkills = field.value.filter((_, i) => i !== index);
                        field.onChange(newSkills);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="qualifications"
        rules={{ 
          required: "At least one qualification is required",
          validate: {
            notEmpty: (value) => 
              value.every((q: string) => q.trim() !== '') || 
              "All qualifications must be filled"
          }
        }}
        render={({ field }) => (
          <FormItem className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Qualifications</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  field.onChange([...field.value, '']);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Qualification
              </Button>
            </div>
            
            <div className="space-y-3">
              {field.value.map((qualification: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors"
                >
                  <Input
                    className="flex-1"
                    value={qualification}
                    onChange={(e) => {
                      const newQuals = [...field.value];
                      newQuals[index] = e.target.value;
                      field.onChange(newQuals);
                    }}
                    placeholder="Enter qualification"
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      field.onChange(field.value.filter((_, i) => i !== index));
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

const AdditionalDetailsStep: React.FC<StepProps> = ({ form }) => {
  return (
    <div className="space-y-8">
      <FormField
        control={form.control}
        name="termsAndConditions"
        rules={{ 
          required: "Terms and conditions are required",
          minLength: {
            value: 50,
            message: "Terms and conditions should be at least 50 characters"
          }
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Terms and Conditions of Engagement</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter employment terms and conditions..."
                className="h-48 resize-y min-h-[12rem]"
                {...field}
              />
            </FormControl>
            <div className="text-xs text-slate-500 mt-2">
              Include key information such as:
              <ul className="list-disc pl-4 mt-1">
                <li>Contract duration and type</li>
                <li>Working hours and schedule</li>
                <li>Benefits package</li>
                <li>Probation period if applicable</li>
                <li>Any specific work arrangements</li>
              </ul>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="additionalInformation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Information (Optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter any additional information..."
                className="h-32 resize-y min-h-[8rem]"
                {...field}
              />
            </FormControl>
            <div className="text-xs text-slate-500 mt-2">
              Optional: You may include:
              <ul className="list-disc pl-4 mt-1">
                <li>Special instructions for applicants</li>
                <li>Required documents for application</li>
                <li>Selection process details</li>
                <li>Additional benefits or perks</li>
                <li>Any other relevant information</li>
              </ul>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-800" />
        <AlertTitle className="text-amber-800">Important Notice</AlertTitle>
        <AlertDescription className="text-amber-700">
          Please ensure all terms and conditions comply with labor laws and organizational policies.
          Be clear and specific to avoid any misunderstandings with potential candidates.
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Main Job Posting Modal Component 
const JobPostingModal: React.FC<JobPostingModalProps> = ({ open, onClose, session }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepValidity, setStepValidity] = useState({
    1: false,
    2: false,
    3: false,
    4: false
  });

  const [configData, setConfigData] = useState<ConfigData>({
    departments: [],
    educationLevels: [],
    employmentTypes: [],
    experienceLevels: [],
    skillCategories: []
  });

  const form = useForm<JobFormData>({
    defaultValues: {
      title: '',
      department_id: '',
      location: 'Lilongwe, Malawi',
      employment_type_id: '',
      closing_date: '',
      description: '',
      responsibilities: [''],
      education_level_id: '',
      experience_level_id: '',
      skills: [],
      qualifications: [''],
      termsAndConditions: '',
      additionalInformation: ''
    },
    mode: 'onChange'
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/config/all');
        
        if (!response.ok) {
          throw new Error('Failed to fetch configuration');
        }

        const { success, data, error } = await response.json();
        
        if (!success) {
          throw new Error(error || 'Failed to load configuration');
        }

        setConfigData(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      loadConfig();
      form.reset();
      setCurrentStep(1);
      setStepValidity({ 1: false, 2: false, 3: false, 4: false });
    }
  }, [open, onClose]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name) {
        validateCurrentStep();
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, currentStep]);

  const validateCurrentStep = async () => {
    const currentFields = formSteps[currentStep - 1].fields;
    const isValid = await form.trigger(currentFields);
    setStepValidity(prev => ({ ...prev, [currentStep]: isValid }));
    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCurrentStep(prev => Math.min(4, prev + 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const onPublish = async (data: JobFormData) => {
    try {
      setIsSubmitting(true);

      if (!session?.user?.id) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: session.user.id,
          closing_date: new Date(data.closing_date).toISOString().split('T')[0]
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to publish job posting');
      }

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Job posting published successfully",
          duration: 5000,
        });
        router.refresh();
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-600">Loading configuration...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="min-h-[600px] bg-slate-100">
          <div className="bg-white border-b border-slate-200">
            <div className="flex items-center justify-between px-6 py-4">
              <h1 className="text-xl font-semibold text-slate-800">New Job Post</h1>
              {currentStep === 4 && stepValidity[4] && (
                <Button
                  onClick={form.handleSubmit(onPublish)}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publish Job
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <ProgressSteps currentStep={currentStep} steps={formSteps} />

          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onPublish)}>
                <Card>
                  <CardHeader>
                    <CardTitle>{formSteps[currentStep - 1].title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentStep === 1 && (
                      <BasicDetailsStep 
                        form={form} 
                        configData={configData}
                      />
                    )}
                    {currentStep === 2 && (
                      <JobDescriptionStep 
                        form={form}
                        configData={configData}
                      />
                    )}
                    {currentStep === 3 && (
                      <RequirementsStep 
                        form={form}
                        configData={configData}
                      />
                    )}
                    {currentStep === 4 && (
                      <AdditionalDetailsStep 
                        form={form}
                        configData={configData}
                      />
                    )}
                    
                    <div className="flex justify-between mt-8 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                      >
                        Previous
                      </Button>
                      {currentStep < 4 && (
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={!stepValidity[currentStep]}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Next
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobPostingModal;