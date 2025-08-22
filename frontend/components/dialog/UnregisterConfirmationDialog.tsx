'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EventCategory } from '@/types/type';

interface UnregisterConfirmationDialog {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  event?: EventCategory | null;
}

export default function UnregisterConfirmationDialog({
  open,
  onOpenChange,
  title = 'Confirm Unregister ',
  description = 'Are you sure you want to Unregister  this event? This action cannot be undone.',
  confirmLabel = 'Unregister  Permanently',
  cancelLabel = 'Cancel',
  onConfirm,
  event,
}: UnregisterConfirmationDialog) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className='py-4'>
          {event && (
            <div className='flex items-center gap-4'>
              <div className='bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16' />
              <div>
                <h4 className='font-semibold'>{event.title}</h4>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            variant='destructive'
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
