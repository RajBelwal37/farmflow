"use client"

import { useState } from 'react'
import { useData } from '@/app/context/DataContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

type CropFormData = {
  name: string;
  variety?: string;
  area: number;
  plantingDate: string;
  expectedHarvest: string;
  status: 'PLANNED' | 'PLANTED' | 'GROWING' | 'HARVESTED' | 'FAILED';
  notes?: string;
}

export default function CropsPage() {
  const { crops, addCrop, updateCrop, deleteCrop } = useData()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newCrop, setNewCrop] = useState<CropFormData>({
    name: '',
    variety: '',
    area: 0,
    plantingDate: '',
    expectedHarvest: '',
    status: 'PLANNED',
    notes: ''
  })

  const handleAddCrop = async () => {
    console.log('Starting handleAddCrop with data:', newCrop);
    
    if (!newCrop.name || newCrop.area <= 0 || !newCrop.plantingDate || !newCrop.expectedHarvest) {
      console.log('Validation failed:', {
        name: newCrop.name,
        area: newCrop.area,
        plantingDate: newCrop.plantingDate,
        expectedHarvest: newCrop.expectedHarvest
      });
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingId !== null) {
        console.log('Updating crop:', editingId);
        await updateCrop(editingId, newCrop);
        toast.success('Crop updated successfully');
        setEditingId(null);
      } else {
        console.log('Adding new crop');
        await addCrop(newCrop);
        toast.success('Crop added successfully');
      }
      setNewCrop({
        name: '',
        variety: '',
        area: 0,
        plantingDate: '',
        expectedHarvest: '',
        status: 'PLANNED',
        notes: ''
      });
    } catch (error: any) {
      console.error('Error in handleAddCrop:', error);
      toast.error(error.message || 'Failed to save crop');
    }
  }

  const handleEdit = (crop: any) => {
    setEditingId(crop.id)
    setNewCrop({
      name: crop.name,
      variety: crop.variety,
      area: crop.area,
      plantingDate: crop.plantingDate,
      expectedHarvest: crop.expectedHarvest,
      status: crop.status,
      notes: crop.notes
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setNewCrop({
      name: '',
      variety: '',
      area: 0,
      plantingDate: '',
      expectedHarvest: '',
      status: 'PLANNED',
      notes: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GROWING': return 'bg-green-500'
      case 'PLANTED': return 'bg-blue-500'
      case 'HARVESTED': return 'bg-amber-500'
      case 'PLANNED': return 'bg-gray-500'
      case 'FAILED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Crop Management</h1>
      
      {/* Add/Edit Crop Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{editingId !== null ? 'Edit Crop' : 'Add New Crop'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Crop Name</Label>
              <Input
                id="name"
                placeholder="Enter crop name"
                value={newCrop.name}
                onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variety">Variety</Label>
              <Input
                id="variety"
                placeholder="Enter variety"
                value={newCrop.variety}
                onChange={(e) => setNewCrop({ ...newCrop, variety: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area (hectares)</Label>
              <Input
                id="area"
                type="number"
                placeholder="Enter area"
                value={newCrop.area}
                onChange={(e) => setNewCrop({ ...newCrop, area: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plantingDate">Planting Date</Label>
              <Input
                id="plantingDate"
                type="date"
                placeholder="Enter planting date"
                value={newCrop.plantingDate}
                onChange={(e) => setNewCrop({ ...newCrop, plantingDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedHarvest">Expected Harvest</Label>
              <Input
                id="expectedHarvest"
                type="date"
                placeholder="Enter expected harvest"
                value={newCrop.expectedHarvest}
                onChange={(e) => setNewCrop({ ...newCrop, expectedHarvest: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newCrop.status}
                onValueChange={(value: 'PLANNED' | 'PLANTED' | 'GROWING' | 'HARVESTED' | 'FAILED') => 
                  setNewCrop({ ...newCrop, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNED">Planned</SelectItem>
                  <SelectItem value="PLANTED">Planted</SelectItem>
                  <SelectItem value="GROWING">Growing</SelectItem>
                  <SelectItem value="HARVESTED">Harvested</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newCrop.status !== 'PLANNED' && newCrop.status !== 'HARVESTED' && (
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Enter notes"
                  value={newCrop.notes}
                  onChange={(e) => setNewCrop({ ...newCrop, notes: e.target.value })}
                />
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-6">
            <Button onClick={handleAddCrop}>
              {editingId !== null ? (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Update Crop
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Crop
                </>
              )}
            </Button>
            {editingId !== null && (
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Crops List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {crops.map((crop) => (
          <Card key={crop.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{crop.name}</CardTitle>
                <Badge className={getStatusColor(crop.status)}>
                  {crop.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Area:</span>
                  <span>{crop.area} hectares</span>
                </div>
                {crop.variety && (
                  <div className="flex justify-between">
                    <span>Variety:</span>
                    <span>{crop.variety}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Planting Date:</span>
                  <span>{new Date(crop.plantingDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Harvest:</span>
                  <span>{new Date(crop.expectedHarvest).toLocaleDateString()}</span>
                </div>
                {crop.notes && (
                  <div className="flex justify-between">
                    <span>Notes:</span>
                    <span>{crop.notes}</span>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(crop)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => crop.id && deleteCrop(crop.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}