"use client"

import { useState } from 'react'
import { useData } from '@/app/context/DataContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

type InventoryFormData = {
  category: string;
  current: number;
  min: number;
  max: number;
}

export default function InventoryPage() {
  const { inventory, addInventory, updateInventory, deleteInventory } = useData()
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newItem, setNewItem] = useState<InventoryFormData>({
    category: '',
    current: 0,
    min: 0,
    max: 0
  })

  const handleAddItem = () => {
    if (newItem.category && newItem.max > 0) {
      if (editingIndex !== null) {
        updateInventory(editingIndex, newItem)
        setEditingIndex(null)
      } else {
        addInventory(newItem)
      }
      setNewItem({
        category: '',
        current: 0,
        min: 0,
        max: 0
      })
    }
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setNewItem(inventory[index])
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setNewItem({
      category: '',
      current: 0,
      min: 0,
      max: 0
    })
  }

  const getStatusColor = (current: number, min: number, max: number) => {
    if (current < min) return 'bg-red-500'
    if (current > max * 0.8) return 'bg-green-500'
    return 'bg-blue-500'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Inventory Management</h1>
      
      {/* Add/Edit Item Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{editingIndex !== null ? 'Edit Inventory Item' : 'Add New Inventory Item'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Enter category name"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current">Current Quantity</Label>
              <Input
                id="current"
                type="number"
                placeholder="Enter current quantity"
                value={newItem.current}
                onChange={(e) => setNewItem({ ...newItem, current: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min">Minimum Quantity</Label>
              <Input
                id="min"
                type="number"
                placeholder="Enter minimum quantity"
                value={newItem.min}
                onChange={(e) => setNewItem({ ...newItem, min: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Maximum Quantity</Label>
              <Input
                id="max"
                type="number"
                placeholder="Enter maximum quantity"
                value={newItem.max}
                onChange={(e) => setNewItem({ ...newItem, max: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button onClick={handleAddItem}>
              {editingIndex !== null ? (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Update Item
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
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

      {/* Inventory List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {inventory.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{item.category}</CardTitle>
                <Badge className={getStatusColor(item.current, item.min, item.max)}>
                  {item.current < item.min ? 'Low' : 
                   item.current > item.max * 0.8 ? 'High' : 
                   'Normal'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Current:</span>
                  <span>{item.current}</span>
                </div>
                <div className="flex justify-between">
                  <span>Min/Max:</span>
                  <span>{item.min} / {item.max}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Stock Level</span>
                    <span>{Math.round((item.current / item.max) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(item.current / item.max) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(index)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteInventory(index)}>
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