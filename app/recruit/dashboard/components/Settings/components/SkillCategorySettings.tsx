import React, { useState, useEffect } from 'react';
import { Tags, Check, X, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SkillCategory {
  id: string;
  name: string;
  is_active: boolean;
}

interface SkillCategorySettingsProps {
  onMessage: (type: 'success' | 'error', text: string) => void;
}

const SkillCategorySettings: React.FC<SkillCategorySettingsProps> = ({ onMessage }) => {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/settings/skill');
      if (!response.ok) {
        throw new Error('Failed to fetch skill categories');
      }
      const data = await response.json();
      setCategories(data.skillCategories);
    } catch (error) {
      onMessage('error', 'Failed to load skill categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newCategory.trim()) {
      try {
        const response = await fetch('/api/settings/skill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newCategory }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add skill category');
        }

        const data = await response.json();
        setCategories([...categories, data.skillCategory]);
        setNewCategory('');
        onMessage('success', data.message);
      } catch (error: any) {
        onMessage('error', error.message);
      }
    }
  };

  const handleEditStart = (category: SkillCategory) => {
    setEditingCategory(category.id);
    setEditingName(category.name);
  };

  const handleEditCancel = () => {
    setEditingCategory(null);
    setEditingName('');
  };

  const handleEditSave = async (id: string) => {
    if (!editingName.trim()) {
      onMessage('error', 'Category name cannot be empty');
      return;
    }

    try {
      const response = await fetch('/api/settings/skill', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id,
          name: editingName
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update category name');
      }

      const data = await response.json();
      setCategories(categories.map(cat => 
        cat.id === id ? data.skillCategory : cat
      ));
      onMessage('success', data.message);
      handleEditCancel();
    } catch (error: any) {
      onMessage('error', error.message);
    }
  };

  const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/settings/skill', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          is_active: !currentStatus 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update category status');
      }

      const data = await response.json();
      setCategories(categories.map(cat => 
        cat.id === id ? data.skillCategory : cat
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
            <Tags className="w-5 h-5 mr-2" />
            Skill Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 text-[#0041E9] animate-spin" />
            <span className="ml-2 text-sm text-slate-600">Loading skill categories...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Tags className="w-5 h-5 mr-2" />
          Skill Categories
        </CardTitle>
        <CardDescription>
          Manage skill categories available for job postings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={handleAddCategory}
              placeholder="Type category name and press Enter to add"
              className="flex-1"
            />
          </div>

          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <div className={`flex-1 p-2 rounded border ${
                category.is_active 
                  ? 'border-slate-200 bg-white'
                  : 'border-slate-200 bg-slate-50'
              }`}>
                {editingCategory === category.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEditSave(category.id);
                        } else if (e.key === 'Escape') {
                          handleEditCancel();
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSave(category.id)}
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
                      className={`${category.is_active ? 'text-slate-900' : 'text-slate-500'} 
                                cursor-pointer hover:text-[#0041E9]`}
                      onClick={() => handleEditStart(category)}
                    >
                      {category.name}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStart(category)}
                        className="text-slate-600 hover:text-[#0041E9]"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategoryStatus(category.id, category.is_active)}
                        className={category.is_active ? 'text-red-600' : 'text-green-600'}
                      >
                        {category.is_active ? 'Deactivate' : 'Activate'}
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

export default SkillCategorySettings;