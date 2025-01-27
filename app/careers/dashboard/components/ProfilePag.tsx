'use client';
import React, { useState } from 'react';
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
  FileText
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

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [profile, setProfile] = useState({
    firstName: 'John',
    middleName: '',
    lastName: 'Doe',
    dateOfBirth: '',
    gender: '',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    location: 'New York, USA',
    title: 'Software Engineer',
    about: 'Passionate software engineer with 5 years of experience in full-stack development...',
    identificationDocuments: {
      nationalId: null,
      passport: null
    },
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
    experience: [
      {
        id: 1,
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        location: 'New York, USA',
        startDate: '2021-01',
        endDate: 'Present',
        description: 'Led development of cloud-based applications...'
      }
    ],
    education: [
      {
        id: 1,
        degree: 'Master of Science in Computer Science',
        school: 'Tech University',
        location: 'New York, USA',
        graduationYear: '2019',
        grade: 'Distinction',
        documents: {
          transcript: null,
          certificate: null
        }
      }
    ],
    certifications: [
      {
        id: 1,
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        issueDate: '2023',
        expiryDate: '2026',
        credentialUrl: 'https://aws.amazon.com/certification'
      }
    ]
  });

  const handleFileUpload = (section, field, fileList) => {
    const file = fileList[0];
    if (file) {
      // In a real implementation, you would handle file upload to a server
      // For now, we'll just store the file name
      if (section === 'identification') {
        setProfile(prev => ({
          ...prev,
          identificationDocuments: {
            ...prev.identificationDocuments,
            [field]: file.name
          }
        }));
      } else if (section === 'education') {
        const newEducation = [...profile.education];
        newEducation[field.index].documents[field.type] = file.name;
        setProfile(prev => ({
          ...prev,
          education: newEducation
        }));
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addExperience = () => {
    setProfile(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now(),
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        description: ''
      }]
    }));
  };

  const addCertification = () => {
    setProfile(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        id: Date.now(),
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialUrl: ''
      }]
    }));
  };

  const addEducation = () => {
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now(),
        degree: '',
        school: '',
        location: '',
        graduationYear: '',
        grade: '',
        documents: {
          transcript: null,
          certificate: null
        }
      }]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
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
                    <Save className="w-4 h-4 mr-2 animate-spin" />
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
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" alt="Profile" />
                  <AvatarFallback className="bg-[#0041E9] text-white text-2xl">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                )}
              </div>
              
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
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                    <Input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
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
                  onChange={(e) => handleFileUpload('identification', 'nationalId', e.target.files)}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {profile.identificationDocuments.nationalId && (
                  <span className="text-sm text-slate-600">
                    Current: {profile.identificationDocuments.nationalId}
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Passport</label>
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('identification', 'passport', e.target.files)}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {profile.identificationDocuments.passport && (
                  <span className="text-sm text-slate-600">
                    Current: {profile.identificationDocuments.passport}
                  </span>
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
              <div key={edu.id} className="space-y-4 pb-6 border-b border-slate-200 last:border-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Degree</label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => {
                        const newEdu = [...profile.education];
                        newEdu[index] = { ...edu, degree: e.target.value };
                        setProfile(prev => ({ ...prev, education: newEdu }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">School/University</label>
                    <Input
                      value={edu.school}
                      onChange={(e) => {
                        const newEdu = [...profile.education];
                        newEdu[index] = { ...edu, school: e.target.value };
                        setProfile(prev => ({ ...prev, education: newEdu }));
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
                        const newEdu = [...profile.education];
                        newEdu[index] = { ...edu, location: e.target.value };
                        setProfile(prev => ({ ...prev, education: newEdu }));
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
                        const newEdu = [...profile.education];
                        newEdu[index] = { ...edu, graduationYear: e.target.value };
                        setProfile(prev => ({ ...prev, education: newEdu }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Grade/Classification</label>
                    <Select
                      value={edu.grade}
                      onValueChange={(value) => {
                        const newEdu = [...profile.education];
                        newEdu[index] = { ...edu, grade: value };
                        setProfile(prev => ({ ...prev, education: newEdu }));
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
                        <SelectItem value="pass">Credit</SelectItem>
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
                        onChange={(e) => handleFileUpload('education', { index, type: 'transcript' }, e.target.files)}
                        disabled={!isEditing}
                        className="flex-1"
                      />
                      {edu.documents.transcript && (
                        <span className="text-sm text-slate-600">
                          Current: {edu.documents.transcript}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Degree Certificate</label>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload('education', { index, type: 'certificate' }, e.target.files)}
                        disabled={!isEditing}
                        className="flex-1"
                      />
                      {edu.documents.certificate && (
                        <span className="text-sm text-slate-600">
                          Current: {edu.documents.certificate}
                        </span>
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
                        education: prev.education.filter(e => e.id !== edu.id)
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
              <div key={exp.id} className="space-y-4 pb-6 border-b border-slate-200 last:border-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Title</label>
                    <Input
                      value={exp.title}
                      onChange={(e) => {
                        const newExp = [...profile.experience];
                        newExp[index] = { ...exp, title: e.target.value };
                        setProfile(prev => ({ ...prev, experience: newExp }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Company</label>
                    <Input
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...profile.experience];
                        newExp[index] = { ...exp, company: e.target.value };
                        setProfile(prev => ({ ...prev, experience: newExp }));
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
                        const newExp = [...profile.experience];
                        newExp[index] = { ...exp, location: e.target.value };
                        setProfile(prev => ({ ...prev, experience: newExp }));
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
                        const newExp = [...profile.experience];
                        newExp[index] = { ...exp, startDate: e.target.value };
                        setProfile(prev => ({ ...prev, experience: newExp }));
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
                        const newExp = [...profile.experience];
                        newExp[index] = { ...exp, endDate: e.target.value };
                        setProfile(prev => ({ ...prev, experience: newExp }));
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
                      const newExp = [...profile.experience];
                      newExp[index] = { ...exp, description: e.target.value };
                      setProfile(prev => ({ ...prev, experience: newExp }));
                    }}
                    disabled={!isEditing}
                    rows={3}
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
                        experience: prev.experience.filter(e => e.id !== exp.id)
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
              <div key={cert.id} className="space-y-4 pb-6 border-b border-slate-200 last:border-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Certification Name</label>
                    <Input
                      value={cert.name}
                      onChange={(e) => {
                        const newCert = [...profile.certifications];
                        newCert[index] = { ...cert, name: e.target.value };
                        setProfile(prev => ({ ...prev, certifications: newCert }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Issuing Organization</label>
                    <Input
                      value={cert.issuer}
                      onChange={(e) => {
                        const newCert = [...profile.certifications];
                        newCert[index] = { ...cert, issuer: e.target.value };
                        setProfile(prev => ({ ...prev, certifications: newCert }));
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
                        const newCert = [...profile.certifications];
                        newCert[index] = { ...cert, issueDate: e.target.value };
                        setProfile(prev => ({ ...prev, certifications: newCert }));
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
                        const newCert = [...profile.certifications];
                        newCert[index] = { ...cert, expiryDate: e.target.value };
                        setProfile(prev => ({ ...prev, certifications: newCert }));
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
                        const newCert = [...profile.certifications];
                        newCert[index] = { ...cert, credentialUrl: e.target.value };
                        setProfile(prev => ({ ...prev, certifications: newCert }));
                      }}
                      disabled={!isEditing}
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
                        certifications: prev.certifications.filter(c => c.id !== cert.id)
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
                    if (skill) {
                      setProfile(prev => ({
                        ...prev,
                        skills: [...prev.skills, skill]
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