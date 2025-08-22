'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDebounce } from 'use-debounce';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  User,
  UserX,
  UserCheck,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Stats } from '@/components/ui/Stats';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DeleteConfirmationDialog from '@/components/dialog/DeleteConfirmationDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/use-toast';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from '@/components/ui/pagination';
import { StatusConfirmationDialog } from '@/components/ui/StatusConfirmationDialog';
import { useAuth } from '@/context/AuthContext';

// Schema validation using Zod
const userSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  role: z.string(),
  hostStatus: z.string(),
});

export type User = z.infer<typeof userSchema>;

const AdminUsersPage = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatusUser, setSelectedStatusUser] = useState<User | null>(
    null
  );
  const [nextStatus, setNextStatus] = useState<'approved' | 'rejected'>(
    'approved'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  // Form setup
  const form = useForm<User>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      hostStatus: '',
    },
  });

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://localhost:8080/admin/users`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      toast({
        title: 'Fetch successfully',
        description: `Fetch All user successfully.`,
        className: 'bg-green-500 text-white',
      });
      const data = await response.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'An unexpected error occurred.',
        className: 'bg-red-500 text-white border-0',
      });
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Apply filters and sorting
  useEffect(() => {
    let result = users;

    if (debouncedQuery) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((user) => user.hostStatus === statusFilter);
    }

    result?.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [
    users,
    debouncedQuery,
    roleFilter,
    statusFilter,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleStatus = async (
    user: User,
    newStatus: 'approved' | 'rejected' | 'pending'
  ) => {
    try {
      const res = await fetch(
        `http://localhost:8080/admin/hosts/${user._id}/status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ hostStatus: newStatus }),
        }
      );

      const data = await res.json();
      const updatedUser = data.user;

      toast({
        title: 'Status Updated',
        description: data.message,
        className: 'bg-blue-600 text-white border-0',
      });
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? updatedUser : u))
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'An unexpected error occurred.',
        className: 'bg-red-500 text-white border-0',
      });
    }
  };
  // Handle delete
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(
        `http://localhost:8080/admin/users/${selectedUser._id}`,
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
        title: 'User Deleted',
        description: data.message,
        className: 'bg-green-600 text-white border-0',
      });
      setUsers((prev) => prev.filter((user) => user._id !== selectedUser._id));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'An unexpected error occurred.',
        className: 'bg-red-500 text-white border-0',
      });
    }

    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers?.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers?.length / usersPerPage);

  const renderSortIndicator = (field: keyof User) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? (
        <ChevronUp className='ml-1 h-4 w-4' />
      ) : (
        <ChevronDown className='ml-1 h-4 w-4' />
      );
    }
    return null;
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-7xl mx-auto'
      >
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className='text-3xl font-bold text-gray-800'
          >
            User Management
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'>
              <Plus className='mr-2 h-4 w-4' /> Add New User
            </Button>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'
        >
          <div className='relative'>
            <Search className='absolute left-3 top-3 text-gray-400 h-4 w-4' />
            <Input
              placeholder='Search users...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>

          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
          >
            <SelectTrigger className='w-full'>
              <div className='flex items-center'>
                <User className='mr-2 h-4 w-4' />
                <span>{roleFilter === 'all' ? 'All Roles' : roleFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Roles</SelectItem>
              <SelectItem value='host'>Host</SelectItem>
              <SelectItem value='user'>User</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className='w-full'>
              <div className='flex items-center'>
                <Filter className='mr-2 h-4 w-4' />
                <span>
                  {statusFilter === 'all' ? 'All Statuses' : statusFilter}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              <SelectItem value='approved'>approve</SelectItem>
              <SelectItem value='rejected'>rejecte</SelectItem>
              <SelectItem value='pending'>pending</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='w-full'
              >
                <span className='flex items-center'>
                  Sort by: {sortField} {renderSortIndicator(sortField)}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleSort('name')}>
                Name{' '}
                {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('email')}>
                Email{' '}
                {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('role')}>
                Role{' '}
                {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className='overflow-hidden p-4'>
            <Table>
              <TableHeader className='bg-gray-100'>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Host Status</TableHead>
                  <TableHead>Handle Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-center py-8'
                    >
                      <div className='flex flex-col items-center justify-center'>
                        <UserX className='h-12 w-12 text-gray-400 mb-2' />
                        <p className='text-gray-500'>
                          No users found matching your criteria
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentUsers?.map((user) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className='border-b hover:bg-gray-50'
                    >
                      <TableCell className='font-medium'>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>

                      <TableCell>
                        <div>
                          {user.role === 'host' ? (
                            <Badge
                              variant={
                                user.hostStatus === 'pending'
                                  ? 'default'
                                  : user.hostStatus === 'approved'
                                  ? 'success'
                                  : user.hostStatus === 'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className='capitalize p-2'
                            >
                              {user.hostStatus}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {user.role === 'host' && (
                          <div>
                            {user.hostStatus === 'pending' && (
                              <>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  className='text-green-600 hover:bg-green-50'
                                  onClick={() => {
                                    setSelectedStatusUser(user);
                                    setNextStatus('approved');
                                    setIsStatusDialogOpen(true);
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  className='ms-2 text-red-600 hover:bg-red-50'
                                  onClick={() => {
                                    setSelectedStatusUser(user);
                                    setNextStatus('rejected');
                                    setIsStatusDialogOpen(true);
                                  }}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {user.hostStatus === 'approved' && (
                              <Button
                                variant='outline'
                                size='sm'
                                className='text-red-600 hover:bg-red-50'
                                onClick={() => {
                                  setSelectedStatusUser(user);
                                  setNextStatus('rejected');
                                  setIsStatusDialogOpen(true);
                                }}
                              >
                                Reject
                              </Button>
                            )}
                            {user.hostStatus === 'rejected' && (
                              <Button
                                variant='outline'
                                size='sm'
                                className='text-green-600 hover:bg-green-50'
                                onClick={() => {
                                  setSelectedStatusUser(user);
                                  setNextStatus('approved');
                                  setIsStatusDialogOpen(true);
                                }}
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className='flex'>
                          {user.role === 'host' && (
                            <div>
                              {user.hostStatus === 'pending' ? (
                                <>
                                  <Button
                                    variant='outline'
                                    size='icon'
                                    onClick={() => {
                                      setSelectedStatusUser(user);
                                      setNextStatus('rejected');
                                      setIsStatusDialogOpen(true);
                                    }}
                                    className={`text-orange-600 hover:bg-orange-50`}
                                  >
                                    <UserX className='h-4 w-4' />
                                  </Button>
                                  <Button
                                    variant='outline'
                                    size='icon'
                                    onClick={() => {
                                      setSelectedStatusUser(user);
                                      setNextStatus('approved');
                                      setIsStatusDialogOpen(true);
                                    }}
                                    className={`ms-2 text-green-600 hover:bg-green-50`}
                                  >
                                    <UserCheck className='h-4 w-4' />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant='outline'
                                    size='icon'
                                    onClick={() => {
                                      setSelectedStatusUser(user);
                                      setIsStatusDialogOpen(true);
                                    }}
                                    className={
                                      user.hostStatus === 'approved'
                                        ? 'text-orange-600 hover:bg-orange-50'
                                        : 'text-green-600 hover:bg-green-50'
                                    }
                                  >
                                    {user.hostStatus === 'approved' ? (
                                      <UserX className='h-4 w-4' />
                                    ) : (
                                      <UserCheck className='h-4 w-4' />
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          )}

                          {/* Button Delete */}
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => handleDelete(user)}
                            className='ml-2 text-red-600 hover:bg-red-50'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className='mt-8 flex justify-center'
          >
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const startPage = Math.max(
                    1,
                    Math.min(currentPage - 2, totalPages - 4)
                  );
                  return startPage + i;
                }).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </motion.div>
        )}
        {/* Stats */}
        <Stats users={users} />
      </motion.div>
      {/* ✅ Dialog لتأكيد تغيير حالة المضيف */}
      <StatusConfirmationDialog
        open={isStatusDialogOpen}
        user={selectedStatusUser}
        status={nextStatus}
        onCancel={() => setIsStatusDialogOpen(false)}
        onConfirm={(user) => {
          if (user) {
            handleToggleStatus(user, nextStatus);
          }
          setIsStatusDialogOpen(false);
        }}
      />
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
        user={selectedUser}
      />
    </div>
  );
};
export default AdminUsersPage;
