"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Shared "confirm this admin action" dialog — the delete/pay/deliver/role
 * confirms in the orders and users pages were three copies of the same
 * AlertDialog shell with different title/description text. `children` lets
 * a caller (e.g. the balance top-up amount input) add extra content between
 * the description and the footer buttons.
 */
export default function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Подтвердить",
  destructive = false,
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  children?: React.ReactNode;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold uppercase tracking-tighter">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground font-medium pt-2 leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {children}

        <AlertDialogFooter className="pt-4 gap-2">
          <AlertDialogCancel className="cursor-pointer rounded-xl font-medium border-muted-foreground/20">
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={`cursor-pointer rounded-xl font-medium ${
              destructive
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
