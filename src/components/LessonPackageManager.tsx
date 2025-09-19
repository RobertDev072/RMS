import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/use-toast';
import { Edit, Plus, Package } from 'lucide-react';

export const LessonPackageManager: React.FC = () => {
  const { lessonPackages, fetchLessonPackages, deleteLessonPackage } = useData();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    lessons_count: 1,
    price: 0,
    is_active: true
  });

  useEffect(() => {
    fetchLessonPackages();
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      lessons_count: 1,
      price: 0,
      is_active: true
    });
    setEditingPackage(null);
  };

  const handleDelete = async (pkg: any) => {
    if (confirm(`Weet je zeker dat je "${pkg.name}" wilt verwijderen?`)) {
      const result = await deleteLessonPackage(pkg.id);
      if (!result.error) {
        fetchLessonPackages();
      }
    }
  };

  const handleEdit = (pkg: any) => {
    setEditingPackage(pkg);
    setForm({
      name: pkg.name,
      description: pkg.description || '',
      lessons_count: pkg.lessons_count,
      price: pkg.price,
      is_active: pkg.is_active
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      if (editingPackage) {
        const { error } = await supabase
          .from('lesson_packages')
          .update({
            name: form.name,
            description: form.description,
            lessons_count: form.lessons_count,
            price: form.price,
            is_active: form.is_active
          })
          .eq('id', editingPackage.id);

        if (error) throw error;
        toast({ title: "Pakket bijgewerkt", description: "Het lespakket is succesvol bijgewerkt." });
      } else {
        const { error } = await supabase
          .from('lesson_packages')
          .insert({
            name: form.name,
            description: form.description,
            lessons_count: form.lessons_count,
            price: form.price,
            is_active: form.is_active
          });

        if (error) throw error;
        toast({ title: "Pakket aangemaakt", description: "Het nieuwe lespakket is aangemaakt." });
      }

      setShowDialog(false);
      resetForm();
      fetchLessonPackages();
    } catch (error: any) {
      toast({ 
        title: "Fout", 
        description: error.message || "Er is een fout opgetreden.",
        variant: "destructive" 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Lespakketten Beheren</CardTitle>
          <Dialog open={showDialog} onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nieuw Pakket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPackage ? 'Pakket Bewerken' : 'Nieuw Lespakket'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Naam</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="Bijv. Basis Pakket"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Beschrijving</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    placeholder="Beschrijving van het pakket..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lessons_count">Aantal Lessen</Label>
                    <Input
                      id="lessons_count"
                      type="number"
                      value={form.lessons_count}
                      onChange={(e) => setForm({...form, lessons_count: parseInt(e.target.value) || 1})}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Prijs (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({...form, price: parseFloat(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm({...form, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Actief</Label>
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editingPackage ? 'Bijwerken' : 'Aanmaken'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {lessonPackages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nog geen lespakketten aangemaakt</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessonPackages.map((pkg) => (
              <div key={pkg.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {pkg.lessons_count} lessen - €{pkg.price}
                  </p>
                  {pkg.description && (
                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pkg.is_active ? 'Actief' : 'Inactief'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(pkg)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Bewerken
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(pkg)}
                  >
                    Verwijderen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};