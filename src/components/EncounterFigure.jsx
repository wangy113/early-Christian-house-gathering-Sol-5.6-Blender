import { useRef, useState } from 'react'
import { assetUrl } from '../lib/assetUrl.js'
import { ImageDialog } from './ImageDialog.jsx'

export function EncounterFigure({ encounter, descriptionsOnly }) {
  const { image } = encounter
  const [failed, setFailed] = useState(false)
  const [enlarged, setEnlarged] = useState(false)
  const triggerRef = useRef(null)
  const descriptionId = `${encounter.id}-description`

  const close = () => {
    setEnlarged(false)
    triggerRef.current?.focus()
  }

  return (
    <figure className={'encounter-figure'}>
      <p className={'tag tag-reconstruction'}>Modern reconstruction</p>
      {descriptionsOnly ? null : failed ? (
        <p className={'image-failed'}>
          The image could not load. <a href={`#${descriptionId}`} onClick={(event) => {
            event.preventDefault()
            document.getElementById(descriptionId)?.focus()
          }}>Read its description</a>; everything else on this page works without it.
        </p>
      ) : (
        <>
          <img
            src={assetUrl(image.displayPath)}
            srcSet={image.srcSet.map((variant) => `${assetUrl(variant.path)} ${variant.width}w`).join(', ')}
            sizes={'(min-width: 72rem) 52rem, (min-width: 60rem) calc(100vw - 22rem), calc(100vw - 2rem)'}
            width={image.width}
            height={image.height}
            alt={image.alt}
            decoding={'async'}
            onError={() => setFailed(true)}
          />
          <button ref={triggerRef} type={'button'} className={'enlarge'} onClick={() => setEnlarged(true)}>
            Enlarge image
          </button>
          <ImageDialog open={enlarged} onClose={close} title={encounter.title} src={assetUrl(image.originalPath)} alt={image.alt} />
        </>
      )}
      <figcaption>
        {descriptionsOnly || failed ? (
          <div className={'image-description'} id={descriptionId} tabIndex={-1}>
            <h2 className={'small-heading'}>Image description</h2>
            <p>{image.alt}</p>
            <p>{image.description}</p>
          </div>
        ) : (
          <details className={'image-description'}>
            <summary>Image description</summary>
            <p>{image.description}</p>
          </details>
        )}
        <p className={'image-limit'}>
          <strong>What this image cannot show: </strong>
          {encounter.imageLimitation}
        </p>
      </figcaption>
    </figure>
  )
}
