import type { Vessel } from "@/app/actions/vessel-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AISMapWidget } from "@/components/ais-map-widget"

interface VesselDetailsProps {
  vessel: Vessel
}

export function VesselDetails({ vessel }: VesselDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vessel Overview</CardTitle>
            <CardDescription>Key information about this vessel</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 text-sm">
              <div className="grid grid-cols-2 gap-1">
                <dt className="font-medium text-gray-500">Vessel Type</dt>
                <dd>{vessel.vessel_type}</dd>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <dt className="font-medium text-gray-500">Year Built</dt>
                <dd>{vessel.year_built}</dd>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <dt className="font-medium text-gray-500">Flag</dt>
                <dd>{vessel.flag || "Not specified"}</dd>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <dt className="font-medium text-gray-500">Classification</dt>
                <dd>{vessel.classification_society || "Not specified"}</dd>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <dt className="font-medium text-gray-500">DP Rating</dt>
                <dd>{vessel.dynamic_positioning || "None"}</dd>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <dt className="font-medium text-gray-500">Passenger Capacity</dt>
                <dd>{vessel.passenger_capacity}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <AISMapWidget
          vesselId={vessel.id}
          vesselName={vessel.vessel_name}
          initialLatitude={vessel.latitude || null}
          initialLongitude={vessel.longitude || null}
          initialTimestamp={vessel.ais_timestamp || vessel.updated_at || null}
          enableRealtime={true}
        />
      </div>

      {vessel.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{vessel.description}</p>
          </CardContent>
        </Card>
      )}

      {vessel.features && vessel.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {vessel.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
