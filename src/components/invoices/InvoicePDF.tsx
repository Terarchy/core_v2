import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Create styles with basic fonts and explicit colors
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
    color: '#000000',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#000000',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    color: '#000000',
  },
  value: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  total: {
    marginTop: 20,
    borderTop: 1,
    borderTopColor: '#000000',
    paddingTop: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
})

interface InvoicePDFProps {
  invoice: {
    invoiceNumber: string
    amount: number
    currency: string
    issueDate: Date
    dueDate: Date
    description?: string
    supplier: {
      name: string
      companyName?: string
      email: string
    }
  }
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice Number:</Text>
            <Text style={styles.value}>{invoice.invoiceNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Issue Date:</Text>
            <Text style={styles.value}>
              {new Date(invoice.issueDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Due Date:</Text>
            <Text style={styles.value}>
              {new Date(invoice.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supplier Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Company Name:</Text>
            <Text style={styles.value}>
              {invoice.supplier.companyName || invoice.supplier.name}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{invoice.supplier.email}</Text>
          </View>
        </View>

        {invoice.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.value}>{invoice.description}</Text>
          </View>
        )}

        <View style={styles.total}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: invoice.currency,
              }).format(invoice.amount)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
