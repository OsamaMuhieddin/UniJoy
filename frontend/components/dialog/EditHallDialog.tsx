'use client';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Hall } from '@/app/(auth)/admin/hall/page';

interface EditHallDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (updatedHall: Hall) => void;
  hall: Hall | null;
  token: string;
}

export default function EditHallDialog({
  open,
  token,
  onClose,
  onSuccess,
  hall,
}: EditHallDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(1);
  const [loading, setLoading] = useState(false);

  // تعبئة النموذج عند فتح الـ dialog
  useEffect(() => {
    if (hall) {
      setName(hall.name);
      setLocation(hall.location);
      setCapacity(hall.capacity);
    }
  }, [hall]);

  const handleSubmit = async () => {
    if (!hall) return;
    let Name = hall.name;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/halls/${hall._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, location, capacity }),
      });

      const data = await res.json();

      toast({
        title: 'Hall Updated',
        description: `${name} was updated successfully.`,
        className: 'bg-green-500 text-white',
      });

      onSuccess(data.hall);
      onClose();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Hall</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <Input
            placeholder='Hall Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder='Location'
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Input
            type='number'
            min={1}
            placeholder='Capacity'
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value))}
          />
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !name || !location || capacity < 1}
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
