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
import { cn } from "@/lib/utils"

interface CustomModalProps {
  trigger?: React.ReactNode;
  title?: string;
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export function CustomModal({
  trigger,
  title = "Filter Options",
  children,
  className,
  isOpen,
  setIsOpen
}: CustomModalProps) {

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className={cn("max-h-[90vh] flex flex-col p-6 overflow-hidden", className)}>
        <DialogHeader className="shrink-0 pb-2">
          <DialogTitle className="text-base font-bold text-slate-900">{title}</DialogTitle>
        </DialogHeader>

        <div className="pt-2 pb-0 overflow-y-auto flex-1 overscroll-contain pr-1">
          {children}
        </div>

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
