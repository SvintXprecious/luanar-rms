import React, { useState, useEffect } from 'react';
import { Building2, Check, X, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Type definitions
interface Department {
  id: string;
  name: string;
  is_active: boolean;
}

interface DepartmentSettingsProps {
  onMessage: (type: 'success' | 'error', text: string) => void;
}

const DepartmentSettings: React.FC<DepartmentSettingsProps> = ({ onMessage }) => {
  // State management
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [editingDepartment, setEditingDepartment] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/settings/departments');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const data = await response.json();
      setDepartments(data.departments);
    } catch (error) {
      onMessage('error', 'Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };

  // Department handlers
  const handleAddDepartment = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newDepartment.trim()) {
      try {
        const response = await fetch('/api/settings/departments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newDepartment }),
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Only admin users can modify departments');
          }
          const data = await response.json();
          throw new Error(data.error || 'Failed to add department');
        }

        const data = await response.json();
        setDepartments([...departments, data.department]);
        setNewDepartment('');
        onMessage('success', data.message);
      } catch (error: any) {
        onMessage('error', error.message);
      }
    }
  };

  const handleEditStart = (dept: Department) => {
    setEditingDepartment(dept.id);
    setEditingName(dept.name);
  };

  const handleEditCancel = () => {
    setEditingDepartment(null);
    setEditingName('');
  };

  const handleEditSave = async (id: string) => {
    if (!editingName.trim()) {
      onMessage('error', 'Department name cannot be empty');
      return;
    }

    try {
      const response = await fetch('/api/settings/departments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id,
          name: editingName
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update department name');
      }

      const data = await response.json();
      setDepartments(departments.map(dept => 
        dept.id === id ? data.department : dept
      ));
      onMessage('success', data.message);
      handleEditCancel();
    } catch (error: any) {
      onMessage('error', error.message);
    }
  };

  const toggleDepartmentStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/settings/departments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          is_active: !currentStatus 
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Only admin users can modify departments');
        }
        throw new Error('Failed to update department status');
      }

      const data = await response.json();
      setDepartments(departments.map(dept => 
        dept.id === id ? data.department : dept
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
            <Building2 className="w-5 h-5 mr-2" />
            Departments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 text-[#0041E9] animate-spin" />
            <span className="ml-2 text-sm text-slate-600">Loading departments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          Departments
        </CardTitle>
        <CardDescription>
          Manage departments available for job postings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add new department input */}
          <div className="flex gap-2">
            <Input
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              onKeyDown={handleAddDepartment}
              placeholder="Type department name and press Enter to add"
              className="flex-1"
            />
          </div>

          {/* Department list */}
          {departments.map((dept) => (
            <div key={dept.id} className="flex items-center gap-2">
              <div className={`flex-1 p-2 rounded border ${
                dept.is_active 
                  ? 'border-slate-200 bg-white'
                  : 'border-slate-200 bg-slate-50'
              }`}>
                {editingDepartment === dept.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEditSave(dept.id);
                        } else if (e.key === 'Escape') {
                          handleEditCancel();
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSave(dept.id)}
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
                      className={`${dept.is_active ? 'text-slate-900' : 'text-slate-500'} 
                                cursor-pointer hover:text-[#0041E9]`}
                      onClick={() => handleEditStart(dept)}
                    >
                      {dept.name}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStart(dept)}
                        className="text-slate-600 hover:text-[#0041E9]"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDepartmentStatus(dept.id, dept.is_active)}
                        className={dept.is_active ? 'text-red-600' : 'text-green-600'}
                      >
                        {dept.is_active ? 'Deactivate' : 'Activate'}
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

export default DepartmentSettings;