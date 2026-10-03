import { useRef, useState } from 'react'
import { experience } from '../content/experience.js'
import { contextLabels } from '../content/encounters.js'
import { sources } from '../content/sources.js'
import { assetUrl } from '../lib/assetUrl.js'
import { ImageDialog } from './ImageDialog.jsx'
import { Tag } from './Tag.jsx'

function contextTag(context) {
  if (context.kind === 'source') return <Tag kind={'source'}>{contextLabels.source} · {sources[context.sourceId].work}</Tag>
  return <Tag kind={context.kind}>{contextLabels[context.kind]}</Tag>
}

function DetailPanel({ encounter, hotspot, lens }) {
  if (!hotspot) {
    return (
      <div className={'detail-panel is-empty'}>
        <p>Select a numbered detail on the picture or in the list to read about it.</p>
      </div>
    )
  }
  const number = encounter.hotspots.indexOf(hotspot) + 1
  return (
    <div className={'detail-panel'}>
      <h3 className={'detail-title'}>
        <span className={'detail-number'} aria-hidden={'true'}>{number}</span> {hotspot.label}
      </h3>
      {lens === 'picture' ? (
        <>
          <div className={'detail-part'}>
            <p className={'detail-label'}>In the picture</p>
            <p>{hotspot.see}</p>
          </div>
          <div className={'detail-part'}>
            <p className={'detail-label'}>From the sources {contextTag(hotspot.context)}</p>
            <p>{hotspot.context.text}</p>
          </div>
        </>
      ) : (
        <div className={'detail-part'}>
          <p className={'detail-label'}>
            {experience.lenses[lens].label} <Tag kind={'fiction'}>{experience.labels.fictionalPerspective}</Tag>
          </p>
          <p className={'voice'}>{hotspot.voices[lens]}</p>
        </div>
      )}
      <div className={'detail-part'}>
        <p className={'detail-label'}>What the picture can’t tell us</p>
        <p>{hotspot.limit}</p>
      </div>
      {lens !== 'picture' ? <p className={'detail-hint'}>Switch to “Picture notes” to see the source behind this detail.</p> : null}
    </div>
  )
}

function FrameQuestion({ entry, opened, onOpen }) {
  const [open, setOpen] = useState(false)
  const answerId = `frame-${entry.id}`
  return (
    <div className={`frame-question frame-${entry.position}`}>
      <button
        type={'button'}
        aria-expanded={open}
        aria-controls={answerId}
        onClick={() => {
          setOpen(!open)
          if (!open) onOpen(entry.id)
        }}
      >
        {entry.question}
        {opened && !open ? <span className={'visually-hidden'}> (opened before)</span> : null}
      </button>
      <div className={'frame-answer'} id={answerId} hidden={!open}>
        {entry.kind === 'source' ? (
          <Tag kind={'source'}>{contextLabels.source} · {sources[entry.sourceId].work}</Tag>
        ) : (
          <Tag kind={entry.kind}>{contextLabels[entry.kind]}</Tag>
        )}
        <p>{entry.answer}</p>
      </div>
    </div>
  )
}

/**
 * The picture with numbered hotspots, the lens switcher, the detail panel,
 * and the outside-the-frame view. Works without the image (descriptions only
 * or a failed load): the details list is always present and is the
 * screen-reader path.
 */
