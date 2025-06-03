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

const cropFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  variety: z.string().optional(),
  area: z.coerce
    .number()
    .min(0.1, 'Area must be at least 0.1')
    .max(10000, 'Area must be less than 10000'),
  plantingDate: z.string().min(1, 'Planting date is required'),
  expectedHarvest: z.string().min(1, 'Expected harvest date is required'),
  status: z.enum(['PLANNED', 'PLANTED', 'GROWING', 'HARVESTED', 'FAILED']),
  notes: z.string().optional(),
})

type CropFormValues = z.infer<typeof cropFormSchema>

interface Crop {
  id: string
  name: string
  variety?: string
  area: number
  plantingDate: string
  expectedHarvest: string
  status: 'PLANNED' | 'PLANTED' | 'GROWING' | 'HARVESTED' | 'FAILED'
  notes?: string
}

interface AddCropFormProps {
  editingCrop?: Crop
  onSuccess?: (crop: Crop) => void
}

export function AddCropForm({ editingCrop, onSuccess }: AddCropFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CropFormValues>({
    resolver: zodResolver(cropFormSchema),
    defaultValues: {
      name: "",
      variety: "",
      area: 1,
      plantingDate: "",
      expectedHarvest: "",
      status: "PLANNED",
      notes: "",
    },
  })

  useEffect(() => {
    if (editingCrop) {
      form.reset({
        name: editingCrop.name,
        variety: editingCrop.variety || '',
        area: editingCrop.area,
        plantingDate: new Date(editingCrop.plantingDate).toISOString().split('T')[0],
        expectedHarvest: new Date(editingCrop.expectedHarvest).toISOString().split('T')[0],
        status: editingCrop.status,
        notes: editingCrop.notes || '',
      })
    }
  }, [editingCrop, form])

  async function onSubmit(values: CropFormValues) {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/crops' + (editingCrop ? `?id=${editingCrop.id}` : ''), {
        method: editingCrop ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error(editingCrop ? 'Failed to update crop' : 'Failed to add crop')
      }

      const data = await response.json()
      toast.success(editingCrop ? "Crop updated successfully" : "Crop added successfully")
      form.reset()
      onSuccess?.(data)
    } catch (error) {
      toast.error(editingCrop ? "Failed to update crop" : "Failed to add crop")
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingCrop ? 'Edit Crop' : 'Add New Crop'}</CardTitle>
        <CardDescription>
          {editingCrop ? 'Update the details of your crop' : 'Enter the details of your new crop'}
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
                      <Input placeholder="e.g., Wheat, Corn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="variety"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variety (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Hard Red Winter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (hectares)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PLANNED">Planned</SelectItem>
                        <SelectItem value="PLANTED">Planted</SelectItem>
                        <SelectItem value="GROWING">Growing</SelectItem>
                        <SelectItem value="HARVESTED">Harvested</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plantingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planting Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedHarvest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Harvest Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                      placeholder="Add any additional notes about the crop"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCrop ? 'Update Crop' : 'Add Crop'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 