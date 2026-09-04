import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { Banner } from './banner'
import { ConfirmDialog } from './confirm-dialog'
import { FormErrorBox } from './form-error-box'
import { GateCard } from './gate-card'
import { Sentences } from './sentences'
import { StateBlock } from './state-block'

afterEach(cleanup)

describe('shared state components', () => {
  it('renders a state block with its action', () => {
    render(<StateBlock action={<a href="/shop">스토어 보기</a>} description="다시 시도해주세요." title="제품이 없습니다" />)

    expect(screen.getByRole('heading', { name: '제품이 없습니다' })).toBeVisible()
    expect(screen.getByRole('link', { name: '스토어 보기' })).toHaveAttribute('href', '/shop')
  })

  it('renders a gate card and each banner tone', () => {
    const { rerender } = render(<GateCard description="로그인이 필요합니다" title="회원 전용" />)
    expect(screen.getByRole('heading', { name: '회원 전용' })).toBeVisible()

    for (const tone of ['info', 'warn', 'error'] as const) {
      rerender(<Banner tone={tone}>안내</Banner>)
      expect(screen.getByRole('status')).toHaveClass(`is-${tone}`)
    }
  })

  it('announces form errors', () => {
    render(<FormErrorBox>입력 내용을 확인해주세요.</FormErrorBox>)

    expect(screen.getByRole('alert')).toHaveTextContent('입력 내용을 확인해주세요.')
  })

  it('keeps every sentence in its own span', () => {
    render(<Sentences sentences={['첫 번째 문장입니다.', '두 번째 문장입니다.']} />)

    expect(screen.getAllByText(/문장입니다/)).toHaveLength(2)
    expect(screen.getAllByText(/문장입니다/)[0]).toHaveClass('s')
  })
})

describe('ConfirmDialog', () => {
  function renderDialog(props: Partial<React.ComponentProps<typeof ConfirmDialog>> = {}) {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    render(
      <>
        <button type="button">시작점</button>
        <ConfirmDialog
          cancelLabel="취소"
          confirmLabel="삭제"
          description="삭제한 내용은 되돌릴 수 없습니다."
          onCancel={onCancel}
          onConfirm={onConfirm}
          open
          title="리뷰를 삭제할까요?"
          {...props}
        />
      </>,
    )
    return { onCancel, onConfirm }
  }

  it('focuses the safe action, handles escape, and restores focus', () => {
    const { onCancel } = renderDialog()
    const cancelButton = screen.getByRole('button', { name: '취소' })
    expect(cancelButton).toHaveFocus()

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('keeps Tab and Shift+Tab focus within the dialog actions', () => {
    renderDialog()
    const cancelButton = screen.getByRole('button', { name: '취소' })
    const confirmButton = screen.getByRole('button', { name: '삭제' })

    confirmButton.focus()
    fireEvent.keyDown(confirmButton, { key: 'Tab' })
    expect(cancelButton).toHaveFocus()

    fireEvent.keyDown(cancelButton, { key: 'Tab', shiftKey: true })
    expect(confirmButton).toHaveFocus()
  })

  it('locks both dismissal and confirmation while pending', () => {
    const { onCancel, onConfirm } = renderDialog({ pending: true })
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    fireEvent.click(screen.getByRole('button', { name: '삭제' }))
    fireEvent.click(screen.getByRole('button', { name: '취소' }))

    expect(onCancel).not.toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: '삭제' })).toBeDisabled()
  })

  it('calls confirmation once and applies the destructive class', () => {
    const { onConfirm } = renderDialog({ destructive: true })
    fireEvent.click(screen.getByRole('button', { name: '삭제' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: '삭제' })).toHaveClass('danger')
  })
})
