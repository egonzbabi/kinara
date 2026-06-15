import { useState } from "react";
import { cn } from "~/lib/cn";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 md:flex-col">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={cn(
                "h-20 w-16 shrink-0 overflow-hidden rounded-lg border transition-colors md:h-24 md:w-20",
                active === i
                  ? "border-espresso"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <img
                src={src}
                alt=""
                aria-hidden
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main */}
      <div className="flex-1 overflow-hidden rounded-2xl bg-bone">
        <img
          src={current}
          alt={alt}
          className="aspect-[4/5] w-full object-cover"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
