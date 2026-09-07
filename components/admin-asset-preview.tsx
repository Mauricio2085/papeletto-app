import Link from "next/link";
import {
  adminAssetUrl,
  isImageAsset,
  isPdfAsset,
  isTextAsset,
} from "@/lib/orders/assets";
import { assetKindLabel } from "@/lib/orders/labels";

type AdminAssetPreviewProps = {
  orderId: string;
  assetId: string;
  filename: string;
  mimeType: string;
  kind: string;
};

export function AdminAssetPreview({
  orderId,
  assetId,
  filename,
  mimeType,
  kind,
}: AdminAssetPreviewProps) {
  const url = adminAssetUrl(orderId, assetId);
  const showPdf = isPdfAsset(mimeType, filename);
  const showText = isTextAsset(mimeType, filename) && !showPdf;
  const showImage = isImageAsset(mimeType, filename) && !showPdf;

  return (
    <div className="mt-3 space-y-3 border-t border-line pt-3">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-brand-bright hover:underline"
        >
          Abrir {assetKindLabel(kind).toLowerCase()}
        </Link>
      </div>

      {showPdf && (
        <iframe
          title={`Vista previa ${filename}`}
          src={url}
          className="h-[min(24rem,50vh)] w-full rounded-lg border border-line bg-white"
        />
      )}

      {showText && (
        <iframe
          title={`Vista previa ${filename}`}
          src={url}
          className="h-[min(16rem,40vh)] w-full rounded-lg border border-line bg-background"
        />
      )}

      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={filename}
          className="mx-auto max-h-64 w-auto rounded-lg border border-line object-contain"
        />
      )}
    </div>
  );
}
