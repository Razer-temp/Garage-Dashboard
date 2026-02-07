import { format } from 'date-fns';
import { JobPart, JobWithDetails, GarageSettings } from '@/types/database';

interface InvoicePrintProps {
    job: JobWithDetails;
    settings?: GarageSettings | null;
    parts?: JobPart[];
}

export function InvoicePrint({ job, settings, parts }: InvoicePrintProps) {
    const laborCost = job.labor_cost ?? 0;
    const partsCost = (job.final_total ?? 0) - laborCost - (job.gst_amount ?? 0);
    const total = job.final_total ?? 0;
    const subtotal = laborCost + Math.max(0, partsCost);

    // Dynamic garage details with professional defaults
    const garageName = settings?.name || 'MechanicPro Garage';
    const garageAddress = settings?.address || '123 Service Lane, Auto Hub, Pune, Maharashtra - 411001';

    // Only show these if explicitly provided in settings (no default fallbacks for these)
    const garageGstin = settings?.gstin;
    const garagePhone = settings?.phone || '+91 98765 43210';
    const garageEmail = settings?.email;
    const garageWebsite = settings?.website;

    return (
        <div className="bg-white text-black p-8 font-serif max-w-[800px] mx-auto min-h-[11in]">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-wider">{garageName}</h1>
                    <p className="text-sm">Two-Wheeler Service & Repair Specialists</p>
                    <p className="text-xs mt-1 max-w-[300px]">{garageAddress}</p>
                    {garageGstin && <p className="text-xs">GSTIN: {garageGstin}</p>}
                    <p className="text-xs italic mt-1">
                        Contact: {garagePhone}{garageEmail ? ` | ${garageEmail}` : ''}
                    </p>
                    {garageWebsite && <p className="text-xs italic">{garageWebsite}</p>}
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-800 uppercase">TAX INVOICE</h2>
                    <div className="mt-2 text-sm">
                        <p><strong>Invoice No:</strong> {job.invoice_number || 'DRAFT'}</p>
                        <p><strong>Work Order No:</strong> {job.id.slice(0, 8).toUpperCase()}</p>
                        <p><strong>Date:</strong> {format(new Date(), 'dd-MMM-yyyy')}</p>
                    </div>
                </div>
            </div>

            {/* Bill To & Vehicle Info */}
            <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                <div className="border border-gray-300 p-4 rounded">
                    <h3 className="font-bold border-b border-gray-300 pb-1 mb-2 uppercase text-xs text-gray-600">Bill To:</h3>
                    <p className="font-bold text-base">{job.bike?.customer?.name}</p>
                    <p>Phone: {job.bike?.customer?.phone}</p>
                    {job.bike?.customer?.address && <p className="mt-1">{job.bike?.customer?.address}</p>}
                </div>
                <div className="border border-gray-300 p-4 rounded">
                    <h3 className="font-bold border-b border-gray-300 pb-1 mb-2 uppercase text-xs text-gray-600">Vehicle Details:</h3>
                    <p><strong>Reg No:</strong> <span className="text-base font-bold">{job.bike?.registration_number}</span></p>
                    <p><strong>Model:</strong> {job.bike?.make_model} ({job.bike?.color})</p>
                    <p><strong>Date In:</strong> {format(new Date(job.date_in), 'dd-MMM-yyyy')}</p>
                    {job.date_out && <p><strong>Date Out:</strong> {format(new Date(job.date_out), 'dd-MMM-yyyy')}</p>}
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8 border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">Description</th>
                        <th className="border border-gray-300 p-2 text-right w-32">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-300 p-3 min-h-[100px] align-top">
                            <p className="font-bold mb-1">Labor / Service Charges</p>
                            <p className="text-xs text-gray-600 italic whitespace-pre-line">{job.problem_description}</p>
                        </td>
                        <td className="border border-gray-300 p-3 text-right align-top">
                            {laborCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 p-3 min-h-[100px] align-top">
                            <p className="font-bold mb-1">Parts & Consumables</p>
                            {parts && parts.length > 0 ? (
                                <div className="space-y-1">
                                    {parts.map((part, i) => (
                                        <div key={i} className="text-xs flex justify-between">
                                            <span>{part.item_name} (x{part.quantity})</span>
                                            <span>₹{((part.quantity || 0) * (part.unit_price || 0)).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-600 italic whitespace-pre-line">{job.parts_used || 'General items'}</p>
                            )}
                        </td>
                        <td className="border border-gray-300 p-3 text-right align-top">
                            {partsCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td className="border border-gray-300 p-2 text-right font-bold">Subtotal</td>
                        <td className="border border-gray-300 p-2 text-right">
                            {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                    </tr>
                    {job.gst_amount ? (
                        <tr>
                            <td className="border border-gray-300 p-2 text-right">GST ({job.gst_percent}%)</td>
                            <td className="border border-gray-300 p-2 text-right">
                                {job.gst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    ) : null}
                    {job.discount_amount ? (
                        <tr>
                            <td className="border border-gray-300 p-2 text-right text-red-600">Discount</td>
                            <td className="border border-gray-300 p-2 text-right text-red-600">
                                - {job.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    ) : null}
                    <tr className="bg-gray-100 text-lg font-bold">
                        <td className="border border-gray-300 p-2 text-right">Grand Total</td>
                        <td className="border border-gray-300 p-2 text-right">
                            ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                    </tr>
                </tfoot>
            </table>

            {/* Footer Info */}
            <div className="grid grid-cols-2 gap-8 text-xs">
                <div>
                    <h4 className="font-bold border-b border-gray-200 mb-2">Terms & Conditions:</h4>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Warranty on service is valid for 10 days or 200kms.</li>
                        <li>No warranty on electrical items and plastic parts.</li>
                        <li>Goods once sold will not be taken back.</li>
                        <li>Subject to local jurisdiction.</li>
                    </ul>
                </div>
                <div className="text-center pt-12">
                    <div className="border-t border-black w-48 mx-auto mb-1"></div>
                    <p className="font-bold">Authorized Signatory</p>
                    <p>{garageName}</p>
                </div>
            </div>

            <div className="mt-12 pt-6 border-t border-gray-100 text-center text-[10px] text-gray-500 italic">
                This is a computer-generated invoice. No physical signature is required.
            </div>
        </div>
    );
}
