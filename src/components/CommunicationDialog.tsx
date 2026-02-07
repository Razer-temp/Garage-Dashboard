import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTemplates, useLogCommunication } from '@/hooks/useCommunication';
import { MessageSquare, Send, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { format } from 'date-fns';

interface CommunicationDialogProps {
    customer: {
        id: string;
        name: string;
        phone: string;
    };
    bike_model?: string;
    reg_number?: string;
    job_id?: string;
    invoice_amount?: number;
    invoice_number?: string;
    pending_amount?: number;
    due_date?: string;
    trigger?: React.ReactNode;
}

export function CommunicationDialog({
    customer,
    bike_model,
    reg_number,
    job_id,
    invoice_amount,
    invoice_number,
    pending_amount,
    due_date,
    trigger
}: CommunicationDialogProps) {
    const { user } = useAuth();
    const { data: templates, isLoading: templatesLoading } = useTemplates();
    const { data: settings } = useSettings();
    const logCommunication = useLogCommunication();

    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);

    // Replace placeholders with actual data
    const fillTemplate = (content: string) => {
        let filled = content;
        const replacements: Record<string, string> = {
            '{customer_name}': customer.name,
            '{bike_model}': bike_model || 'your vehicle',
            '{reg_number}': reg_number || '',
            '{invoice_amount}': invoice_amount?.toString() || '0',
            '{invoice_number}': invoice_number || '',
            '{pending_amount}': pending_amount?.toString() || '0',
            '{due_date}': due_date ? format(new Date(due_date), 'dd-MMM-yyyy') : '',
            '{garage_name}': settings?.name || 'our garage',
            '{garage_phone}': settings?.phone || '',
            '{garage_address}': settings?.address || '',
            '{feedback_link}': settings?.website || 'our website',
        };

        Object.entries(replacements).forEach(([key, value]) => {
            const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            filled = filled.replace(regex, value);
        });

        return filled;
    };

    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplate(templateId);
        if (templateId === 'manual') {
            const manualContent = `Hi {customer_name},\n\n[Write your message here]\n\nRegards,\nTeam {garage_name}`;
            setMessage(fillTemplate(manualContent));
        } else {
            const template = templates?.find(t => t.id === templateId);
            if (template) {
                setMessage(fillTemplate(template.content));
            }
        }
    };

    const handleSend = (method: 'whatsapp' | 'sms') => {
        if (!user) return;
        if (!message) {
            toast.error('Post a message first');
            return;
        }

        const template = templates?.find(t => t.id === selectedTemplate);

        logCommunication.mutate({
            user_id: user.id,
            customer_id: customer.id,
            job_id: job_id || null,
            template_name: template?.name || (selectedTemplate === 'manual' ? 'Manual Note' : 'Custom Message'),
            message_content: message,
            sent_via: method,
            status: 'sent',
        });

        if (method === 'whatsapp') {
            const phone = customer.phone.replace(/\D/g, '');
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
        } else {
            navigator.clipboard.writeText(message);
            toast.success('Message copied to clipboard for SMS');
        }

        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Send Update
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Send Communication</DialogTitle>
                    <DialogDescription>
                        Choose a template and send a message to {customer.name}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Select Template</label>
                        <Select onValueChange={handleTemplateChange} value={selectedTemplate}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a template..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="manual" className="font-semibold text-accent">
                                    + Manual Note / Custom Message
                                </SelectItem>
                                {templates?.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Message Preview</label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            className="resize-none italic"
                            placeholder="Select a template or type your message here..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button
                            className="gradient-accent text-accent-foreground"
                            onClick={() => handleSend('whatsapp')}
                            disabled={!message}
                        >
                            <Send className="w-4 h-4 mr-2" />
                            WhatsApp
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleSend('sms')}
                            disabled={!message}
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy for SMS
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
