'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/Card';
import { Building, MapPin, Users } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Hall } from '@/types/type';

const HallsPage=() =>{
  const { toast } = useToast();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
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
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Search */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <Input
          placeholder="Search halls by name or location..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-1/3 border border-purple-300 focus:border-purple-500"
        />
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {currentHall?.map((hall) => (
              <motion.div
                key={hall._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white shadow-xl rounded-xl overflow-hidden border border-purple-200 hover:shadow-purple-400 transition">
                  <CardContent className="p-6 space-y-3">
                    <h3 className="text-xl font-bold text-purple-700 flex items-center gap-2">
                      <Building className="h-5 w-5 text-purple-500" /> {hall.name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      {hall.location}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Users className="h-4 w-4 text-cyan-500" />
                      Capacity: {hall.capacity}
                    </p>
                    <p
                      className={cn(
                        'text-sm font-medium px-3 py-1 w-fit rounded-full',
                        hall.status === 'available'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      )}
                    >
                      Status: {hall?.status}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {filteredHalls?.length > hallsPerPage && (
        <div className="flex justify-center mt-12">
          <nav className="flex items-center gap-2"><button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-full transition ${
                currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-purple-200'
              }`}
            >
              <ChevronLeft className="text-purple-500" />
            </button>

            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition
                  ${
                    currentPage === index + 1
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-purple-600 hover:bg-purple-100'
                  }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full transition ${
                currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-purple-200'
              }`}
            >
              <ChevronRight className="text-purple-500" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};
export default HallsPage;