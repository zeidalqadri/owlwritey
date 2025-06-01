"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Ship } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { createBooking } from "@/app/actions/booking-actions"
import { Checkbox } from "@/components/ui/checkbox"
import type { Vessel } from "@/app/actions/vessel-actions"

// Define the form schema with OSV-specific fields
const formSchema = z.object({
  vessel_id: z.string({
    required_error: "Please select a vessel",
  }),
  start_date: z.date({
    required_error: "Please select a start date",
  }),
  end_date: z.date({
    required_error: "Please select an end date",
  }),
  personnel_onboard: z.coerce.number().min(1, {
    message: "Please enter the number of personnel",
  }),
  scope_of_work: z.string().min(10, {
    message: "Scope of work must be at least 10 characters",
  }),
  project_ref: z.string().optional(),
  // OSV-specific fields
  require_dp_operations: z.boolean().default(false),
  cargo_description: z.string().optional(),
  require_crane_operations: z.boolean().default(false),
  offshore_location: z.string().optional(),
  special_requirements: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface BookingFormProps {
  vessels: Vessel[]
  preselectedVesselId?: string
}

export function BookingForm({ vessels, preselectedVesselId }: BookingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vessel_id: preselectedVesselId || "",
      personnel_onboard: 1,
      scope_of_work: "",
      project_ref: "",
      require_dp_operations: false,
      require_crane_operations: false,
      cargo_description: "",
      offshore_location: "",
      special_requirements: "",
    },
  })

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      // Calculate the estimated total cost based on the selected vessel and dates
      const selectedVessel = vessels.find((v) => v.id === data.vessel_id)
      if (!selectedVessel) {
        toast({
          title: "Error",
          description: "Selected vessel not found",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Calculate the number of days
      const startDate = new Date(data.start_date)
      const endDate = new Date(data.end_date)
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      // Calculate the base cost
      const baseRate = selectedVessel.daily_rate || 0
      let baseCost = baseRate * days

      // Apply weekly rate if applicable
      if (days >= 7 && selectedVessel.weekly_rate) {
        const weeks = Math.floor(days / 7)
        const remainingDays = days % 7
        baseCost = weeks * selectedVessel.weekly_rate + remainingDays * baseRate
      }

      // Apply monthly rate if applicable
      if (days >= 30 && selectedVessel.monthly_rate) {
        const months = Math.floor(days / 30)
        const remainingDays = days % 30
        baseCost = months * selectedVessel.monthly_rate + remainingDays * baseRate
      }

      // Add additional costs for OSV-specific requirements
      let additionalCosts = 0
      if (data.require_dp_operations) {
        additionalCosts += 500 * days // Example: $500 per day for DP operations
      }
      if (data.require_crane_operations) {
        additionalCosts += 300 * days // Example: $300 per day for crane operations
      }

      // Calculate estimated total cost with a margin
      const estimatedTotalCost = baseCost + additionalCosts

      // Prepare the booking data
      const bookingData = {
        vessel_id: data.vessel_id,
        start_date: format(data.start_date, "yyyy-MM-dd"),
        end_date: format(data.end_date, "yyyy-MM-dd"),
        personnel_onboard: data.personnel_onboard,
        scope_of_work: `${data.scope_of_work}\n\nOSV Requirements:\n${data.require_dp_operations ? "- DP Operations Required\n" : ""}${data.require_crane_operations ? "- Crane Operations Required\n" : ""}${data.cargo_description ? `- Cargo: ${data.cargo_description}\n` : ""}${data.offshore_location ? `- Offshore Location: ${data.offshore_location}\n` : ""}${data.special_requirements ? `- Special Requirements: ${data.special_requirements}` : ""}`,
        project_ref: data.project_ref || null,
        base_charter_cost: baseCost,
        estimated_total_cost: estimatedTotalCost,
      }

      // Submit the booking
      const result = await createBooking(bookingData)

      if (result.success) {
        toast({
          title: "Booking submitted",
          description: "Your booking request has been submitted successfully.",
        })
        router.push(`/dashboard/bookings/${result.bookingId}`)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting booking:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get the selected vessel
  const selectedVesselId = form.watch("vessel_id")
  const selectedVessel = vessels.find((v) => v.id === selectedVesselId)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="vessel_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select OSV</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an offshore support vessel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vessels.map((vessel) => (
                        <SelectItem key={vessel.id} value={vessel.id}>
                          {vessel.vessel_name} - {vessel.vessel_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose the OSV you want to charter</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedVessel && (
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <Ship className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium">Selected OSV Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-sm">
                  <div className="text-gray-500">Type:</div>
                  <div>{selectedVessel.vessel_type}</div>

                  {selectedVessel.dynamic_positioning && (
                    <>
                      <div className="text-gray-500">DP Rating:</div>
                      <div>{selectedVessel.dynamic_positioning}</div>
                    </>
                  )}

                  {selectedVessel.bollard_pull && (
                    <>
                      <div className="text-gray-500">Bollard Pull:</div>
                      <div>{selectedVessel.bollard_pull}T</div>
                    </>
                  )}

                  {selectedVessel.deck_area && (
                    <>
                      <div className="text-gray-500">Deck Area:</div>
                      <div>{selectedVessel.deck_area}m²</div>
                    </>
                  )}

                  <div className="text-gray-500">Personnel Capacity:</div>
                  <div>{selectedVessel.passenger_capacity}</div>

                  <div className="text-gray-500">Daily Rate:</div>
                  <div>${selectedVessel.daily_rate?.toFixed(2) || "Contact us"}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const startDate = form.getValues("start_date")
                            return date < new Date() || (startDate && date < startDate)
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="personnel_onboard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personnel Onboard</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormDescription>Number of personnel that will be onboard</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_ref"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Reference (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Your internal project reference or PO number</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="scope_of_work"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scope of Work</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the intended use of the vessel and operational requirements"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Provide details about your offshore operations and requirements</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-gray-50 p-4 rounded-md space-y-4">
              <h3 className="font-medium">OSV-Specific Requirements</h3>

              <FormField
                control={form.control}
                name="offshore_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offshore Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Gulf of Mexico Block 123" {...field} />
                    </FormControl>
                    <FormDescription>Specify the offshore location where the vessel will operate</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="require_dp_operations"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Dynamic Positioning Operations Required</FormLabel>
                      <FormDescription>
                        Check if your operations require dynamic positioning capabilities
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="require_crane_operations"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Crane Operations Required</FormLabel>
                      <FormDescription>Check if your operations require the use of the vessel's crane</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cargo_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo Description (if applicable)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ROV equipment, supplies, etc." {...field} />
                    </FormControl>
                    <FormDescription>Describe any cargo that will be transported</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="special_requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requirements (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional requirements or specifications"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Specify any additional requirements for your offshore operations</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Booking Request"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
