import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import {
    useTemplates,
    useCreateTemplate,
    useUpdateTemplate,
    useDeleteTemplate
} from '@/hooks/useCommunication';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Store, MessageSquare, Plus, Pencil, Trash2, Copy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

const GOOGLE_REVIEW_TEMPLATE = `Hi {customer_name}, thank you for trusting {garage_name} with your {bike_model} today!

We hope everything is perfect now 😊

If you're happy with the service, it would really help our small local garage if you could leave a quick 5-star review on Google.
It takes just 20–30 seconds and means a lot to us!

Review link:
https://g.page/{your-google-business-name}/review

Thank you from the bottom of our hearts!
Ride safe & see you next time 🛵

{garage_name} Team
{garage_phone}`;

export default function Settings() {
    const { user } = useAuth();
    const { data: settings, isLoading: settingsLoading } = useSettings();
    const updateSettings = useUpdateSettings();

    const { data: templates, isLoading: templatesLoading } = useTemplates();
    const createTemplate = useCreateTemplate();
    const updateTemplate = useUpdateTemplate();
    const deleteTemplate = useDeleteTemplate();

    const [form, setForm] = useState({
        name: '',
        address: '',
        gstin: '',
        phone: '',
        email: '',
        website: '',
    });

    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [templateForm, setTemplateForm] = useState({
        name: '',
        content: '',
    });

    useEffect(() => {
        if (settings) {
            setForm({
                name: settings.name || '',
                address: settings.address || '',
                gstin: settings.gstin || '',
                phone: settings.phone || '',
                email: settings.email || '',
                website: settings.website || '',
            });
        }
    }, [settings]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings.mutate(form);
    };

    const handleTemplateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (editingTemplate) {
            updateTemplate.mutate({
                id: editingTemplate.id,
                name: templateForm.name,
                content: templateForm.content,
            }, {
                onSuccess: () => {
                    setEditingTemplate(null);
                    setTemplateForm({ name: '', content: '' });
                }
            });
        } else {
            createTemplate.mutate({
                user_id: user.id,
                name: templateForm.name,
                content: templateForm.content,
                category: 'custom',
                is_built_in: false,
            }, {
                onSuccess: () => {
                    setTemplateForm({ name: '', content: '' });
                }
            });
        }
    };

    const handleAddGoogleReview = () => {
        setTemplateForm({
            name: 'Google Review Request',
            content: GOOGLE_REVIEW_TEMPLATE
        });
        toast.info("Template loaded! Don't forget to update your Google Business link before saving.");
    };

    const editTemplate = (template: any) => {
        setEditingTemplate(template);
        setTemplateForm({
            name: template.name,
            content: template.content,
        });
    };

    if (settingsLoading || templatesLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground">Configure your garage profile and communication templates</p>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="profile">
                            <Store className="w-4 h-4 mr-2" />
                            Garage Profile
                        </TabsTrigger>
                        <TabsTrigger value="templates">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message Templates
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Garage Profile</CardTitle>
                                <CardDescription>
                                    These details will appear at the top of your generated invoices.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Garage Name</Label>
                                        <Input
                                            id="name"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="e.g., MechanicPro Garage"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Full Address</Label>
                                        <Textarea
                                            id="address"
                                            value={form.address}
                                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                                            placeholder="Street, City, State, ZIP"
                                            rows={3}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="gstin">GSTIN (Optional)</Label>
                                            <Input
                                                id="gstin"
                                                value={form.gstin}
                                                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                                                placeholder="27AAAAA0000A1Z5"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Contact Phone</Label>
                                            <Input
                                                id="phone"
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                placeholder="+91 98765 43210"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                placeholder="info@garage.com"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="website">Website (Optional)</Label>
                                            <Input
                                                id="website"
                                                value={form.website}
                                                onChange={(e) => setForm({ ...form, website: e.target.value })}
                                                placeholder="www.garage.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            className="w-full gradient-accent text-accent-foreground"
                                            disabled={updateSettings.isPending}
                                        >
                                            {updateSettings.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Save Profile
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="templates" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-accent" />
                                    Your Templates
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {templates?.map((template) => (
                                        <Card key={template.id} className={template.is_built_in ? 'bg-muted/30' : ''}>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="font-semibold">{template.name}</span>
                                                        {template.is_built_in && (
                                                            <span className="ml-2 text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                                                                Built-in
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="sm" onClick={() => editTemplate(template)}>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        {!template.is_built_in && (
                                                            <Button variant="ghost" size="sm" onClick={() => deleteTemplate.mutate(template.id)}>
                                                                <Trash2 className="w-4 h-4 text-destructive" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-3 italic">"{template.content}"</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Card className="sticky top-6">
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            {editingTemplate ? 'Edit Template' : 'New Template'}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Use placeholders like {'{customer_name}'}, {'{bike_model}'}, etc.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="w-full text-xs bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                                                onClick={handleAddGoogleReview}
                                            >
                                                <Plus className="w-3 h-3 mr-2" />
                                                Load Google Review Template
                                            </Button>
                                        </div>
                                        <form onSubmit={handleTemplateSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="t_name" className="text-xs">Template Name</Label>
                                                <Input
                                                    id="t_name"
                                                    value={templateForm.name}
                                                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                                                    placeholder="e.g., Quick Update"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="t_content" className="text-xs">Message Content</Label>
                                                <Textarea
                                                    id="t_content"
                                                    value={templateForm.content}
                                                    onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                                                    placeholder="Hi {customer_name}, your bike is..."
                                                    rows={6}
                                                    required
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                {editingTemplate && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => {
                                                            setEditingTemplate(null);
                                                            setTemplateForm({ name: '', content: '' });
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                                <Button
                                                    type="submit"
                                                    className="flex-1 gradient-accent text-accent-foreground"
                                                    disabled={createTemplate.isPending || updateTemplate.isPending}
                                                >
                                                    {(createTemplate.isPending || updateTemplate.isPending) && (
                                                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                                    )}
                                                    {editingTemplate ? 'Update' : 'Create'}
                                                </Button>
                                            </div>
                                        </form>

                                        <div className="mt-6 pt-6 border-t">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Available Placeholders</p>
                                            <div className="flex flex-wrap gap-1">
                                                {['{customer_name}', '{bike_model}', '{reg_number}', '{invoice_amount}', '{garage_name}', '{garage_phone}'].map(p => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setTemplateForm({ ...templateForm, content: templateForm.content + p })}
                                                        className="text-[9px] bg-muted px-1.5 py-0.5 rounded hover:bg-muted/80"
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
