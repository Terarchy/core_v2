import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/invoices/InvoicePDF'
import { PrismaClient } from '@prisma/client'
import React from 'react'

// Create a new PrismaClient instance for this route
const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

    // Fetch invoice data directly from the database
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            name: true,
            companyName: true,
            email: true,
          },
        },
      },
    })

    if (!invoice) {
      return new NextResponse('Invoice not found', { status: 404 })
    }

    // Format invoice data for the PDF component
    const formattedInvoice = {
      ...invoice,
      amount: Number(invoice.amount),
      issueDate: new Date(invoice.issueDate),
      dueDate: new Date(invoice.dueDate),
      description: invoice.description || undefined,
      supplier: {
        name: invoice.supplier.name || '',
        companyName: invoice.supplier.companyName || undefined,
        email: invoice.supplier.email || '',
      },
    }

    // Generate PDF
    const stream = await renderToStream(
      <InvoicePDF invoice={formattedInvoice} />
    )

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
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return new NextResponse('Failed to generate PDF', { status: 500 })
  }
}
