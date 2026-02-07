import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Phone, MessageCircle, MapPin, MoreVertical, User } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { SearchBar } from '@/components/ui/search-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCustomers, useDeleteCustomer } from '@/hooks/useCustomers';
import { CommunicationDialog } from '@/components/CommunicationDialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: customers, isLoading } = useCustomers();
  const deleteCustomer = useDeleteCustomer();

  const filteredCustomers = customers?.filter((customer) => {
    const searchLower = search.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phone.includes(search) ||
      customer.whatsapp?.includes(search)
    );
  }) ?? [];

  const handleDelete = () => {
    if (deleteId) {
      deleteCustomer.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground">Manage your customer database</p>
          </div>
          <Button asChild className="gradient-accent text-accent-foreground">
            <Link to="/customers/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Link>
          </Button>
        </div>

        {/* Search */}
        <SearchBar
          placeholder="Search by name, phone, or WhatsApp..."
          value={search}
          onChange={setSearch}
        />

        {/* Customer List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Link to={`/customers/${customer.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate hover:text-accent transition-colors">
                          {customer.name}
                        </h3>
                      </div>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/customers/${customer.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/customers/${customer.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(customer.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 text-sm">
                    <a
                      href={`tel:${customer.phone}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {customer.phone}
                    </a>
                    {customer.whatsapp && (
                      <CommunicationDialog
                        customer={{
                          id: customer.id,
                          name: customer.name,
                          phone: customer.phone,
                        }}
                        trigger={
                          <button className="flex items-center gap-2 text-muted-foreground hover:text-success transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            {customer.whatsapp}
                          </button>
                        }
                      />
                    )}
                    {customer.address && (
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{customer.address}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="mb-2">
              {search ? 'No customers found matching your search' : 'No customers yet'}
            </p>
            {!search && (
              <Button asChild variant="link">
                <Link to="/customers/new">Add your first customer</Link>
              </Button>
            )}
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this customer and all their bikes and job history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
