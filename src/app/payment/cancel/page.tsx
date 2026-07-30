import { XCircleIcon } from "lucide-react"
import Link from "next/link"

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <XCircleIcon className="size-6" />
        </div>
        <h1 className="mt-4 text-xl font-heading font-medium">Payment cancelled</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your payment was cancelled. No charges were made. You can try booking again.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
