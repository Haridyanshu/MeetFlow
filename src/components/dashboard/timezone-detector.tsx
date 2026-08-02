"use client"

import { useEffect, useRef } from "react"

import { detectClientTimeZone, DEFAULT_TIMEZONE } from "@/lib/date"
import { updateUserTimezone } from "@/lib/actions/settings"

interface TimezoneDetectorProps {
  storedTimezone: string
}

export function TimezoneDetector({ storedTimezone }: TimezoneDetectorProps) {
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    if (typeof window === "undefined") return
    if (storedTimezone !== DEFAULT_TIMEZONE) return

    const detected = detectClientTimeZone()
    if (detected !== DEFAULT_TIMEZONE && detected !== storedTimezone) {
      void updateUserTimezone(detected)
    }
  }, [storedTimezone])

  return null
}
