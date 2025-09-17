import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/use-toast';
import { Edit, Plus, Car } from 'lucide-react';

export const CarManager: React.FC = () => {
  const { cars, fetchCars } = useData();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [form, setForm] = useState({
    license_plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    is_available: true
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const resetForm = () => {
    setForm({
      license_plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      is_available: true
    });
    setEditingCar(null);
  };

  const handleEdit = (car: any) => {
    setEditingCar(car);
    setForm({
      license_plate: car.license_plate,
      brand: car.brand,
      model: car.model,
      year: car.year || new Date().getFullYear(),
      is_available: car.is_available
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      if (editingCar) {
        const { error } = await supabase
          .from('cars')
          .update({
            license_plate: form.license_plate,
            brand: form.brand,
            model: form.model,
            year: form.year,
            is_available: form.is_available
          })
          .eq('id', editingCar.id);

        if (error) throw error;
        toast({ title: "Auto bijgewerkt", description: "De auto is succesvol bijgewerkt." });
      } else {
        const { error } = await supabase
          .from('cars')
          .insert({
            license_plate: form.license_plate,
            brand: form.brand,
            model: form.model,
            year: form.year,
            is_available: form.is_available
          });

        if (error) throw error;
        toast({ title: "Auto toegevoegd", description: "De nieuwe auto is toegevoegd." });
      }

      setShowDialog(false);
      resetForm();
      fetchCars();
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
          <CardTitle>Auto's Beheren</CardTitle>
          <Dialog open={showDialog} onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Auto Toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCar ? 'Auto Bewerken' : 'Nieuwe Auto'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="license_plate">Kenteken</Label>
                  <Input
                    id="license_plate"
                    value={form.license_plate}
                    onChange={(e) => setForm({...form, license_plate: e.target.value.toUpperCase()})}
                    placeholder="XX-XXX-X"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Merk</Label>
                    <Input
                      id="brand"
                      value={form.brand}
                      onChange={(e) => setForm({...form, brand: e.target.value})}
                      placeholder="BMW"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={form.model}
                      onChange={(e) => setForm({...form, model: e.target.value})}
                      placeholder="3 Serie"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="year">Bouwjaar</Label>
                  <Input
                    id="year"
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm({...form, year: parseInt(e.target.value) || new Date().getFullYear()})}
                    min="1990"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_available"
                    checked={form.is_available}
                    onCheckedChange={(checked) => setForm({...form, is_available: checked})}
                  />
                  <Label htmlFor="is_available">Beschikbaar</Label>
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editingCar ? 'Bijwerken' : 'Toevoegen'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {cars.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nog geen auto's toegevoegd</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cars.map((car) => (
              <div key={car.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{car.license_plate}</h3>
                  <p className="text-sm text-muted-foreground">
                    {car.brand} {car.model} {car.year && `(${car.year})`}
                  </p>
                  <Badge variant={car.is_available ? "default" : "secondary"} className="mt-1">
                    {car.is_available ? 'Beschikbaar' : 'Niet beschikbaar'}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleEdit(car)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Bewerken
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};