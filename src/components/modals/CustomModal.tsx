"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CustomModalProps {
  trigger: React.ReactNode;
  title?: string;
  children: React.ReactNode;
  className?: string
}

export function CustomModal({
  trigger,
  title = "Filter Options",
  children,
  className
}: CustomModalProps) {

  return (
    <Dialog >
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className={className} >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="py-4">{children}</div>

        <DialogFooter className="hidden">
          <DialogClose id="close_custom_modal" asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const closeCustomModal = () => {
  document.getElementById("close_custom_modal")?.click()
}
