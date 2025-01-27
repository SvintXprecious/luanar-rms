'use client';
import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Plus,
  Trash2,
  Upload,
  Save,
  Link as LinkIcon,
  Calendar,
  FileText,
  Loader2
} from 'lucide-react';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type IdentificationDocumentType = 'national_id' | 'passport';
type EducationDocumentType = 'transcript' | 'certificate';

interface Document {
  document_url: string;
  file_name: string;
  uploaded_at: string;
}

interface EducationItem {
  id?: string;
  degree: string;
  school: string;
  location: string;
  graduationYear: string;
  grade: string;
  documents: {
    transcript?: Document;
    certificate?: Document;
  };
}

interface ExperienceItem {
  id?: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface CertificationItem {
  id?: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

interface Profile {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  identificationDocuments: {
    national_id?: Document;
    passport?: Document;
  };
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
}

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [profile, setProfile] = useState<Profile>({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    identificationDocuments: {},
    skills: [],
    experience: [],
    education: [],
    certifications: []
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/applicant/profile');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      setProfile({
        firstName: data.data.first_name || '',
        middleName: data.data.middle_name || '',
        lastName: data.data.last_name || '',
        dateOfBirth: data.data.date_of_birth ? data.data.date_of_birth.split('T')[0] : '',
        gender: data.data.gender || '',
        email: data.data.email || '',
        phone: data.data.phone || '',
        identificationDocuments: data.data.identificationDocuments || {},
        skills: data.data.skills || [],
        experience: data.data.experience?.map((exp: any) => ({
          id: exp.id,
          title: exp.title || '',
          company: exp.company || '',
          location: exp.location || '',
          startDate: exp.start_date ? exp.start_date.substring(0, 7) : '',
          endDate: exp.end_date ? exp.end_date.substring(0, 7) : '',
          description: exp.description || ''
        })) || [],
        education: data.data.education?.map((edu: any) => ({
          id: edu.id,
          degree: edu.degree || '',
          school: edu.school || '',
          location: edu.location || '',
          graduationYear: edu.graduation_year || '',
          grade: edu.grade || '',
          documents: edu.documents || {}
        })) || [],
        certifications: data.data.certifications?.map((cert: any) => ({
          id: cert.id,
          name: cert.name || '',
          issuer: cert.issuer || '',
          issueDate: cert.issue_date ? cert.issue_date.split('T')[0] : '',
          expiryDate: cert.expiry_date ? cert.expiry_date.split('T')[0] : '',
          credentialUrl: cert.credential_url || ''
        })) || []
      });
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const { email, ...updateData } = profile;

      const response = await fetch('/api/applicant/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          middleName: updateData.middleName,
          phone: updateData.phone,
          dateOfBirth: updateData.dateOfBirth,
          gender: updateData.gender,
          experience: updateData.experience.map(exp => ({
            id: exp.id,
            title: exp.title,
            company: exp.company,
            location: exp.location,
            startDate: exp.startDate,
            endDate: exp.endDate,
            description: exp.description
          })),
          education: updateData.education.map(edu => ({
            id: edu.id,
            degree: edu.degree,
            school: edu.school,
            location: edu.location,
            graduationYear: edu.graduationYear,
            grade: edu.grade
          })),
          certifications: updateData.certifications.map(cert => ({
            id: cert.id,
            name: cert.name,
            issuer: cert.issuer,
            issueDate: cert.issueDate,
            expiryDate: cert.expiryDate,
            credentialUrl: cert.credentialUrl
          })),
          skills: updateData.skills
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      await fetchProfile();

    } catch (err: any) {
      setError(err.message);
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (section: string, field: any, fileList: FileList) => {
    try {
      if (!fileList.length) return;

      const formData = new FormData();
      formData.append('file', fileList[0]);
      formData.append('section', section);
      formData.append('field', JSON.stringify(field));

      const response = await fetch('/api/applicant/profile', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to upload file');
      }

      await fetchProfile();
      setSuccessMessage('File uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err: any) {
      setError(err.message);
      console.error('Error uploading file:', err);
    }
  };

  const addExperience = () => {
    setProfile(prev => ({
      ...prev,
      experience: [...prev.experience, {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        description: ''
      }]
    }));
  };

  const addEducation = () => {
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        school: '',
        location: '',
        graduationYear: '',
        grade: '',
        documents: {}
      }]
    }));
  };

  const addCertification = () => {
    setProfile(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialUrl: ''
      }]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#0041E9]" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {error && (
          <Alert className="bg-red-50 text-red-600 border-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert className="bg-green-50 text-green-600 border-green-200">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        
        {/* Header Actions */}
        <div className="flex justify-end space-x-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#0041E9] hover:bg-[#0036c4] text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-[#0041E9] hover:bg-[#0036c4] text-white"
            >
              Edit Profile
            </Button>
          )}
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src="" alt="Profile" />
                <AvatarFallback className="bg-[#0041E9] text-white text-2xl">
                  {profile.firstName[0]}{profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">First Name</label>
                    <Input
                      value={profile.firstName}
                      onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Middle Name</label>
                    <Input
                      value={profile.middleName}
                      onChange={(e) => setProfile(prev => ({ ...prev, middleName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                    <Input
                      value={profile.lastName}
                      onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                    <Input
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Gender</label>
                    <Select
                      value={profile.gender}
                      onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <Input
                      type="email"
                      value={profile.email}
                      disabled={true}
                      className="bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                    <Input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone:e.target.value }))}
                      disabled={!isEditing}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identification Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Identification Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">National ID</label>
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('identification', 'national_id', e.target.files!)}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {profile.identificationDocuments.national_id && (
                  <div className="text-sm text-slate-600">
                    Current: {profile.identificationDocuments.national_id.file_name}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Passport</label>
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('identification', 'passport', e.target.files!)}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {profile.identificationDocuments.passport && (
                  <div className="text-sm text-slate-600">
                    Current: {profile.identificationDocuments.passport.file_name}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Education</CardTitle>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={addEducation}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.education.map((edu, index) => (
              <div key={edu.id || index} className="space-y-4 pb-6 border-b border-slate-200 last:border-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Degree</label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => {
                        const newEducation = [...profile.education];
                        newEducation[index] = { ...edu, degree: e.target.value };
                        setProfile(prev => ({ ...prev, education: newEducation }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">School/University</label>
                    <Input
                      value={edu.school}
                      onChange={(e) => {
                        const newEducation = [...profile.education];
                        newEducation[index] = { ...edu, school: e.target.value };
                        setProfile(prev => ({ ...prev, education: newEducation }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Location</label>
                    <Input
                      value={edu.location}
                      onChange={(e) => {
                        const newEducation = [...profile.education];
                        newEducation[index] = { ...edu, location: e.target.value };
                        setProfile(prev => ({ ...prev, education: newEducation }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Graduation Year</label>
                    <Input
                      type="text"
                      value={edu.graduationYear}
                      onChange={(e) => {
                        const newEducation = [...profile.education];
                        newEducation[index] = { ...edu, graduationYear: e.target.value };
                        setProfile(prev => ({ ...prev, education: newEducation }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Grade/Classification</label>
                    <Select
                      value={edu.grade}
                      onValueChange={(value) => {
                        const newEducation = [...profile.education];
                        newEducation[index] = { ...edu, grade: value };
                        setProfile(prev => ({ ...prev, education: newEducation }));
                      }}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="distinction">Distinction</SelectItem>
                        <SelectItem value="first-class">First Class Honours</SelectItem>
                        <SelectItem value="second-upper">Second Class Honours (Upper)</SelectItem>
                        <SelectItem value="second-lower">Second Class Honours (Lower)</SelectItem>
                        <SelectItem value="third-class">Third Class Honours</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                        <SelectItem value="pass">Pass</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Academic Transcript</label>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload('education', { educationId: edu.id, type: 'transcript' }, e.target.files!)}
                        disabled={!isEditing}
                        className="flex-1"
                      />
                      {edu.documents.transcript && (
                        <div className="text-sm text-slate-600">
                          Current: {edu.documents.transcript.file_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Degree Certificate</label>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload('education', { educationId: edu.id, type: 'certificate' }, e.target.files!)}
                        disabled={!isEditing}
                        className="flex-1"
                      />
                      {edu.documents.certificate && (
                        <div className="text-sm text-slate-600">
                          Current: {edu.documents.certificate.file_name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      setProfile(prev => ({
                        ...prev,
                        education: prev.education.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Experience</CardTitle>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={addExperience}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.experience.map((exp, index) => (
              <div key={exp.id || index} className="space-y-4 pb-6 border-b border-slate-200 last:border-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Title</label>
                    <Input
                      value={exp.title}
                      onChange={(e) => {
                        const newExperience = [...profile.experience];
                        newExperience[index] = { ...exp, title: e.target.value };
                        setProfile(prev => ({ ...prev, experience: newExperience }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Company</label>
                    <Input
                      value={exp.company}
                      onChange={(e) => {
                        const newExperience = [...profile.experience];
                        newExperience[index] = { ...exp, company: e.target.value };
                        setProfile(prev => ({ ...prev, experience: newExperience }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Location</label>
                    <Input
                      value={exp.location}
                      onChange={(e) => {
                        const newExperience = [...profile.experience];
                        newExperience[index] = { ...exp, location: e.target.value };
                        setProfile(prev => ({ ...prev, experience: newExperience }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Start Date</label>
                    <Input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => {
                        const newExperience = [...profile.experience];
                        newExperience[index] = { ...exp, startDate: e.target.value };
                        setProfile(prev => ({ ...prev, experience: newExperience }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">End Date</label>
                    <Input
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => {
                        const newExperience = [...profile.experience];
                        newExperience[index] = { ...exp, endDate: e.target.value };
                        setProfile(prev => ({ ...prev, experience: newExperience }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => {
                      const newExperience = [...profile.experience];
                      newExperience[index] = { ...exp, description: e.target.value };
                      setProfile(prev => ({ ...prev, experience: newExperience }));
                    }}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Describe your role and responsibilities..."
                  />
                </div>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      setProfile(prev => ({
                        ...prev,
                        experience: prev.experience.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Certifications</CardTitle>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={addCertification}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Certification
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.certifications.map((cert, index) => (
              <div key={cert.id || index} className="space-y-4 pb-6 border-b border-slate-200 last:border-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Certification Name</label>
                    <Input
                      value={cert.name}
                      onChange={(e) => {
                        const newCertifications = [...profile.certifications];
                        newCertifications[index] = { ...cert, name: e.target.value };
                        setProfile(prev => ({ ...prev, certifications: newCertifications }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Issuing Organization</label>
                    <Input
                      value={cert.issuer}
                      onChange={(e) => {
                        const newCertifications = [...profile.certifications];
                        newCertifications[index] = { ...cert, issuer: e.target.value };
                        setProfile(prev => ({ ...prev, certifications: newCertifications }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Issue Date</label>
                    <Input
                      type="month"
                      value={cert.issueDate}
                      onChange={(e) => {
                        const newCertifications = [...profile.certifications];
                        newCertifications[index] = { ...cert, issueDate: e.target.value };
                        setProfile(prev => ({ ...prev, certifications: newCertifications }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Expiry Date</label>
                    <Input
                      type="month"
                      value={cert.expiryDate}
                      onChange={(e) => {
                        const newCertifications = [...profile.certifications];
                        newCertifications[index] = { ...cert, expiryDate: e.target.value };
                        setProfile(prev => ({ ...prev, certifications: newCertifications }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Credential URL</label>
                    <Input
                      type="url"
                      value={cert.credentialUrl}
                      onChange={(e) => {
                        const newCertifications = [...profile.certifications];
                        newCertifications[index] = { ...cert, credentialUrl: e.target.value };
                        setProfile(prev => ({ ...prev, certifications: newCertifications }));
                      }}
                      disabled={!isEditing}
                      placeholder="https://"
                    />
                  </div>
                </div>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      setProfile(prev => ({
                        ...prev,
                        certifications: prev.certifications.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <div
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm ${
                    isEditing ? 'pr-2 bg-slate-100' : 'bg-[#0041E9] bg-opacity-10 text-[#0041E9]'
                  }`}
                >
                  {skill}
                  {isEditing && (
                    <button
                      className="ml-2 text-slate-400 hover:text-red-600"
                      onClick={() => {
                        setProfile(prev => ({
                          ...prev,
                          skills: prev.skills.filter((_, i) => i !== index)
                        }));
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const skill = window.prompt('Enter new skill:');
                    if (skill && skill.trim()) {
                      setProfile(prev => ({
                        ...prev,
                        skills: [...prev.skills, skill.trim()]
                      }));
                    }
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;