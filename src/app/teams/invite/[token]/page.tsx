import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { acceptInvitation } from "@/lib/actions/teams"

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const session = await auth()

  if (!session) {
    redirect(`/login?callbackUrl=/teams/invite/${token}`)
  }

  const result = await acceptInvitation(token)

  if (!result.ok) {
    const errors: Record<string, string> = {
      invalid: "This invitation link is invalid.",
      expired: "This invitation link has expired.",
      email_mismatch: "This invitation was sent to a different email address.",
      already_member: "You are already a member of this team.",
    }

    const message = result.error ? (errors[result.error] ?? "Something went wrong.") : "Something went wrong."

    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center">
          <h1 className="text-xl font-heading font-medium text-destructive">Unable to join</h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    )
  }

  redirect("/dashboard/teams")
}
