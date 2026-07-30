import { CheckCircleIcon } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950">
          <CheckCircleIcon className="size-6" />
        </div>
        <h1 className="mt-4 text-xl font-heading font-medium">Payment successful</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your booking has been confirmed. Check your email for the meeting details.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
