'use client';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from 'use-debounce';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight, Layers, ScrollText } from 'lucide-react';
import { HostCategory } from '@/types/type';

export default function HostCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<HostCategory[]>([]);
  const [filtered, setFiltered] = useState<HostCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1); // حالة Pagination الجديدة
  const [eventsPerPage] = useState(6); // عدد الأحداث في كل صفحة
  const [loading, setLoading] = useState(false);

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
    let temp = categories;
    if (activeFilter !== 'all') {
      temp = temp?.filter((c) => c.name === activeFilter);
    }
    if (debouncedQuery?.trim()) {
      temp = temp?.filter(
        (c) =>
          c.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    }
    setFiltered(temp);
  }, [debouncedQuery, activeFilter, categories]);

  const uniqueFilters = [
    'all',
    ...Array.from(new Set(categories?.map((c) => c.name))),
  ];

  // حساب الأحداث للصفحة الحالية
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filtered?.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filtered?.length / eventsPerPage);

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
     <motion.div
       className='p-6 space-y-10 bg-gradient-to-tr from-purple-100 via-white to-blue-100 min-h-screen'
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       transition={{ duration: 0.8 }}
     >
       {/* Search & Filter */}
       <motion.div
         className='flex flex-col md:flex-row justify-between items-center gap-4'
         initial={{ y: -20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ delay: 0.3 }}
       >
         <Input
           placeholder='🔍 Search category...'
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className='w-full md:w-1/3 border border-purple-300 shadow-sm'
         />
         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button
               variant='outline'
               className='capitalize w-full md:w-40 text-purple-700 border-purple-400 hover:bg-purple-100'
             >
               {activeFilter}
             </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent className='bg-white border border-purple-300 rounded-lg shadow-md'>
             {uniqueFilters?.map((filter, index) => (
               <DropdownMenuItem
                 key={index}
                 onClick={() => setActiveFilter(filter)}
                 className='capitalize cursor-pointer hover:bg-purple-100'
               >
                 {filter}
               </DropdownMenuItem>
             ))}
           </DropdownMenuContent>
         </DropdownMenu>
       </motion.div>

       {/* Cards Section */}
       <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8'>
         {currentEvents?.length > 0 ? (
           currentEvents?.map((categorie: HostCategory, index: number) => (
             <motion.div
               key={categorie._id}
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.05 }}
               whileHover={{ scale: 1.03 }}
             >
               <Card className='bg-white border-2 border-purple-300 rounded-xl shadow-md hover:shadow-purple-400 transition-all duration-300'>
                 <CardContent className='p-5 space-y-3'>
                   <div className='flex items-center justify-between'>
                     <h3 className='text-xl font-bold text-purple-800'>
                       {categorie.name}
                     </h3>
                     <Layers
                       className='text-purple-400'
                       size={22}
                     />
                   </div>
                   <div className='text-gray-600 text-sm flex items-start gap-2'>
                     <ScrollText
                       className='text-blue-400 mt-1'
                       size={18}
                     />
                     <p className='leading-relaxed'>{categorie.description}</p>
                   </div>
                 </CardContent>
               </Card>
             </motion.div>
           ))
         ) : (
           <p className='text-center col-span-full text-gray-500'>
             No categories found.
           </p>
         )}
       </div>

       {/* Pagination Controls */}
       {uniqueFilters?.length > eventsPerPage && (
         <motion.div
           className='flex justify-center mt-12'
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.5 }}
         >
           <nav className='flex items-center gap-2'>
             <button
               onClick={() => paginate(Math.max(1, currentPage - 1))}
               disabled={currentPage === 1}
               className={`p-2 rounded-full border transition ${
                 currentPage === 1
                   ? 'opacity-50 cursor-not-allowed'
                   : 'hover:bg-purple-500/20'
               }`}
             >
               <ChevronLeft className='text-purple-600' />
             </button>

             {Array.from({ length: totalPages }).map((_, index) => (
               <button
                 key={index}
                 onClick={() => paginate(index + 1)}
                 className={`w-10 h-10 rounded-full flex items-center justify-center border transition ${
                   currentPage === index + 1
                     ? 'bg-purple-600 text-white'
                     : 'text-purple-600 hover:bg-purple-100'
                 }`}
               >
                 {index + 1}
               </button>
             ))}

             <button
               onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
               disabled={currentPage === totalPages}
               className={`p-2 rounded-full border ${
                 currentPage === totalPages
                   ? 'opacity-50 cursor-not-allowed'
                   : 'hover:bg-purple-500/20'
               }`}
             >
               <ChevronRight className='text-purple-600' />
             </button>
           </nav>
         </motion.div>
       )}
     </motion.div>
   );
}
