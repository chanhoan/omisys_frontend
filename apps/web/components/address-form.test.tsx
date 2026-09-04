import '@testing-library/jest-dom/vitest'

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AddressCard, AddressForm } from './address-form'
import type { DaumPostcodeData, DaumPostcodeOptions } from './use-daum-postcode'

const widget = vi.hoisted(() => {
  const state: { options: DaumPostcodeOptions | null } = { options: null }
  const embed = vi.fn()
  class PostcodeMock {
    embed = embed
    open = vi.fn()
    constructor(options: DaumPostcodeOptions) { state.options = options }
  }
  return { PostcodeMock, embed, state }
})

const show = vi.fn()
const refresh = vi.fn()

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))
vi.mock('./toast', () => ({ useToast: () => ({ show }) }))
vi.mock('./use-daum-postcode', () => ({
  useDaumPostcode: () => ({ error: null, load: () => Promise.resolve(widget.PostcodeMock), ready: true }),
}))

const SAMPLE_DATA: DaumPostcodeData = {
  autoJibunAddress: '',
  autoRoadAddress: '',
  bname: '행당동',
  buildingName: '한양대',
  jibunAddress: '서울 성동구 행당동 1-1',
  roadAddress: '서울 성동구 왕십리로 222',
  sido: '서울',
  sigungu: '성동구',
  userSelectedType: 'R',
  zonecode: '01234',
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

function field(name: string): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>(`input[name="${name}"]`)
  if (!input) throw new Error(`input[name="${name}"] not found`)
  return input
}

async function selectAddress(data: DaumPostcodeData = SAMPLE_DATA) {
  fireEvent.click(screen.getByRole('button', { name: '주소 검색' }))
  await waitFor(() => expect(widget.embed).toHaveBeenCalled())
  await act(async () => { widget.state.options?.oncomplete(data) })
}

function fillContact() {
  fireEvent.change(field('alias'), { target: { value: '집' } })
  fireEvent.change(field('recipient'), { target: { value: '김철수' } })
  fireEvent.change(field('phoneNumber'), { target: { value: '010-1234-5678' } })
}

