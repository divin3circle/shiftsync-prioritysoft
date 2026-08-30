export type DemoLocation = {
  id: string
  name: string
  city: string
  timezone: string
  timezoneLabel: string
}

export const demoLocations: DemoLocation[] = [
  {
    id: "harbor",
    name: "Harbor Grill",
    city: "San Francisco",
    timezone: "America/Los_Angeles",
    timezoneLabel: "PT",
  },
  {
    id: "pier",
    name: "Pier Seven",
    city: "Santa Monica",
    timezone: "America/Los_Angeles",
    timezoneLabel: "PT",
  },
  {
    id: "lighthouse",
    name: "Lighthouse",
    city: "Boston",
    timezone: "America/New_York",
    timezoneLabel: "ET",
  },
  {
    id: "tidewater",
    name: "Tidewater",
    city: "Miami",
    timezone: "America/New_York",
    timezoneLabel: "ET",
  },
]
