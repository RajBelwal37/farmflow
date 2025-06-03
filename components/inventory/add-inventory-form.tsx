"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from 'lucide-react'

const inventoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['FEED', 'SEED', 'FERTILIZER', 'EQUIPMENT', 'MEDICINE', 'PRODUCE', 'OTHER']),
  quantity: z.coerce
    .number()
    .min(0, 'Quantity must be at least 0'),
  unit: z.string().min(1, 'Unit is required'),
  minQuantity: z.coerce
    .number()
    .min(0, 'Minimum quantity must be at least 0')
    .optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
})

type InventoryFormValues = z.infer<typeof inventoryFormSchema>

interface Inventory {
  id: string
  name: string
  category: 'FEED' | 'SEED' | 'FERTILIZER' | 'EQUIPMENT' | 'MEDICINE' | 'PRODUCE' | 'OTHER'
  quantity: number
  unit: string
  minQuantity?: number
  location?: string
  notes?: string
}

interface AddInventoryFormProps {
  editingItem?: Inventory
  onSuccess?: (inventory: Inventory) => void
}

export function AddInventoryForm({ editingItem, onSuccess }: AddInventoryFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      category: "OTHER",
      quantity: 0,
      unit: "",
      minQuantity: undefined,
      location: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (editingItem) {
      form.reset({
        name: editingItem.name,
        category: editingItem.category,
        quantity: editingItem.quantity,
        unit: editingItem.unit,
        minQuantity: editingItem.minQuantity,
        location: editingItem.location || '',
        notes: editingItem.notes || '',
      })
    }
  }, [editingItem, form])

  async function onSubmit(values: InventoryFormValues) {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/inventory' + (editingItem ? `?id=${editingItem.id}` : ''), {
        method: editingItem ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error(editingItem ? 'Failed to update inventory item' : 'Failed to add inventory item')
      }

      const data = await response.json()
      toast.success(editingItem ? "Inventory item updated successfully" : "Inventory item added successfully")
      form.reset()
      onSuccess?.(data)
    } catch (error) {
      toast.error(editingItem ? "Failed to update inventory item" : "Failed to add inventory item")
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</CardTitle>
        <CardDescription>
          {editingItem ? 'Update the details of your inventory item' : 'Enter the details of your new inventory item'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chicken Feed, Tractor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FEED">Feed</SelectItem>
                        <SelectItem value="SEED">Seed</SelectItem>
                        <SelectItem value="FERTILIZER">Fertilizer</SelectItem>
                        <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                        <SelectItem value="MEDICINE">Medicine</SelectItem>
                        <SelectItem value="PRODUCE">Produce</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., kg, liters, pieces" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Quantity (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="Alert when quantity falls below this value"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Barn 1, Storage Room" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about the item"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 