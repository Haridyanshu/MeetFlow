"use client"

import { useState } from "react"
import { AlertTriangleIcon, Trash2Icon, Loader2Icon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function DangerZoneSection() {
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-heading font-semibold">Danger zone</h2>
        <p className="text-sm text-muted-foreground">
          Irreversible actions that affect your account.
        </p>
      </div>

      <Card className="border-destructive/20">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangleIcon className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground">Delete account</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>

          {!confirm ? (
            <Button
              variant="destructive"
              size="sm"
              className="self-start"
              onClick={() => setConfirm(true)}
            >
              <Trash2Icon className="size-3.5" />
              Delete account
            </Button>
          ) : (
            <div className="flex flex-col gap-2 rounded-lg bg-destructive/5 border border-destructive/15 p-3">
              <p className="text-xs text-destructive font-medium">
                Are you absolutely sure? This will permanently delete your account and all your data.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled
                  className="flex-1"
                >
                  <Loader2Icon className="size-3.5" />
                  Contact support to delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
