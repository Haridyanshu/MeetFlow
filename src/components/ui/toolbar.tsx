import { cn } from "@/lib/utils"

function Toolbar({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar"
      className={cn("flex items-center justify-between gap-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function ToolbarLeft({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar-left"
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function ToolbarRight({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar-right"
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Toolbar, ToolbarLeft, ToolbarRight }
