import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/invoices/InvoicePDF'
import { api } from '@/lib/api/trpc'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch invoice data
    const invoice = await api.buyer.getInvoice.useQuery({ id: params.id })

    if (!invoice.data) {
      return new NextResponse('Invoice not found', { status: 404 })
    }

    // Generate PDF
    const stream = await renderToStream(<InvoicePDF invoice={invoice.data} />)

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of stream) {
      chunks.push(chunk as Uint8Array)
    }
    const buffer = Buffer.concat(chunks)

    // Return PDF with correct headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.data?.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return new NextResponse('Failed to generate PDF', { status: 500 })
  }
}
