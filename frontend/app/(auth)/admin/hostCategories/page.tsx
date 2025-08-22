'use client';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from 'use-debounce';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import DeleteConfirmationDialog from '@/components/dialog/DeleteConfirmationDialog';
import EditCategoryDialog from '@/components/dialog/EditCategoryDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AddCategoryDialog from '@/components/dialog/AddCategoryDialog';
import { useAuth } from '@/context/AuthContext';
import { HostCategory } from '@/types/type';

const HostCategoriesPage = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<HostCategory | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [categories, setCategories] = useState<HostCategory[]>([]);
  const [filtered, setFiltered] = useState<HostCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1); // حالة Pagination الجديدة
  const [eventsPerPage] = useState(6); // عدد الأحداث في كل صفحة
  const [loading, setLoading] = useState(false);

  // حساب الأحداث للصفحة الحالية
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filtered.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filtered.length / eventsPerPage);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/host-categories?page=${currentPage}&perPage=${eventsPerPage}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();

      setCategories(data.categories);
      setFiltered(data.categories);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    let temp = [...categories];
    if (activeFilter !== 'all') {
      temp = temp.filter((c) => c.name === activeFilter);
    }
    if (debouncedQuery.trim()) {
      temp = temp.filter(
        (c) =>
          c.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    }
    setFiltered(temp);
  }, [debouncedQuery, activeFilter, categories]);

  const uniqueFilters = [
    'all',
    ...Array.from(new Set(categories.map((c) => c?.name))),
  ];

  const handleEdite = async (updatedValues: HostCategory) => {
    if (!selectedCategory) return;
    try {
      const res = await fetch(
        `http://localhost:8080/host-categories/${selectedCategory._id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedValues),
        }
      );
      const updated = await res.json();
      toast({
        title: 'Category Updated',
        description: `${updated.categories} was updated successfully.`,
        className: 'bg-green-600 text-white border-0',
      });
      setFiltered((prev) =>
        prev.map((c) =>
          c._id === selectedCategory._id ? updated.hostCategory : c
        )
      );
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsEditDialogOpen(false);
    }
  };
  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      const res = await fetch(
        `http://localhost:8080/host-categories/${selectedCategory._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast({
        title: 'Category Deleted',
        description: `${selectedCategory.name} was deleted successfully.`,
        className: 'bg-green-600 text-white border-0',
      });
      setFiltered((prev) => prev.filter((c) => c._id !== selectedCategory._id));
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  const handleAdd = async (newCategory: {
    name: string;
    description: string;
  }) => {
    try {
      const response = await fetch(`http://localhost:8080/host-categories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      const data = await response.json();

      toast({
        title: 'successfully!',
        description: data.message || 'Category added successfully!',
        className: 'bg-green-600 text-white border-0',
      });

      setCategories((prev) => [...prev, data.categories]);
      // Optionally re-fetch categories or just append:
      setFiltered((prev) => [...prev, data.categories]);
      // يمكنك أيضاً جلب من جديد أو تعديل الـ categories الرئيسي حسب ما تفضل
      setIsAddDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast({
        title: 'error',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  // تغيير الصفحة
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  if (loading) {
    return (
      <div className='flex items-center justify-center h-[70vh]'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500'></div>
      </div>
    );
  }
  return (
    <div className='p-6 space-y-6'>
      {/* Search & Filter */}
      <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
        <Input
          placeholder='Search category...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='w-full md:w-1/3'
        />
        <div className='flex justify-between items-center'>
          <div className='flex justify-end'>
            <Button
              className='mr-4'
              onClick={() => setIsAddDialogOpen(true)}
            >
              + Add Host Category
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='capitalize w-full md:w-40'
              >
                {activeFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {uniqueFilters.map((filter) => (
                <DropdownMenuItem
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className='capitalize cursor-pointer'
                >
                  {filter}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6'>
        {currentEvents.length > 0 ? (
          currentEvents.map(
            (categorie) =>
              categorie &&
              categorie.name &&
              categorie.description && (
                <motion.div
                  key={categorie._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Card className='overflow-hidden border-2 border-gray-200'>
                    <CardContent className='p-4'>
                      <h3 className='text-lg font-bold mb-2'>
                        {categorie.name}
                      </h3>
                      <p className='text-gray-600 text-sm mb-4'>
                        {categorie.description}
                      </p>

                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setSelectedCategory(categorie);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => {
                            setSelectedCategory(categorie);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
          )
        ) : (
          <p className='text-center col-span-full text-gray-500'>
            No categories found.
          </p>
        )}
      </div>
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title='Delete Host Category'
        description={`Are you sure you want to delete ${selectedCategory?.name}?`}
        onConfirm={handleDelete}
      />
      <EditCategoryDialog
        open={isEditDialogOpen}
        category={selectedCategory}
        onCancel={() => setIsEditDialogOpen(false)}
        onSave={handleEdite}
      />
      <AddCategoryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAdd}
      />

      {/* Pagination Controls */}
      {uniqueFilters.length > eventsPerPage && (
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
              <ChevronLeft className='text-purple-400' />
            </button>

            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`w-10 h-10 rounded-full flex items-center justify-center
                                        ${
                                          currentPage === index + 1
                                            ? 'bg-purple-600 text-white'
                                            : 'text-purple-400 hover:bg-purple-500/20'
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
              <ChevronRight className='text-purple-400' />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};
export default HostCategoriesPage;
