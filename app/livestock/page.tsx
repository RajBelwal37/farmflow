"use client"

import { useState } from 'react'
import { useData } from '@/app/context/DataContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

type LivestockFormData = {
  type: string;
  count: number;
  status: 'HEALTHY' | 'SICK' | 'QUARANTINED' | 'PREGNANT' | 'NURSING' | 'RECOVERING';
  lastCheckup: string;
}

export default function LivestockPage() {
  const { livestock, addLivestock, updateLivestock, deleteLivestock } = useData()
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newLivestock, setNewLivestock] = useState<LivestockFormData>({
    type: '',
    count: 0,
    status: 'HEALTHY',
    lastCheckup: new Date().toISOString().split('T')[0]
  })

  const handleAddLivestock = () => {
    if (newLivestock.type && newLivestock.count > 0) {
      if (editingIndex !== null) {
        updateLivestock(editingIndex, newLivestock)
        setEditingIndex(null)
      } else {
        addLivestock(newLivestock)
      }
      setNewLivestock({
        type: '',
        count: 0,
        status: 'HEALTHY',
        lastCheckup: new Date().toISOString().split('T')[0]
      })
    }
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setNewLivestock(livestock[index])
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setNewLivestock({
      type: '',
      count: 0,
      status: 'HEALTHY',
      lastCheckup: new Date().toISOString().split('T')[0]
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'bg-green-500'
      case 'SICK': return 'bg-red-500'
      case 'RECOVERING': return 'bg-amber-500'
      case 'QUARANTINED': return 'bg-orange-500'
      case 'PREGNANT': return 'bg-purple-500'
      case 'NURSING': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Livestock Management</h1>
      
      {/* Add/Edit Livestock Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{editingIndex !== null ? 'Edit Livestock' : 'Add New Livestock'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type">Animal Type</Label>
              <Input
                id="type"
                placeholder="Enter animal type"
                value={newLivestock.type}
                onChange={(e) => setNewLivestock({ ...newLivestock, type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">Count</Label>
              <Input
                id="count"
                type="number"
                placeholder="Enter count"
                value={newLivestock.count}
                onChange={(e) => setNewLivestock({ ...newLivestock, count: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Health Status</Label>
              <Select
                value={newLivestock.status}
                onValueChange={(value: 'HEALTHY' | 'SICK' | 'QUARANTINED' | 'PREGNANT' | 'NURSING' | 'RECOVERING') => 
                  setNewLivestock({ ...newLivestock, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HEALTHY">Healthy</SelectItem>
                  <SelectItem value="SICK">Sick</SelectItem>
                  <SelectItem value="QUARANTINED">Quarantined</SelectItem>
                  <SelectItem value="PREGNANT">Pregnant</SelectItem>
                  <SelectItem value="NURSING">Nursing</SelectItem>
                  <SelectItem value="RECOVERING">Recovering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastCheckup">Last Checkup</Label>
              <Input
                id="lastCheckup"
                type="date"
                value={newLivestock.lastCheckup}
                onChange={(e) => setNewLivestock({ ...newLivestock, lastCheckup: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button onClick={handleAddLivestock}>
              {editingIndex !== null ? (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Update Livestock
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Livestock
                </>
              )}
            </Button>
            {editingIndex !== null && (
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Livestock List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {livestock.map((animal, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{animal.type}</CardTitle>
                <Badge className={getStatusColor(animal.status)}>
                  {animal.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Count:</span>
                  <span>{animal.count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Checkup:</span>
                  <span>{formatDate(animal.lastCheckup)}</span>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(index)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteLivestock(index)}>
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