export function HotspotImage({ encounter, entry, descriptionsOnly, hideMarkers, onOpenHotspot, onOpenFrame, onToggleMarkers }) {
  const { image } = encounter
  const [lens, setLens] = useState('picture')
  const [activeId, setActiveId] = useState(null)
  const [outside, setOutside] = useState(false)
  const [failed, setFailed] = useState(false)
  const [enlarged, setEnlarged] = useState(false)
  const enlargeRef = useRef(null)

  const active = encounter.hotspots.find((spot) => spot.id === activeId) ?? null
  const showImage = !descriptionsOnly && !failed
  const openSpot = (spotId) => {
    setActiveId(spotId)
    onOpenHotspot(spotId)
  }
  const explored = (spotId) => entry.hotspotsOpened.includes(spotId)

  const picture = showImage ? (
    <div className={'pic'}>
      <img
        src={assetUrl(image.displayPath)}
        srcSet={image.srcSet.map((variant) => `${assetUrl(variant.path)} ${variant.width}w`).join(', ')}
        sizes={'(min-width: 72rem) 44rem, (min-width: 60rem) 60vw, calc(100vw - 2rem)'}
        width={image.width}
        height={image.height}
        alt={image.alt}
        decoding={'async'}
        onError={() => setFailed(true)}
      />
      <Tag kind={'reconstruction'}>{experience.labels.reconstruction}</Tag>
      {hideMarkers ? null : encounter.hotspots.map((spot, index) => (
        <button
          key={spot.id}
          type={'button'}
          className={explored(spot.id) ? 'marker is-explored' : 'marker'}
          style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          aria-pressed={activeId === spot.id}
          aria-label={`Detail ${index + 1}: ${spot.label}${explored(spot.id) ? ' (explored)' : ''}`}
          onClick={() => openSpot(spot.id)}
        >
          {index + 1}
        </button>
      ))}
    </div>
  ) : null

  const frameQuestions = (position) =>
    encounter.outsideFrame
      .filter((item) => item.position === position)
      .map((item) => (
        <FrameQuestion key={item.id} entry={item} opened={entry.outsideOpened.includes(item.id)} onOpen={(frameId) => onOpenFrame(frameId)} />
      ))

  return (
    <div className={'explorer'}>
      <div className={'lens-bar'} role={'group'} aria-labelledby={`${encounter.id}-lens-label`}>
        <span className={'lens-label'} id={`${encounter.id}-lens-label`}>See the details as:</span>
        {experience.lensOrder.map((lensId) => (
          <button key={lensId} type={'button'} aria-pressed={lens === lensId} onClick={() => setLens(lensId)}>
            {experience.lenses[lensId].label}
          </button>
        ))}
      </div>
      <p className={'lens-note'}>{experience.lenses[lens].note}</p>

      <div className={outside ? 'look is-wide' : 'look'}>
        <div className={'look-picture'}>
          {showImage ? (
            <div className={outside ? 'frame is-open' : 'frame'} id={`${encounter.id}-frame`}>
              {outside ? <div className={'frame-slot slot-top'}>{frameQuestions('top')}</div> : null}
              {outside ? <div className={'frame-slot slot-left'}>{frameQuestions('left')}</div> : null}
              <div className={'frame-slot slot-pic'}>{picture}</div>
              {outside ? <div className={'frame-slot slot-right'}>{frameQuestions('right')}</div> : null}
              {outside ? <div className={'frame-slot slot-bottom'}>{frameQuestions('bottom')}</div> : null}
            </div>
          ) : (
            <div className={'image-description-card'} id={`${encounter.id}-description`} tabIndex={-1}>
              <Tag kind={'reconstruction'}>{experience.labels.reconstruction}</Tag>
              {failed ? <p className={'image-failed'}>The image could not load. Here is its description; everything else on this page works without it.</p> : null}
              <h3 className={'small-heading'}>Image description</h3>
              <p>{image.alt}</p>
              <p>{image.description}</p>
            </div>
          )}

          <div className={'button-row'}>
            {showImage ? (
              <button
                type={'button'}
                aria-expanded={outside}
                aria-controls={`${encounter.id}-frame`}
                onClick={() => {
                  setOutside(!outside)
                  if (!outside) setTimeout(() => document.querySelector(`#${encounter.id}-frame .frame-question button`)?.focus(), 0)
                }}
              >
                {outside ? 'Back to the picture' : 'What’s outside this picture?'}
              </button>
            ) : null}
            {showImage ? (
              <button type={'button'} aria-pressed={hideMarkers} onClick={onToggleMarkers}>
                {hideMarkers ? 'Show numbered details' : 'Hide numbered details'}
              </button>
            ) : null}
            {showImage ? (
              <button ref={enlargeRef} type={'button'} onClick={() => setEnlarged(true)}>Enlarge image</button>
            ) : null}
          </div>

          {!showImage ? (
            <section className={'frame-list'} aria-labelledby={`${encounter.id}-outside-heading`}>
              <h3 id={`${encounter.id}-outside-heading`}>Outside the picture</h3>
              {['top', 'left', 'right', 'bottom'].map((position) => frameQuestions(position))}
            </section>
          ) : null}

          {showImage && !outside ? (
            <details className={'image-description'}>
              <summary>Image description</summary>
              <p>{image.description}</p>
            </details>
          ) : null}
          <p className={'image-limit'}>
            <strong>What this image cannot show: </strong>
            {encounter.imageLimitation}
          </p>
        </div>

        <div className={'look-side'}>
          <div aria-live={'polite'}>
            <DetailPanel encounter={encounter} hotspot={active} lens={lens} />
          </div>
          <h3 className={'small-heading'} id={`${encounter.id}-details-heading`}>Details in this picture</h3>
          <ol className={'details-list'} aria-labelledby={`${encounter.id}-details-heading`}>
            {encounter.hotspots.map((spot, index) => (
              <li key={spot.id}>
                <button type={'button'} aria-pressed={activeId === spot.id} onClick={() => openSpot(spot.id)}>
                  <span className={'detail-number'} aria-hidden={'true'}>{index + 1}</span>
                  <span>{spot.label}</span>
                  <small>{explored(spot.id) ? 'explored' : ''}</small>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {showImage ? (
        <ImageDialog
          open={enlarged}
          onClose={() => {
            setEnlarged(false)
            enlargeRef.current?.focus()
          }}
          title={encounter.title}
          src={assetUrl(image.originalPath)}
          alt={image.alt}
        />
      ) : null}
    </div>
  )
}
