// app/(admin)/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter
} from '@/components/ui/Card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/components/ui/select';
import {
    Search,
    User,
    Edit,
    Trash,
    Lock,
    LockOpen,
    Filter,
    ChevronDown,
    ChevronUp,
    Settings,
    Plus,
    UserPlus,
    Download,
    RefreshCw,
    Check,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// تعريف مخطط Zod لنموذج المستخدم
const userSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "يجب أن يكون الاسم مكون من حرفين على الأقل"),
    email: z.string().email("بريد إلكتروني غير صالح"),
    role: z.enum(['student', 'host', 'admin']),
    status: z.enum(['active', 'disabled']),
    joinDate: z.string()
});

type User = z.infer<typeof userSchema>;

const AdminSettingsPage = () => {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<keyof User>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isBulkEditing, setIsBulkEditing] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [systemSettings, setSystemSettings] = useState({
        emailNotifications: true,
        darkMode: false,
        autoSave: true
    });

    // تهيئة react-hook-form
    const form = useForm<User>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            id: '',
            name: '',
            email: '',
            role: 'student',
            status: 'active',
            joinDate: ''
        }
    });

    // جلب بيانات المستخدمين (محاكاة)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                // محاكاة جلب البيانات من API
                const mockUsers: User[] = [
                    { id: '1', name: 'علي أحمد', email: 'ali.ahmed@university.edu', role: 'student', status: 'active', joinDate: '2023-01-15' },
                    { id: '2', name: 'سارة محمد', email: 'sara.mohammed@university.edu', role: 'student', status: 'active', joinDate: '2023-02-20' },
                    { id: '3', name: 'محمد خالد', email: 'mohammed.khaled@university.edu', role: 'host', status: 'active', joinDate: '2022-11-05' },
                    { id: '4', name: 'فاطمة حسن', email: 'fatima.hassan@university.edu', role: 'host', status: 'disabled', joinDate: '2022-09-12' },
                    { id: '5', name: 'أحمد علي', email: 'ahmed.ali@university.edu', role: 'admin', status: 'active', joinDate: '2021-08-30' },
                    { id: '6', name: 'نورا سعيد', email: 'nora.saeed@university.edu', role: 'host', status: 'active', joinDate: '2023-03-18' },
                    { id: '7', name: 'يوسف كمال', email: 'youssef.kamal@university.edu', role: 'student', status: 'disabled', joinDate: '2023-04-22' },
                    { id: '8', name: 'ليلى عبدالله', email: 'layla.abdullah@university.edu', role: 'host', status: 'active', joinDate: '2022-12-10' },
                ];

                // إضافة تأخير لمحاكاة جلب البيانات
                await new Promise(resolve => setTimeout(resolve, 800));

                setUsers(mockUsers);
                setFilteredUsers(mockUsers);
            } catch (error) {
                toast({
                    title: "خطأ في جلب البيانات",
                    description: "حدث خطأ أثناء محاولة جلب بيانات المستخدمين",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // تطبيق الفلاتر والبحث
    useEffect(() => {
        let result = [...users];

        // تطبيق بحث البريد الإلكتروني
        if (searchTerm) {
            result = result.filter(user =>
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // تطبيق فلتر الدور
        if (roleFilter !== 'all') {
            result = result.filter(user => user.role === roleFilter);
        }

        // تطبيق فلتر الحالة
        if (statusFilter !== 'all') {
            result = result.filter(user => user.status === statusFilter);
        }

        // تطبيق الترتيب
        result.sort((a, b) => {
            if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
            if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredUsers(result);
    }, [users, searchTerm, roleFilter, statusFilter, sortField, sortDirection]);

    // معالجة تغيير الترتيب
    const handleSort = (field: keyof User) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // فتح نموذج التعديل
    const handleEdit = (user: User) => {
        form.reset(user);
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    // إغلاق نموذج التعديل
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingUser(null);
        form.reset();
    };

    // معالجة تحديث المستخدم
    const handleUpdateUser = async (data: User) => {
        try {
            // محاكاة تحديث المستخدم في الخادم
            await new Promise(resolve => setTimeout(resolve, 500));

            setUsers(prevUsers =>
                prevUsers.map(user => user.id === data.id ? data : user)
            );

            toast({
                title: "تم التحديث بنجاح",
                description: "تم تحديث بيانات المستخدم بنجاح",
                className: "bg-green-600 text-white border-0",
            });

            handleCloseEditModal();
        } catch (error) {
            toast({
                title: "خطأ في التحديث",
                description: "حدث خطأ أثناء محاولة تحديث بيانات المستخدم",
                variant: "destructive"
            });
        }
    };

    // فتح نموذج الحذف
    const handleDelete = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    // معالجة حذف المستخدم
    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            // محاكاة حذف المستخدم في الخادم
            await new Promise(resolve => setTimeout(resolve, 500));

            setUsers(prevUsers =>
                prevUsers.filter(user => user.id !== userToDelete.id)
            );

            toast({
                title: "تم الحذف بنجاح",
                description: "تم حذف المستخدم بنجاح",
                className: "bg-green-600 text-white border-0",
            });

            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        } catch (error) {
            toast({
                title: "خطأ في الحذف",
                description: "حدث خطأ أثناء محاولة حذف المستخدم",
                variant: "destructive"
            });
        }
    };

    // تبديل حالة المستخدم
    const handleToggleStatus = async (user: User) => {
        try {
            const newStatus = user.status === 'active' ? 'disabled' : 'active';

            // محاكاة تحديث حالة المستخدم في الخادم
            await new Promise(resolve => setTimeout(resolve, 300));

            setUsers(prevUsers =>
                prevUsers.map(u =>
                    u.id === user.id ? { ...u, status: newStatus } : u
                )
            );

            toast({
                title: `تم ${newStatus === 'active' ? 'تفعيل' : 'تعطيل'} الحساب`,
                description: `تم تغيير حالة المستخدم بنجاح`,
                className: "bg-green-600 text-white border-0",
            });
        } catch (error) {
            toast({
                title: "خطأ في التحديث",
                description: "حدث خطأ أثناء محاولة تغيير حالة المستخدم",
                variant: "destructive"
            });
        }
    };

    // عرض أيقونة الترتيب
    const renderSortIcon = (field: keyof User) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    };

    // عرض شارة الدور
    const renderRoleBadge = (role: User['role']) => {
        const roleConfig = {
            student: { label: 'طالب', color: 'bg-blue-100 text-blue-800' },
            host: { label: 'مضيف', color: 'bg-purple-100 text-purple-800' },
            admin: { label: 'مشرف', color: 'bg-amber-100 text-amber-800' }
        };

        return (
            <Badge className={cn("px-3 py-1 rounded-full", roleConfig[role].color)}>
                {roleConfig[role].label}
            </Badge>
        );
    };

    // عرض شارة الحالة
    const renderStatusBadge = (status: User['status']) => {
        return status === 'active' ? (
            <Badge className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                نشط
            </Badge>
        ) : (
            <Badge className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                معطل
            </Badge>
        );
    };

    // توليد الأحرف الأولى من الاسم
    const getInitials = (name: string) => {
        const names = name.split(' ');
        return names.map(n => n[0]).join('');
    };

    // تبديل إعدادات النظام
    const handleSystemSettingChange = (setting: keyof typeof systemSettings) => {
        setSystemSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));

        toast({
            title: "تم تحديث الإعدادات",
            description: `تم ${systemSettings[setting] ? "تعطيل" : "تفعيل"} ${setting === 'emailNotifications' ? "الإشعارات" : setting === 'darkMode' ? "الوضع الليلي" : "الحفظ التلقائي"}`,
            className: "bg-blue-600 text-white border-0",
        });
    };

    // التبديل بين تحرير المجموعة
    const toggleBulkEditing = () => {
        setIsBulkEditing(!isBulkEditing);
        setSelectedUsers([]);
    };

    // تحديد/إلغاء تحديد مستخدم
    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    // تحديد/إلغاء تحديد الكل
    const toggleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(user => user.id));
        }
    };

    // تطبيق الحالة على المستخدمين المحددين
    const applyStatusToSelected = (status: 'active' | 'disabled') => {
        setUsers(prevUsers =>
            prevUsers.map(user =>
                selectedUsers.includes(user.id)
                    ? { ...user, status }
                    : user
            )
        );

        toast({
            title: "تم تحديث المستخدمين",
            description: `تم تغيير حالة ${selectedUsers.length} مستخدمين`,
            className: "bg-green-600 text-white border-0",
        });

        setSelectedUsers([]);
        setIsBulkEditing(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* العنوان والإحصاءات */}
                    <motion.div
                        className="lg:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-3">
                                    <Settings className="text-white" size={28} />
                                    لوحة تحكم المشرفين
                                </h1>
                                <p className="mt-2 opacity-90">إدارة المستخدمين والإعدادات النظامية</p>
                            </div>
                            <Avatar className="border-2 border-white">
                                <AvatarFallback className="bg-indigo-700">SA</AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-8">
                            <div className="bg-white/10 p-4 rounded-lg">
                                <p className="text-sm opacity-80">المستخدمون</p>
                                <p className="text-2xl font-bold mt-1">{users.length}</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-lg">
                                <p className="text-sm opacity-80">النشطون</p>
                                <p className="text-2xl font-bold mt-1">{users.filter(u => u.status === 'active').length}</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-lg">
                                <p className="text-sm opacity-80">المشرفون</p>
                                <p className="text-2xl font-bold mt-1">{users.filter(u => u.role === 'admin').length}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* إعدادات النظام */}
                    <motion.div
                        className="bg-white rounded-2xl shadow-xl p-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Settings size={20} className="text-indigo-600" />
                            إعدادات النظام
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="font-medium text-gray-700">الإشعارات البريدية</Label>
                                    <p className="text-sm text-gray-500">إرسال إشعارات عبر البريد الإلكتروني</p>
                                </div>
                                <Switch
                                    checked={systemSettings.emailNotifications}
                                    onCheckedChange={() => handleSystemSettingChange('emailNotifications')}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="font-medium text-gray-700">الوضع الليلي</Label>
                                    <p className="text-sm text-gray-500">تفعيل الوضع المظلم للنظام</p>
                                </div>
                                <Switch
                                    checked={systemSettings.darkMode}
                                    onCheckedChange={() => handleSystemSettingChange('darkMode')}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="font-medium text-gray-700">الحفظ التلقائي</Label>
                                    <p className="text-sm text-gray-500">حفظ التغييرات تلقائياً</p>
                                </div>
                                <Switch
                                    checked={systemSettings.autoSave}
                                    onCheckedChange={() => handleSystemSettingChange('autoSave')}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* بطاقة إدارة المستخدمين */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <CardHeader className="border-b border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <User className="text-indigo-600" size={24} />
                                إدارة المستخدمين
                            </CardTitle>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={isBulkEditing ? "destructive" : "outline"}
                                    onClick={toggleBulkEditing}
                                    className="flex items-center gap-2"
                                >
                                    {isBulkEditing ? <X size={18} /> : <Edit size={18} />}
                                    {isBulkEditing ? "إلغاء التحرير" : "تحرير المجموعة"}
                                </Button>

                                <Button variant="outline" className="flex items-center gap-2">
                                    <Download size={18} />
                                    تصدير البيانات
                                </Button>

                                <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                                    <UserPlus size={18} />
                                    إضافة مستخدم
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* أدوات البحث والتصفية */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-gray-200">
                            <div className="relative md:col-span-2">
                                <Input
                                    placeholder="ابحث بالمستخدم..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            </div>

                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="جميع الأدوار" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع الأدوار</SelectItem>
                                    <SelectItem value="student">طلاب</SelectItem>
                                    <SelectItem value="host">مضيفون</SelectItem>
                                    <SelectItem value="admin">مشرفون</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="جميع الحالات" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع الحالات</SelectItem>
                                    <SelectItem value="active">نشط</SelectItem>
                                    <SelectItem value="disabled">معطل</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* جدول المستخدمين */}
                        <div className="overflow-x-auto">
                            <Table className="min-w-full">
                                <TableHeader className="bg-indigo-50">
                                    <TableRow>
                                        <TableHead>
                                            {isBulkEditing && (
                                                <button
                                                    onClick={toggleSelectAll}
                                                    className="flex items-center justify-center w-6 h-6 rounded border border-gray-300"
                                                >
                                                    {selectedUsers.length === filteredUsers.length && (
                                                        <Check size={16} className="text-indigo-600" />
                                                    )}
                                                </button>
                                            )}
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer py-4"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center gap-1">
                                                المستخدم
                                                {renderSortIcon('name')}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer"
                                            onClick={() => handleSort('role')}
                                        >
                                            <div className="flex items-center gap-1">
                                                الدور
                                                {renderSortIcon('role')}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer"
                                            onClick={() => handleSort('status')}
                                        >
                                            <div className="flex items-center gap-1">
                                                الحالة
                                                {renderSortIcon('status')}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer"
                                            onClick={() => handleSort('joinDate')}
                                        >
                                            <div className="flex items-center gap-1">
                                                تاريخ الانضمام
                                                {renderSortIcon('joinDate')}
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center">الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-12 text-center">
                                                <div className="flex justify-center">
                                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
                                                </div>
                                                <p className="mt-4 text-gray-600">جاري تحميل بيانات المستخدمين...</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <User className="text-gray-400 mb-4" size={48} />
                                                    <p className="text-gray-600 text-xl">لا يوجد مستخدمون</p>
                                                    <p className="text-gray-500 mt-2">قم بتعديل فلترات البحث لمشاهدة المزيد</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <motion.tr
                                                key={user.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <TableCell>
                                                    {isBulkEditing && (
                                                        <button
                                                            onClick={() => toggleUserSelection(user.id)}
                                                            className="flex items-center justify-center w-6 h-6 rounded border border-gray-300"
                                                        >
                                                            {selectedUsers.includes(user.id) && (
                                                                <Check size={16} className="text-indigo-600" />
                                                            )}
                                                        </button>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarFallback className="bg-indigo-100 text-indigo-800">
                                                                {getInitials(user.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{user.name}</div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{renderRoleBadge(user.role)}</TableCell>
                                                <TableCell>{renderStatusBadge(user.status)}</TableCell>
                                                <TableCell className="text-gray-600">{user.joinDate}</TableCell>
                                                <TableCell>
                                                    <div className="flex justify-center gap-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="text-indigo-600 hover:bg-indigo-50"
                                                                        onClick={() => handleEdit(user)}
                                                                    >
                                                                        <Edit size={18} />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>تعديل المستخدم</p>
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className={user.status === 'active'
                                                                            ? "text-yellow-600 hover:bg-yellow-50"
                                                                            : "text-green-600 hover:bg-green-50"
                                                                        }
                                                                        onClick={() => handleToggleStatus(user)}
                                                                    >
                                                                        {user.status === 'active'
                                                                            ? <Lock size={18} />
                                                                            : <LockOpen size={18} />
                                                                        }
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{user.status === 'active' ? 'تعطيل' : 'تفعيل'} المستخدم</p>
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="text-red-600 hover:bg-red-50"
                                                                        onClick={() => handleDelete(user)}
                                                                    >
                                                                        <Trash size={18} />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>حذف المستخدم</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>

                    {/* تذييل البطاقة */}
                    <CardFooter className="p-4 bg-gray-50 flex flex-col md:flex-row items-center justify-between">
                        <p className="text-gray-600 mb-2 md:mb-0">
                            عرض {filteredUsers.length} من أصل {users.length} مستخدم
                        </p>

                        {isBulkEditing && selectedUsers.length > 0 && (
                            <div className="flex gap-2 mb-3 md:mb-0">
                                <Button
                                    variant="outline"
                                    className="border-green-500 text-green-600 hover:bg-green-50"
                                    onClick={() => applyStatusToSelected('active')}
                                >
                                    تفعيل المحددين
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-gray-500 text-gray-600 hover:bg-gray-50"
                                    onClick={() => applyStatusToSelected('disabled')}
                                >
                                    تعطيل المحددين
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        toast({
                                            title: "حذف المجموعة",
                                            description: `سيتم حذف ${selectedUsers.length} مستخدمين`,
                                            className: "bg-red-600 text-white",
                                        });
                                    }}
                                >
                                    حذف المحددين
                                </Button>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button variant="outline" disabled={true}>
                                السابق
                            </Button>
                            <Button variant="outline" className="bg-indigo-100 border-indigo-300">
                                1
                            </Button>
                            <Button variant="outline">
                                2
                            </Button>
                            <Button variant="outline">
                                التالي
                            </Button>
                        </div>
                    </CardFooter>
                </motion.div>
            </motion.div>

            {/* نماذج التحرير والحذف (كما في الكود السابق) */}
            {/* ... */}
        </div>
    );
};

export default AdminSettingsPage;