// Content that is in the repo but not on the site. Both statuses behave the
// same way — visible in dev, absent from the build — and differ only in what
// they say about intent: a draft is on its way to being published, a reference
// is kept deliberately, to show how something is done.
//
// A leaf module because the schema, the server helpers and the browser's index
// all need this vocabulary and none of them should import each other for it.

export const STATUSES = ['draft', 'reference'] as const

export type Status = (typeof STATUSES)[number]

/** Shown wherever unpublished content appears, which is only ever in dev. */
export const STATUS_LABELS: Record<Status, string> = {
  draft: '✎ draft · dev only',
  reference: '✎ reference · dev only',
}
