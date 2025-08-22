'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/Card';
import { Trash2, Plus, MapPin } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import DeleteConfirmationDialog from '@/components/dialog/DeleteConfirmationDialog';
import AddHallDialog from '@/components/dialog/AddHallDialog';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EditHallDialog from '@/components/dialog/EditHallDialog';
import { useAuth } from '@/context/AuthContext';
export interface Hall {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  status: string;
}
export default function AdminHallsPage() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // حالة Pagination الجديدة
  const [hallsPerPage] = useState(6); // عدد الأحداث في كل صفحة
  const [loading, setLoading] = useState(false);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:8080/halls?page=${currentPage}&limit=${hallsPerPage}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await res.json();
      setHalls(data.halls);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch halls',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchHalls();
  }, [currentPage]);

  const handleDelete = async () => {
    if (!selectedHall) return;
    let name = selectedHall.name;
    try {
      const res = await fetch(
        `http://localhost:8080/halls/${selectedHall._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await res.json();
      toast({
        title: 'Hall Deleted',
        description: `${name} was deleted successfully.`,
        className: 'bg-green-500 text-white',
      });

      setHalls((prev) => prev.filter((h) => h._id !== selectedHall._id));
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedHall(null);
    }
  };
  const handleCreate = (newHall: Hall) => {
    setHalls((prev) => [newHall, ...prev]);
    setIsCreateDialogOpen(false);
  };
  // 1. فلترة البيانات التجريبية بناءً على البحث
  const filteredHalls = halls.filter(
    (hall) =>
      hall.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      hall.location.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  // 2. احسب عدد العناصر للصفحة الحالية من البيانات بعد الفلترة
  const indexOfLastEvent = currentPage * hallsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - hallsPerPage;
  const currentHall = filteredHalls.slice(indexOfFirstEvent, indexOfLastEvent);

  // 3. عدد الصفحات مبني على النتائج المفلترة فقط
  const totalPages = Math.ceil(filteredHalls.length / hallsPerPage);

  // تغيير الصفحة
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery]);

  return (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-center gap-4 flex-wrap'>
        <Input
          placeholder='Search hall by name or location...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='w-full sm:w-1/3'
        />
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className='gap-2'
        >
          <Plus className='h-4 w-4' /> Add Hall
        </Button>
      </div>

      {loading ? (
        <div className='flex justify-center items-center min-h-[40vh]'>
          <div className='animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full'></div>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          <AnimatePresence>
            {currentHall.map((hall) => (
              <motion.div
                key={hall._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className='border shadow-sm'>
                  <CardContent className='p-4 space-y-2'>
                    <h3 className='text-lg font-semibold'>{hall.name}</h3>
                    <p className='flex items-center gap-1 text-sm text-muted-foreground'>
                      <MapPin className='h-4 w-4' /> {hall.location}
                    </p>
                    <p className='text-sm'>Capacity: {hall.capacity}</p>
                    <p className='text-sm capitalize'>Status: {hall.status}</p>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => {
                          setSelectedHall(hall);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        onClick={() => {
                          setSelectedHall(hall);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredHalls.length > hallsPerPage && (
        <div className='flex justify-center mt-12'>
          <nav className='flex items-center gap-2'>
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${
                currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-purple-500/20'
              }`}
            >
              <ChevronLeft className='text-black' />
            </button>

            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`w-10 h-10 rounded-full flex items-center justify-center
                                                            ${
                                                              currentPage ===
                                                              index + 1
                                                                ? 'bg-purple-600 text-black'
                                                                : 'text-black hover:bg-purple-500/20'
                                                            } `}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full ${
                currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-purple-500/20'
              } `}
            >
              <ChevronRight className='text-black' />
            </button>
          </nav>
        </div>
      )}
      <EditHallDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        hall={selectedHall}
        token={token}
        onSuccess={(updatedHall) => {
          setHalls((prev) =>
            prev.map((h) => (h._id === updatedHall._id ? updatedHall : h))
          );
          setIsEditDialogOpen(false);
        }}
      />
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title='Delete Hall'
        description={`Are you sure you want to delete ${selectedHall?.name}?`}
        onConfirm={handleDelete}
      />
      <AddHallDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleCreate}
      />
    </div>
  );
}
