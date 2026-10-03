const classes = {
  reconstruction: 'tag tag-reconstruction',
  fiction: 'tag tag-fiction',
  source: 'tag tag-source',
  interpretation: 'tag tag-interpretation',
  unknown: 'tag tag-unknown',
}

/** A visible text label for the kind of material (never color alone). */
export function Tag({ kind, children, as: Element = 'span' }) {
  return <Element className={classes[kind] ?? 'tag'}>{children}</Element>
}

