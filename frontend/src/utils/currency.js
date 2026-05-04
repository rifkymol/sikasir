// Format number to Rupiah display string: 15000 → "Rp 15.000"
export const formatRupiah = (value) => {
  if (value === null || value === undefined || value === '') return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

// Format raw digits for input display: "15000" → "15.000"
export const formatInputRupiah = (value) => {
  const digits = String(value).replace(/\D/g, '')
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Parse formatted input back to integer: "15.000" → 15000
export const parseRupiah = (value) => {
  const digits = String(value).replace(/\D/g, '')
  return digits ? parseInt(digits, 10) : 0
}
