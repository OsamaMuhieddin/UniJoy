import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Hall } from '@/app/(auth)/admin/hall/page';
import { useAuth } from '@/context/AuthContext';

interface AddHallDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newHall: Hall) => void;
}

export default function AddHallDialog({
  open,
  onClose,
  onSuccess,
}: AddHallDialogProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/halls', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, location, capacity }),
      });

      const data = await res.json();

      toast({
        title: 'Hall Added',
        description: `${data.hall.name} was added successfully.`,
        className: 'bg-green-500 text-white',
      });

      onClose();
      onSuccess(data.hall);
      setName('');
      setLocation('');
      setCapacity(1);
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
          <DialogTitle>Add New Hall</DialogTitle>
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
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !name || !location || capacity < 1}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
