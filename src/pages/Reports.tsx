
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import {
    format, subDays, startOfDay, endOfDay, isWithinInterval,
    startOfMonth, endOfMonth, subMonths, startOfToday, endOfToday,
    startOfYesterday, endOfYesterday
} from 'date-fns';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { Loader2, Download, Calendar as CalendarIcon, FileText, ChevronRight, TrendingUp, Users, Package, Wallet } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Reports() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    const setPreset = (preset: string) => {
        const today = new Date();
        switch (preset) {
            case 'today':
                setDateRange({ from: startOfToday(), to: endOfToday() });
                break;
            case 'yesterday':
                setDateRange({ from: startOfYesterday(), to: endOfYesterday() });
                break;
            case 'last7':
                setDateRange({ from: subDays(today, 7), to: today });
                break;
            case 'last30':
                setDateRange({ from: subDays(today, 30), to: today });
                break;
            case 'thisMonth':
                setDateRange({ from: startOfMonth(today), to: endOfMonth(today) });
                break;
            case 'lastMonth':
                const lastMonth = subMonths(today, 1);
                setDateRange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
                break;
            default:
                break;
        }
    };

    const { data: revenueData, isLoading: revenueLoading } = useQuery({
        queryKey: ['reports-revenue', dateRange],
        queryFn: async () => {
            if (!dateRange?.from) return [];

            const { data: jobs, error } = await supabase
                .from('jobs')
                .select('*')
                .gte('created_at', startOfDay(dateRange.from).toISOString())
                .lte('created_at', endOfDay(dateRange.to || new Date()).toISOString())
                .eq('payment_status', 'paid'); // Only count paid jobs for revenue

            if (error) throw error;
            return jobs;
        },
    });

    const { data: topCustomers, isLoading: customersLoading } = useQuery({
        queryKey: ['reports-customers', dateRange],
        queryFn: async () => {
            if (!dateRange?.from) return [];

            const { data, error } = await supabase
                .from('jobs')
                .select('*, bike:bikes(customer:customers(name, phone))')
                .gte('created_at', startOfDay(dateRange.from).toISOString())
                .lte('created_at', endOfDay(dateRange.to || new Date()).toISOString())
                .eq('payment_status', 'paid');

            if (error) throw error;

            // Aggregate revenue by customer
            const customerStats: Record<string, { name: string, phone: string, total: number, count: number }> = {};

            data.forEach(job => {
                // @ts-ignore - nested join inference is tricky
                const customerName = job.bike?.customer?.name || 'Unknown';
                // @ts-ignore
                const customerPhone = job.bike?.customer?.phone || '';
                const total = job.final_total || 0;

                if (!customerStats[customerName]) {
                    customerStats[customerName] = { name: customerName, phone: customerPhone, total: 0, count: 0 };
                }
                customerStats[customerName].total += total;
                customerStats[customerName].count += 1;
            });

            return Object.values(customerStats).sort((a, b) => b.total - a.total).slice(0, 10);
        },
    });

    const { data: partsStats, isLoading: partsLoading } = useQuery({
        queryKey: ['reports-parts', dateRange],
        queryFn: async () => {
            // Fetch job_parts joined with inventory_items if needed, or just aggregate raw text for now if migration isn't fully used yet
            // For now, let's try to fetch job_parts if the table exists and has data, otherwise fallback or show empty.
            // Since we JUST created the schema, it's likely empty. Let's safely try to fetch.

            const { data, error } = await supabase
                .from('job_parts')
                .select('*')
                .gte('created_at', startOfDay(dateRange!.from!).toISOString())
                .lte('created_at', endOfDay(dateRange!.to || new Date()).toISOString());

            if (error) {
                console.error('Error fetching parts stats:', error);
                return [];
            }

            // Aggregate
            const stats: Record<string, { name: string, quantity: number, value: number }> = {};
            data?.forEach(part => {
                if (!stats[part.item_name]) {
                    stats[part.item_name] = { name: part.item_name, quantity: 0, value: 0 };
                }
                stats[part.item_name].quantity += (part.quantity || 0);
                stats[part.item_name].value += (part.total_price || 0);
            });

            return Object.values(stats).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
        }
    });

    // Process data for Revenue Chart (Daily)
    const chartData = revenueData?.reduce((acc, job) => {
        const date = format(new Date(job.created_at), 'MMM dd');
        const existing = acc.find(item => item.date === date);
        if (existing) {
            existing.total += (job.final_total || 0);
        } else {
            acc.push({ date, total: job.final_total || 0 });
        }
        return acc;
    }, [] as { date: string, total: number }[])?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

    // Process data for Payment Method Pie Chart
    const paymentMethodData = revenueData?.reduce((acc, job) => {
        const method = job.payment_method || 'cash'; // Default to cash if null (for old data)
        const existing = acc.find(item => item.name === method);
        if (existing) {
            existing.value += (job.final_total || 0);
        } else {
            acc.push({ name: method, value: (job.final_total || 0) });
        }
        return acc;
    }, [] as { name: string, value: number }[]) || [];

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

    const handleExportCSV = (data: any[], filename: string) => {
        if (!data || data.length === 0) {
            toast.error('No data to export');
            return;
        }

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Exported to csv');
    };

    if (revenueLoading || customersLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-in p-2 md:p-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Reports & Analytics
                        </h1>
                        <p className="text-muted-foreground mt-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-success" />
                            Business performance overview for your garage.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Select onValueChange={setPreset}>
                            <SelectTrigger className="w-[150px] bg-background/50 backdrop-blur-sm border-muted/50">
                                <SelectValue placeholder="Quick Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="yesterday">Yesterday</SelectItem>
                                <SelectItem value="last7">Last 7 Days</SelectItem>
                                <SelectItem value="last30">Last 30 Days</SelectItem>
                                <SelectItem value="thisMonth">This Month</SelectItem>
                                <SelectItem value="lastMonth">Last Month</SelectItem>
                            </SelectContent>
                        </Select>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("justify-start text-left font-normal w-[280px] bg-background/50 backdrop-blur-sm border-muted/50", !dateRange && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                                {format(dateRange.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>

                        <Button variant="default" className="gradient-accent text-accent-foreground shadow-lg shadow-accent/20" onClick={() => handleExportCSV(chartData, 'revenue_report')}>
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                        </Button>
                    </div>
                </div>

                {/* Quick Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{chartData.reduce((sum, item) => sum + item.total, 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">For selected period</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-success/5 to-transparent border-success/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Paid Jobs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{revenueData?.length || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Completed transactions</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-accent/5 to-transparent border-accent/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Ticket Size</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₹{revenueData?.length ? Math.round(chartData.reduce((sum, item) => sum + item.total, 0) / revenueData.length).toLocaleString() : 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Revenue per job</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-warning/5 to-transparent border-warning/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Top Customer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold truncate">{topCustomers?.[0]?.name || 'N/A'}</div>
                            <p className="text-xs text-muted-foreground mt-1">Most valuable client</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                            <CardDescription>Daily revenue over the selected period.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                                    <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-primary" />
                                Payment Methods
                            </CardTitle>
                            <CardDescription>Breakdown by payment type.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentMethodData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {paymentMethodData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₹${value}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Tables Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Customers */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Customers</CardTitle>
                            <CardDescription>Highest spending customers in this period.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topCustomers?.length === 0 && <p className="text-muted-foreground text-sm">No recorded customer payments in this period.</p>}
                                {topCustomers?.map((customer, i) => (
                                    <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">{customer.name}</p>
                                            <p className="text-xs text-muted-foreground">{customer.count} visits</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary-dark">₹{customer.total.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Parts Usage */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Parts Usage Data</CardTitle>
                            <CardDescription>Most frequently used inventory items.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(!partsStats || partsStats.length === 0) && (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p>No specific parts data found.</p>
                                        <p className="text-xs">Ensure you are using the new Inventory system to track parts.</p>
                                    </div>
                                )}
                                {partsStats?.map((part, i) => (
                                    <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">{part.name}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-4">
                                            <span className="text-sm text-muted-foreground">x{part.quantity}</span>
                                            <span className="font-semibold text-sm">₹{part.value.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
