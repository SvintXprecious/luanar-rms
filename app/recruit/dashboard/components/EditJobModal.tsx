import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { X } from 'lucide-react';

const EditJobModal = ({ 
  isOpen, 
  onClose, 
  jobData,
  onSave
}) => {
  const [formData, setFormData] = useState({
    description: jobData?.description || '',
    responsibilities: jobData?.responsibilities || [],
    qualifications: jobData?.qualifications || [],
  });
  
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const handleTextChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleListChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addListItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeListItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError('');

      // Basic validation
      if (formData.description.length < 100) {
        throw new Error('Description must be at least 100 characters');
      }
      if (formData.responsibilities.length === 0) {
        throw new Error('At least one responsibility is required');
      }
      if (formData.qualifications.length === 0) {
        throw new Error('At least one qualification is required');
      }

      await onSave({
        id: jobData.id,
        ...jobData, // Keep existing data
        ...formData, // Override with edited fields
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Posting</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start h-auto p-1 bg-slate-100 rounded-lg">
            <TabsTrigger value="description" className="flex-1">
              Description
            </TabsTrigger>
            <TabsTrigger value="responsibilities" className="flex-1">
              Responsibilities
            </TabsTrigger>
            <TabsTrigger value="qualifications" className="flex-1">
              Qualifications
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex-1">
              Terms & Conditions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-4">
            <div className="space-y-4">
              <Textarea
                value={formData.description}
                onChange={(e) => handleTextChange('description', e.target.value)}
                placeholder="Enter job description..."
                className="min-h-[200px]"
              />
              <div className="text-xs text-slate-500">
                Minimum 100 characters required
              </div>
            </div>
          </TabsContent>

          <TabsContent value="responsibilities" className="mt-4">
            <div className="space-y-4">
              {formData.responsibilities.map((resp, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={resp}
                    onChange={(e) => handleListChange('responsibilities', index, e.target.value)}
                    placeholder="Enter responsibility..."
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListItem('responsibilities', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => addListItem('responsibilities')}
              >
                Add Responsibility
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="qualifications" className="mt-4">
            <div className="space-y-4">
              {formData.qualifications.map((qual, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={qual}
                    onChange={(e) => handleListChange('qualifications', index, e.target.value)}
                    placeholder="Enter qualification..."
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListItem('qualifications', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => addListItem('qualifications')}
              >
                Add Qualification
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="terms" className="mt-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="prose prose-sm max-w-none">
                {jobData.terms_and_conditions}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditJobModal;