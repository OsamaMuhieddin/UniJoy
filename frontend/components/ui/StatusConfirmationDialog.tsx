"use client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "@/app/(auth)/admin/users/page";

interface StatusConfirmationDialogProps {
    open: boolean;
    user: User | null;
    status: 'approved' | 'rejected';
    onCancel: () => void;
    onConfirm: (user: User) => void;
}

export const StatusConfirmationDialog = ({ open, user, status, onCancel, onConfirm }: StatusConfirmationDialogProps) => {
    const title = status === 'approved' ? 'Approve Host' : 'Reject Host';
    const message =
        status === 'approved'
            ? `Are you sure you want to approve ${user?.name}?`
        : `Are you sure you want to reject ${user?.name}?`;

    const buttonClass =
        status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

    return (
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="py-4">{message}</div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button className={buttonClass + ' text-white'} onClick={() => user && onConfirm(user)}>
                        {status === 'approved' ? 'Approve' : 'Reject'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};