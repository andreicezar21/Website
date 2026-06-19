"use client";

import { useState } from "react";
import { asset, type Photo } from "@/lib/content";

// A pinned, slightly-tilted photograph with a mono caption. If the image file
// isn't present yet (or fails to load) it falls back to a styled placeholder so
// the layout always reads as intentional — drop the JPEGs into public/photos/
// and they appear automatically.
export default function PhotoFrame({ photo }: { photo: Photo }) {
  const [failed, setFailed] = useState(false);
  const rot = photo.rotate ?? 0;

  return (
    <figure className="photo-frame" style={{ ["--rot" as string]: `${rot}deg` }}>
      <div className="photo-well">
        {failed ? (
          <div className="photo-missing">
            <span className="photo-missing-mark">▦</span>
            <span>{photo.src.replace(/^\//, "")}</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset(photo.src)}
            alt={photo.caption}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )}
        <span className="photo-tag">{photo.tag}</span>
      </div>
      <figcaption className="photo-caption">{photo.caption}</figcaption>
    </figure>
  );
}
