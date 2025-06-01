import { Ship, Gauge, Scale, Cpu } from "lucide-react"
import type { Vessel } from "@/app/actions/vessel-actions"

interface VesselSpecificationsProps {
  vessel: Vessel
}

export function VesselSpecifications({ vessel }: VesselSpecificationsProps) {
  // Extract specifications from the JSONB field if available
  const specs = vessel.specifications
    ? typeof vessel.specifications === "string"
      ? JSON.parse(vessel.specifications)
      : vessel.specifications
    : {}

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Technical Specifications</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium flex items-center mb-2">
                <Ship className="mr-2 h-4 w-4 text-blue-600" />
                General Information
              </h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-500">Vessel Type:</div>
                <div>{vessel.vessel_type}</div>

                <div className="text-gray-500">Year Built:</div>
                <div>{vessel.year_built}</div>

                <div className="text-gray-500">Flag:</div>
                <div>{vessel.flag || "N/A"}</div>

                {vessel.former_names && (
                  <>
                    <div className="text-gray-500">Former Names:</div>
                    <div>{vessel.former_names}</div>
                  </>
                )}

                {vessel.shipyard && (
                  <>
                    <div className="text-gray-500">Shipyard:</div>
                    <div>{vessel.shipyard}</div>
                  </>
                )}

                {vessel.classification_society && (
                  <>
                    <div className="text-gray-500">Classification:</div>
                    <div>{vessel.classification_society}</div>
                  </>
                )}

                {vessel.owner_operator && (
                  <>
                    <div className="text-gray-500">Owner/Operator:</div>
                    <div>{vessel.owner_operator}</div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium flex items-center mb-2">
                <Scale className="mr-2 h-4 w-4 text-blue-600" />
                Dimensions & Capacity
              </h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-500">Length Overall:</div>
                <div>{vessel.length_overall ? `${vessel.length_overall}m` : "N/A"}</div>

                <div className="text-gray-500">Beam:</div>
                <div>{vessel.beam ? `${vessel.beam}m` : "N/A"}</div>

                <div className="text-gray-500">Gross Tonnage:</div>
                <div>{vessel.gross_tonnage || "N/A"}</div>

                <div className="text-gray-500">Deadweight:</div>
                <div>{vessel.deadweight ? `${vessel.deadweight}T` : "N/A"}</div>

                <div className="text-gray-500">Deck Area:</div>
                <div>{vessel.deck_area ? `${vessel.deck_area}m²` : "N/A"}</div>

                <div className="text-gray-500">Personnel Capacity:</div>
                <div>{vessel.passenger_capacity || "N/A"}</div>

                {specs.draft && (
                  <>
                    <div className="text-gray-500">Draft:</div>
                    <div>{specs.draft}m</div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium flex items-center mb-2">
                <Gauge className="mr-2 h-4 w-4 text-blue-600" />
                Performance & Power
              </h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-500">BHP:</div>
                <div>{vessel.bhp || "N/A"}</div>

                <div className="text-gray-500">Bollard Pull:</div>
                <div>{vessel.bollard_pull ? `${vessel.bollard_pull}T` : "N/A"}</div>

                <div className="text-gray-500">Dynamic Positioning:</div>
                <div>{vessel.dynamic_positioning || "None"}</div>

                {specs.cruising_speed && (
                  <>
                    <div className="text-gray-500">Cruising Speed:</div>
                    <div>{specs.cruising_speed} knots</div>
                  </>
                )}

                {specs.max_speed && (
                  <>
                    <div className="text-gray-500">Maximum Speed:</div>
                    <div>{specs.max_speed} knots</div>
                  </>
                )}

                {specs.fuel_capacity && (
                  <>
                    <div className="text-gray-500">Fuel Capacity:</div>
                    <div>{specs.fuel_capacity}L</div>
                  </>
                )}

                {specs.propulsion && (
                  <>
                    <div className="text-gray-500">Propulsion:</div>
                    <div>{specs.propulsion}</div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium flex items-center mb-2">
                <Cpu className="mr-2 h-4 w-4 text-blue-600" />
                Equipment & Features
              </h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                {specs.crane_capacity && (
                  <>
                    <div className="text-gray-500">Crane Capacity:</div>
                    <div>{specs.crane_capacity}</div>
                  </>
                )}

                {specs.winch_capacity && (
                  <>
                    <div className="text-gray-500">Winch Capacity:</div>
                    <div>{specs.winch_capacity}</div>
                  </>
                )}

                {specs.accommodation && (
                  <>
                    <div className="text-gray-500">Accommodation:</div>
                    <div>{specs.accommodation}</div>
                  </>
                )}

                {vessel.ais_enabled !== undefined && (
                  <>
                    <div className="text-gray-500">AIS Tracking:</div>
                    <div>{vessel.ais_enabled ? "Enabled" : "Disabled"}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {vessel.features && vessel.features.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Additional Features & Equipment</h3>
          <ul className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-md">
            {Array.isArray(vessel.features) ? (
              vessel.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <span className="mr-2 text-blue-600">•</span>
                  {feature}
                </li>
              ))
            ) : (
              <li className="text-sm">No additional features listed</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