describe('AddressForm', () => {
  beforeEach(() => {
    show.mockClear()
    refresh.mockClear()
    widget.embed.mockClear()
    widget.state.options = null
    vi.stubGlobal('fetch', vi.fn(async () => response({ statusName: 'OK', message: null, data: null })))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders the search button and keeps the postcode and base address read-only', () => {
    render(<AddressForm />)

    expect(screen.getByRole('button', { name: '주소 검색' })).toBeInTheDocument()
    expect(field('zipcode')).toHaveAttribute('readonly')
    expect(field('addressBase')).toHaveAttribute('readonly')
    expect(field('addressDetail')).not.toHaveAttribute('readonly')
  })

  it('opens the postcode dialog when the search button is clicked', async () => {
    render(<AddressForm />)

    fireEvent.click(screen.getByRole('button', { name: '주소 검색' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await waitFor(() => expect(widget.embed).toHaveBeenCalled())
  })

  it('fills the road address with reference terms and closes the dialog on completion', async () => {
    render(<AddressForm />)

    await selectAddress()

    expect(field('zipcode')).toHaveValue('01234')
    expect(field('addressBase')).toHaveValue('서울 성동구 왕십리로 222 (행당동, 한양대)')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('uses the jibun address without reference terms when the user picks a lot number', async () => {
    render(<AddressForm />)

    await selectAddress({ ...SAMPLE_DATA, userSelectedType: 'J' })

    expect(field('addressBase')).toHaveValue('서울 성동구 행당동 1-1')
  })

  it('omits the parentheses when no reference terms are returned', async () => {
    render(<AddressForm />)

    await selectAddress({ ...SAMPLE_DATA, bname: '', buildingName: '' })

    expect(field('addressBase')).toHaveValue('서울 성동구 왕십리로 222')
  })

  it('posts the selected address and clears the form after a successful save', async () => {
    render(<AddressForm />)

    await selectAddress()
    fillContact()
    fireEvent.change(field('addressDetail'), { target: { value: '101동 202호' } })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    const [url, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/address')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toMatchObject({
      address: '서울 성동구 왕십리로 222 (행당동, 한양대)  101동 202호',
      alias: '집',
      phoneNumber: '010-1234-5678',
      recipient: '김철수',
      zipcode: '01234',
    })

    await waitFor(() => expect(field('zipcode')).toHaveValue(''))
    expect(field('addressBase')).toHaveValue('')
    expect(field('addressDetail')).toHaveValue('')
    expect(field('alias')).toHaveValue('')
  })

  it('shows the message the server returned when the save fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response({ message: '이미 등록된 배송지입니다.' }, 400)))
    render(<AddressForm />)

    await selectAddress()
    fillContact()
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('이미 등록된 배송지입니다.')
    expect(field('zipcode')).toHaveValue('01234')
  })

  it('falls back to a default message when the server sends none', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response({}, 500)))
    render(<AddressForm />)

    await selectAddress()
    fillContact()
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('배송지를 저장하지 못했습니다.')
  })

  it('falls back to a default message when the request itself throws', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject('offline')))
    render(<AddressForm />)

    await selectAddress()
    fillContact()
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('배송지를 저장하지 못했습니다.')
  })

  it('blocks the save and shows an error when no address was selected', async () => {
    render(<AddressForm />)

    fillContact()
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('주소 검색을 눌러 주소를 선택하세요.')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('splits a stored address into base and detail when editing', () => {
    render(<AddressForm address={{
      address: '서울 성동구 왕십리로 222  101동 202호',
      id: 7,
      isDefault: false,
      phoneNumber: '010-1234-5678',
      recipient: '김철수',
      zipcode: '01234',
    }} />)

    expect(field('addressBase')).toHaveValue('서울 성동구 왕십리로 222')
    expect(field('addressDetail')).toHaveValue('101동 202호')
    expect(field('zipcode')).toHaveValue('01234')
  })

  it('prefills the alias when editing and sends it back', async () => {
    render(<AddressForm address={{
      address: '서울 성동구 왕십리로 222  101동 202호',
      alias: '회사',
      id: 7,
      isDefault: false,
      phoneNumber: '010-1234-5678',
      recipient: '김철수',
      zipcode: '01234',
    }} />)

    expect(field('alias')).toHaveValue('회사')
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toMatchObject({ alias: '회사' })
  })

  // `required` 는 공백만 채운 값을 통과시키므로 제출 핸들러가 직접 막아야 한다.
  it('blocks the save when the alias is only whitespace', async () => {
    render(<AddressForm />)

    await selectAddress()
    fireEvent.change(field('alias'), { target: { value: '   ' } })
    fireEvent.change(field('recipient'), { target: { value: '김철수' } })
    fireEvent.change(field('phoneNumber'), { target: { value: '010-1234-5678' } })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('배송지 별칭을 입력하세요.')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('patches the existing address and keeps the values when editing', async () => {
    render(<AddressForm address={{
      address: '서울 성동구 왕십리로 222  101동 202호',
      id: 7,
      isDefault: false,
      phoneNumber: '010-1234-5678',
      recipient: '김철수',
      zipcode: '01234',
    }} />)

    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    const [url, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/address/7')
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(init.body as string)).toMatchObject({ alias: '김철수' })
    expect(field('addressBase')).toHaveValue('서울 성동구 왕십리로 222')
  })
})

const STORED = {
  address: '서울 성동구 왕십리로 222  101동 202호',
  id: 7,
  isDefault: false,
  phoneNumber: '010-1234-5678',
  recipient: '김철수',
  zipcode: '01234',
}

describe('AddressCard', () => {
  beforeEach(() => {
    show.mockClear()
    refresh.mockClear()
    vi.stubGlobal('fetch', vi.fn(async () => response({ statusName: 'OK', message: null, data: null })))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('shows the split address and the default-address actions', () => {
    render(<AddressCard address={STORED} />)

    expect(screen.getByText('(01234) 서울 성동구 왕십리로 222 101동 202호')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '기본으로' })).toBeInTheDocument()
  })

  it('hides the default-address action and shows the tag for the default address', () => {
    render(<AddressCard address={{ ...STORED, isDefault: true }} />)

    expect(screen.getByText('기본 배송지')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '기본으로' })).not.toBeInTheDocument()
  })

  it('promotes the address to the default one', async () => {
    render(<AddressCard address={STORED} />)

    fireEvent.click(screen.getByRole('button', { name: '기본으로' }))

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    const [url, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/address/7')
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(init.body as string)).toMatchObject({ address: STORED.address, alias: '김철수', isDefault: true })
    await waitFor(() => expect(show).toHaveBeenCalledWith('기본 배송지로 설정했습니다.'))
    expect(refresh).toHaveBeenCalled()
  })

  it('reports a failure when promoting the default address fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response({ message: 'nope' }, 500)))
    render(<AddressCard address={STORED} />)

    fireEvent.click(screen.getByRole('button', { name: '기본으로' }))

    await waitFor(() => expect(show).toHaveBeenCalledWith('기본 배송지를 변경하지 못했습니다.'))
  })

  it('swaps to the edit form and back on cancel', () => {
    render(<AddressCard address={STORED} />)

    fireEvent.click(screen.getByRole('button', { name: '수정' }))
    expect(screen.getByRole('heading', { name: '배송지 수정' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(screen.queryByRole('heading', { name: '배송지 수정' })).not.toBeInTheDocument()
  })

  it('deletes the address after the confirmation dialog is accepted', async () => {
    render(<AddressCard address={STORED} />)

    fireEvent.click(screen.getByRole('button', { name: '삭제' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: '삭제' })[1])

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    const [url, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/address/7')
    expect(init.method).toBe('DELETE')
    await waitFor(() => expect(show).toHaveBeenCalledWith('배송지를 삭제했습니다.'))
  })

  it('keeps the dialog open and reports the failure when deleting fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response({ message: 'nope' }, 500)))
    render(<AddressCard address={STORED} />)

    fireEvent.click(screen.getByRole('button', { name: '삭제' }))
    fireEvent.click(screen.getAllByRole('button', { name: '삭제' })[1])

    await waitFor(() => expect(show).toHaveBeenCalledWith('배송지를 삭제하지 못했습니다.'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('sends the stored alias when promoting an address that has one', async () => {
    render(<AddressCard address={{ ...STORED, alias: '회사' }} />)

    fireEvent.click(screen.getByRole('button', { name: '기본으로' }))

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toMatchObject({ alias: '회사' })
  })

  it('closes the confirmation dialog on cancel', () => {
    render(<AddressCard address={STORED} />)

    fireEvent.click(screen.getByRole('button', { name: '삭제' }))
    fireEvent.click(screen.getByRole('button', { name: '취소' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
