import React, { useState, useEffect } from 'react';
import { Briefcase, Check, X, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ExperienceLevel {
  id: string;
  level_id: string;
  label: string;
  year_range: string;
  is_active: boolean;
}

interface ExperienceLevelSettingsProps {
  onMessage: (type: 'success' | 'error', text: string) => void;
}

const ExperienceSettings: React.FC<ExperienceLevelSettingsProps> = ({ onMessage }) => {
  const [experienceLevels, setExperienceLevels] = useState<ExperienceLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLevel, setEditingLevel] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    level_id: '',
    label: '',
    year_range: ''
  });
  const [newLevel, setNewLevel] = useState({
    level_id: '',
    label: '',
    year_range: ''
  });

  const formatText = (text: string): string => {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleNewLevelChange = (field: keyof typeof newLevel, value: string) => {
    let formattedValue = value;
    if (field === 'level_id') {
      formattedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    } else if (field === 'label' || field === 'year_range') {
      formattedValue = formatText(value);
    }
    setNewLevel({ ...newLevel, [field]: formattedValue });
  };

  const handleEditFormChange = (field: keyof typeof editForm, value: string) => {
    let formattedValue = value;
    if (field === 'level_id') {
      formattedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    } else if (field === 'label' || field === 'year_range') {
      formattedValue = formatText(value);
    }
    setEditForm({ ...editForm, [field]: formattedValue });
  };

  useEffect(() => {
    fetchExperienceLevels();
  }, []);

  const fetchExperienceLevels = async () => {
    try {
      const response = await fetch('/api/settings/experience-levels');
      if (!response.ok) {
        throw new Error('Failed to fetch experience levels');
      }
      const data = await response.json();
      setExperienceLevels(data.experience_levels);
    } catch (error) {
      onMessage('error', 'Failed to load experience levels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLevel = async () => {
    if (!newLevel.level_id.trim() || !newLevel.label.trim() || !newLevel.year_range.trim()) {
      onMessage('error', 'All fields are required');
      return;
    }

    try {
      const response = await fetch('/api/settings/experience-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLevel),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add experience level');
      }

      const data = await response.json();
      setExperienceLevels([...experienceLevels, data.experience_level]);
      setNewLevel({ level_id: '', label: '', year_range: '' });
      onMessage('success', data.message);
    } catch (error: any) {
      onMessage('error', error.message);
    }
  };

  const handleEditStart = (level: ExperienceLevel) => {
    setEditingLevel(level.id);
    setEditForm({
      level_id: level.level_id,
      label: level.label,
      year_range: level.year_range
    });
  };

  const handleEditCancel = () => {
    setEditingLevel(null);
    setEditForm({ level_id: '', label: '', year_range: '' });
  };

  const handleEditSave = async (id: string) => {
    if (!editForm.level_id.trim() || !editForm.label.trim() || !editForm.year_range.trim()) {
      onMessage('error', 'All fields are required');
      return;
    }

    try {
      const response = await fetch('/api/settings/experience-levels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id,
          ...editForm
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update experience level');
      }

      const data = await response.json();
      setExperienceLevels(levels => 
        levels.map(level => level.id === id ? data.experience_level : level)
      );
      onMessage('success', data.message);
      handleEditCancel();
    } catch (error: any) {
      onMessage('error', error.message);
    }
  };

  const toggleLevelStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/settings/experience-levels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          is_active: !currentStatus 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update experience level status');
      }

      const data = await response.json();
      setExperienceLevels(levels => 
        levels.map(level => level.id === id ? data.experience_level : level)
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
            <Briefcase className="w-5 h-5 mr-2" />
            Experience Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 text-[#0041E9] animate-spin" />
            <span className="ml-2 text-sm text-slate-600">Loading experience levels...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Briefcase className="w-5 h-5 mr-2" />
          Experience Levels
        </CardTitle>
        <CardDescription>
          Manage experience levels for job postings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
            <Input
              value={newLevel.level_id}
              onChange={(e) => handleNewLevelChange('level_id', e.target.value)}
              placeholder="Level ID (e.g., Entry)"
              className="flex-1"
            />
            <Input
              value={newLevel.label}
              onChange={(e) => handleNewLevelChange('label', e.target.value)}
              placeholder="Label (e.g., Entry Level)"
              className="flex-1"
            />
            <div className="flex gap-2">
              <Input
                value={newLevel.year_range}
                onChange={(e) => handleNewLevelChange('year_range', e.target.value)}
                placeholder="Year Range (e.g., 0-2 Years)"
                className="flex-1"
              />
              <Button
                onClick={handleAddLevel}
                variant="outline"
                className="whitespace-nowrap"
              >
                Add Level
              </Button>
            </div>
          </div>

          {experienceLevels.map((level) => (
            <div key={level.id} className="flex items-center gap-2">
              <div className={`flex-1 p-2 rounded border ${
                level.is_active 
                  ? 'border-slate-200 bg-white'
                  : 'border-slate-200 bg-slate-50'
              }`}>
                {editingLevel === level.id ? (
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={editForm.level_id}
                      onChange={(e) => handleEditFormChange('level_id', e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Input
                      value={editForm.label}
                      onChange={(e) => handleEditFormChange('label', e.target.value)}
                      className="flex-1"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={editForm.year_range}
                        onChange={(e) => handleEditFormChange('year_range', e.target.value)}
                        className="flex-1"
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
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-3 gap-4 flex-1">
                      <span className={level.is_active ? 'text-slate-900' : 'text-slate-500'}>
                        {level.level_id}
                      </span>
                      <span className={level.is_active ? 'text-slate-900' : 'text-slate-500'}>
                        {level.label}
                      </span>
                      <span className={level.is_active ? 'text-slate-900' : 'text-slate-500'}>
                        {level.year_range}
                      </span>
                    </div>
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

export default ExperienceSettings;