"use client"

import { useState, useEffect } from 'react'
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

const livestockFormSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  breed: z.string().min(1, 'Breed is required'),
  quantity: z.coerce
    .number()
    .min(1, 'Quantity must be at least 1')
    .max(10000, 'Quantity must be less than 10000'),
  status: z.enum(['HEALTHY', 'SICK', 'QUARANTINED', 'PREGNANT', 'NURSING']),
  birthDate: z.string().optional(),
  notes: z.string().optional(),
})

type LivestockFormValues = z.infer<typeof livestockFormSchema>

interface Livestock {
  id: string
  type: string
  breed: string
  quantity: number
  status: 'HEALTHY' | 'SICK' | 'QUARANTINED' | 'PREGNANT' | 'NURSING'
  birthDate?: string
  notes?: string
}

interface AddLivestockFormProps {
  editingLivestock?: Livestock
  onSuccess?: (livestock: Livestock) => void
}

export function AddLivestockForm({ editingLivestock, onSuccess }: AddLivestockFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LivestockFormValues>({
    resolver: zodResolver(livestockFormSchema),
    defaultValues: {
      type: "",
      breed: "",
      quantity: 1,
      status: "HEALTHY",
      birthDate: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (editingLivestock) {
      form.reset({
        type: editingLivestock.type,
        breed: editingLivestock.breed,
        quantity: editingLivestock.quantity,
        status: editingLivestock.status,
        birthDate: editingLivestock.birthDate ? new Date(editingLivestock.birthDate).toISOString().split('T')[0] : '',
        notes: editingLivestock.notes || '',
      })
    }
  }, [editingLivestock, form])

  async function onSubmit(values: LivestockFormValues) {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/livestock' + (editingLivestock ? `?id=${editingLivestock.id}` : ''), {
        method: editingLivestock ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error(editingLivestock ? 'Failed to update livestock' : 'Failed to add livestock')
      }

      const data = await response.json()
      toast.success(editingLivestock ? "Livestock updated successfully" : "Livestock added successfully")
      form.reset()
      onSuccess?.(data)
    } catch (error) {
      toast.error(editingLivestock ? "Failed to update livestock" : "Failed to add livestock")
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingLivestock ? 'Edit Livestock' : 'Add New Livestock'}</CardTitle>
        <CardDescription>
          {editingLivestock ? 'Update the details of your livestock' : 'Enter the details of your new livestock'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Cattle, Sheep, Pig" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breed</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Angus, Merino" {...field} />
                    </FormControl>
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
                      <Input type="number" min={1} {...field} />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HEALTHY">Healthy</SelectItem>
                        <SelectItem value="SICK">Sick</SelectItem>
                        <SelectItem value="QUARANTINED">Quarantined</SelectItem>
                        <SelectItem value="PREGNANT">Pregnant</SelectItem>
                        <SelectItem value="NURSING">Nursing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>Optional for tracking age</FormDescription>
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional information..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional details about the livestock</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingLivestock ? 'Update Livestock' : 'Add Livestock'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 