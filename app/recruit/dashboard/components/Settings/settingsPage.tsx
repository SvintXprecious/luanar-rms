import React, { useState } from 'react';
import {
  Plus,
  Save,
  Trash2,
  Briefcase,
  Timer,
  Tags,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

import DepartmentSettings from './components/DepartmentSettings';
import EmploymentSettings from './components/EmploymentSettings';
import EducationSettings from './components/EducationSettings';
import SkillCategorySettings from './components/SkillCategorySettings';
import ExperienceSettings from './components/ExperienceSettings';

// Type definitions
interface Message {
  type: 'success' | 'error';
  text: string;
}

const HRSettingsPage = () => {
  // State management
  const [message, setMessage] = useState<Message | null>(null);

  // Message handling
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Save all settings
  const handleSave = async () => {
    try {
      // TODO: Implement saving other settings if needed
      showMessage('success', 'Settings updated successfully');
    } catch (error) {
      showMessage('error', 'Failed to save changes');
    }
  };

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">
          Configure recruitment system parameters and options.
        </p>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6">
        {/* Departments */}
        <DepartmentSettings onMessage={showMessage} />

        {/* Employment Types */}
        <EmploymentSettings onMessage={showMessage} />

        {/* Experience Levels */}
        <ExperienceSettings onMessage={showMessage} />

        {/* Education Levels */}
        <EducationSettings onMessage={showMessage} />

        {/* Skill Categories */}
        <SkillCategorySettings onMessage={showMessage} />
      </div>

      {/* Floating notification */}
      {message && (
        <div className="fixed bottom-4 right-4 animate-fade-in-up">
          <Alert 
            className={`${
              message.type === 'success' 
                ? 'bg-green-50 text-green-600 border-green-200' 
                : 'bg-red-50 text-red-600 border-red-200'
            } shadow-lg`}
          >
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Global save button (if needed) */}
      {/* <div className="fixed bottom-0 right-0 w-full border-t bg-white p-4 flex justify-end">
        <Button onClick={handleSave} className="min-w-[100px]">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div> */}
    </div>
  );
};

export default HRSettingsPage;