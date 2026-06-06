export interface PaymentLinkResult {
  status: 'success' | 'fail'
  orderId: number
  route: `/orders/${number}` | `/checkout/result?status=fail&orderId=${number}`
}

export function parsePaymentLink(value: string): PaymentLinkResult {
  const url = new URL(value)
  const isPaymentResult = url.protocol === 'omi:'
    && url.hostname === 'payments'
    && url.pathname === '/result'
  if (!isPaymentResult) throw new Error('지원하지 않는 결제 링크입니다.')

  const status = url.searchParams.get('status')
  if (status !== 'success' && status !== 'fail') {
    throw new Error('결제 상태가 올바르지 않습니다.')
  }

  const orderId = Number(url.searchParams.get('orderId'))
  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    throw new Error('주문 번호가 올바르지 않습니다.')
  }

  return {
    status,
    orderId,
    route: status === 'success'
      ? `/orders/${orderId}`
      : `/checkout/result?status=fail&orderId=${orderId}`,
  }
}
