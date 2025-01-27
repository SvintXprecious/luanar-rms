import React, { useState, useEffect } from 'react';
import { GraduationCap, Check, X, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EducationLevel {
  id: string;
  name: string;
  is_active: boolean;
}

interface EducationSettingsProps {
  onMessage: (type: 'success' | 'error', text: string) => void;
}

const EducationSettings: React.FC<EducationSettingsProps> = ({ onMessage }) => {
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [newLevel, setNewLevel] = useState('');
  const [editingLevel, setEditingLevel] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEducationLevels();
  }, []);

  const fetchEducationLevels = async () => {
    try {
      const response = await fetch('/api/settings/education');
      if (!response.ok) {
        throw new Error('Failed to fetch education levels');
      }
      const data = await response.json();
      setEducationLevels(data.educationLevels);
    } catch (error) {
      onMessage('error', 'Failed to load education levels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLevel = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newLevel.trim()) {
      try {
        const response = await fetch('/api/settings/education', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newLevel }),
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Only admin users can modify education levels');
          }
          const data = await response.json();
          throw new Error(data.error || 'Failed to add education level');
        }

        const data = await response.json();
        setEducationLevels([...educationLevels, data.educationLevel]);
        setNewLevel('');
        onMessage('success', data.message);
      } catch (error: any) {
        onMessage('error', error.message);
      }
    }
  };

  const handleEditStart = (level: EducationLevel) => {
    setEditingLevel(level.id);
    setEditingName(level.name);
  };

  const handleEditCancel = () => {
    setEditingLevel(null);
    setEditingName('');
  };

  const handleEditSave = async (id: string) => {
    if (!editingName.trim()) {
      onMessage('error', 'Education level name cannot be empty');
      return;
    }

    try {
      const response = await fetch('/api/settings/education', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: editingName
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update education level');
      }

      const data = await response.json();
      setEducationLevels(levels => 
        levels.map(level => level.id === id ? data.educationLevel : level)
      );
      onMessage('success', data.message);
      handleEditCancel();
    } catch (error: any) {
      onMessage('error', error.message);
    }
  };

  const toggleLevelStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/settings/education', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          is_active: !currentStatus
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Only admin users can modify education levels');
        }
        throw new Error('Failed to update education level status');
      }

      const data = await response.json();
      setEducationLevels(levels =>
        levels.map(level => level.id === id ? data.educationLevel : level)
      );
      onMessage('success', data.message);
    } catch (error: any) {
      onMessage('error', error.message);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="w-5 h-5 mr-2" />
            Education Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 text-[#0041E9] animate-spin" />
            <span className="ml-2 text-sm text-slate-600">Loading education levels...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <GraduationCap className="w-5 h-5 mr-2" />
          Education Levels
        </CardTitle>
        <CardDescription>
          Manage education levels available for job postings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value)}
              onKeyDown={handleAddLevel}
              placeholder="Type education level and press Enter to add"
              className="flex-1"
            />
          </div>

          {educationLevels.map((level) => (
            <div key={level.id} className="flex items-center gap-2">
              <div className={`flex-1 p-2 rounded border ${
                level.is_active 
                  ? 'border-slate-200 bg-white'
                  : 'border-slate-200 bg-slate-50'
              }`}>
                {editingLevel === level.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEditSave(level.id);
                        } else if (e.key === 'Escape') {
                          handleEditCancel();
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSave(level.id)}
                      className="text-green-600"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditCancel}
                      className="text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span 
                      className={`${level.is_active ? 'text-slate-900' : 'text-slate-500'} 
                                cursor-pointer hover:text-[#0041E9]`}
                      onClick={() => handleEditStart(level)}>
                      {level.name}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStart(level)}
                        className="text-slate-600 hover:text-[#0041E9]"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLevelStatus(level.id, level.is_active)}
                        className={level.is_active ? 'text-red-600' : 'text-green-600'}
                      >
                        {level.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EducationSettings;