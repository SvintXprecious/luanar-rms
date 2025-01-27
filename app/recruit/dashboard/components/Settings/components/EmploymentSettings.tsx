import React, { useState, useEffect } from 'react';
import { Timer, Check, X, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EmploymentType {
  id: string;
  name: string;
  is_active: boolean;
}

interface EmploymentSettingsProps {
  onMessage: (type: 'success' | 'error', text: string) => void;
}

const EmploymentSettings: React.FC<EmploymentSettingsProps> = ({ onMessage }) => {
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([]);
  const [newEmploymentType, setNewEmploymentType] = useState('');
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmploymentTypes();
  }, []);

  const fetchEmploymentTypes = async () => {
    try {
      const response = await fetch('/api/settings/employment');
      if (!response.ok) {
        throw new Error('Failed to fetch employment types');
      }
      const data = await response.json();
      setEmploymentTypes(data.employmentTypes);
    } catch (error) {
      onMessage('error', 'Failed to load employment types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmploymentType = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newEmploymentType.trim()) {
      try {
        const response = await fetch('/api/settings/employment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newEmploymentType }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add employment type');
        }

        const data = await response.json();
        await fetchEmploymentTypes();
        setNewEmploymentType('');
        onMessage('success', data.message);
      } catch (error: any) {
        onMessage('error', error.message);
      }
    }
  };

  const handleEditStart = (type: EmploymentType) => {
    setEditingType(type.id);
    setEditingName(type.name);
  };

  const handleEditCancel = () => {
    setEditingType(null);
    setEditingName('');
  };

  const handleEditSave = async (id: string) => {
    if (!editingName.trim()) {
      onMessage('error', 'Employment type name cannot be empty');
      return;
    }

    try {
      const response = await fetch('/api/settings/employment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id,
          name: editingName
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update employment type name');
      }

      const data = await response.json();
      setEmploymentTypes(employmentTypes.map(type => 
        type.id === id ? data.employmentType : type
      ));
      onMessage('success', data.message);
      handleEditCancel();
    } catch (error: any) {
      onMessage('error', error.message);
    }
  };

  const toggleEmploymentTypeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/settings/employment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          is_active: !currentStatus 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update employment type status');
      }

      const data = await response.json();
      setEmploymentTypes(employmentTypes.map(type => 
        type.id === id ? data.employmentType : type
      ));
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
            <Timer className="w-5 h-5 mr-2" />
            Employment Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 text-[#0041E9] animate-spin" />
            <span className="ml-2 text-sm text-slate-600">Loading employment types...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Timer className="w-5 h-5 mr-2" />
          Employment Types
        </CardTitle>
        <CardDescription>
          Manage employment types available for job postings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newEmploymentType}
              onChange={(e) => setNewEmploymentType(e.target.value)}
              onKeyDown={handleAddEmploymentType}
              placeholder="Type employment type name and press Enter to add"
              className="flex-1"
            />
          </div>

          {employmentTypes.map((type) => (
            <div key={type.id} className="flex items-center gap-2">
              <div className={`flex-1 p-2 rounded border ${
                type.is_active 
                  ? 'border-slate-200 bg-white'
                  : 'border-slate-200 bg-slate-50'
              }`}>
                {editingType === type.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEditSave(type.id);
                        } else if (e.key === 'Escape') {
                          handleEditCancel();
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSave(type.id)}
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
                      className={`${type.is_active ? 'text-slate-900' : 'text-slate-500'} 
                                cursor-pointer hover:text-[#0041E9]`}
                      onClick={() => handleEditStart(type)}
                    >
                      {type.name}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStart(type)}
                        className="text-slate-600 hover:text-[#0041E9]"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleEmploymentTypeStatus(type.id, type.is_active)}
                        className={type.is_active ? 'text-red-600' : 'text-green-600'}
                      >
                        {type.is_active ? 'Deactivate' : 'Activate'}
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

export default EmploymentSettings;