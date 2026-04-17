const getFormDataFilename = (value: File): string => value.webkitRelativePath || value.name

const normalizeFormDataBody = (body: BodyInit | null | undefined): BodyInit | null | undefined => {
  if (!(body instanceof FormData)) return body

  const normalized = new FormData()
  for (const [key, value] of body.entries()) {
    if (typeof value === 'string') {
      normalized.append(key, value)
      continue
    }

    normalized.append(key, value, getFormDataFilename(value))
  }

  return normalized
}

export const fetchApi = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const normalizedBody = normalizeFormDataBody(options?.body)
  const res = await fetch(url, { ...options, body: normalizedBody })
  if (!res.ok) {
    throw await res.json().catch(() => ({ status: res.status, message: res.statusText }))
  }
  if ([204, 205, 304].includes(res.status)) {
    return undefined as T
  }
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('json')) {
    return (await res.blob()) as T
  }
  return res.json()
}
