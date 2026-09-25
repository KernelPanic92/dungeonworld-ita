'use client';

import { ActionButton, ButtonGroup } from '@keystar/ui/button';
import {
  DropZone,
  FileTrigger,
  isFileDropItem,
} from '@keystar/ui/drag-and-drop';
import { FieldDescription, FieldLabel, FieldMessage } from '@keystar/ui/field';
import { Icon } from '@keystar/ui/icon';
import { imagePlusIcon } from '@keystar/ui/icon/icons/imagePlusIcon';
import { Flex } from '@keystar/ui/layout';
import { tokenSchema } from '@keystar/ui/style';
import { Text } from '@keystar/ui/typography';
import Cropper from 'cropperjs';
import { useEffect, useId, useReducer, useRef, useState } from 'react';

import 'cropperjs/dist/cropper.css';

export type ExtendedImageInputProps = {
  label: string;
  description: string | undefined;
  validation: { isRequired?: boolean } | undefined;
  cropper: Cropper.Options<HTMLImageElement> | undefined;
  value: {
    data: Uint8Array;
    extension: string;
    filename: string;
  } | null;
  onChange(value: {
    data: Uint8Array;
    extension: string;
    filename: string;
  } | null): void;
  autoFocus: boolean;
  forceValidation: boolean;
};

const IMAGE_MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  avif: 'image/avif',
};

function fmtBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} kB`;
  return `${n} B`;
}

function extensionToMime(extension: string): string {
  return IMAGE_MIME_BY_EXTENSION[extension.toLowerCase()] ?? '';
}

function useObjectURL(data: Uint8Array | null, contentType: string | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!data) {
      const id = requestAnimationFrame(() => setUrl(null));
      return () => cancelAnimationFrame(id);
    }
    const objectUrl = URL.createObjectURL(
      new Blob([new Uint8Array(data)], { type: contentType })
    );
    const id = requestAnimationFrame(() => setUrl(objectUrl));
    return () => {
      cancelAnimationFrame(id);
      URL.revokeObjectURL(objectUrl);
    };
  }, [contentType, data]);
  return url;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number
): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, mime, quality));
}

function supportsWebpEncoding(): Promise<boolean> {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 2;
  return canvasToBlob(canvas, 'image/webp', 0.8).then(
    blob => blob?.type === 'image/webp'
  );
}

function flattenOnWhite(source: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(source, 0, 0);
  }
  return out;
}

// Encodes the crop preserving the source format, falling back to jpeg when
// the source format can't be encoded on a canvas (gif, webp on Safari…).
async function encodeCanvas(
  canvas: HTMLCanvasElement,
  sourceExtension: string
): Promise<{ blob: Blob; extension: string }> {
  const ext = sourceExtension.toLowerCase();
  const target = /^png$/.test(ext)
    ? 'png'
    : /^webp$/.test(ext) && (await supportsWebpEncoding())
      ? 'webp'
      : /^gif$/.test(ext)
        ? 'png'
        : 'jpeg';
  const source = target === 'jpeg' ? flattenOnWhite(canvas) : canvas;
  const blob = await canvasToBlob(
    source,
    `image/${target}`,
    target === 'png' ? undefined : 0.9
  );
  if (!blob) throw new Error('Impossibile codificare l’immagine.');
  return { blob, extension: target };
}

export function ExtendedImageInput(props: ExtendedImageInputProps) {
  const {
    label,
    description,
    validation,
    cropper,
    value,
    onChange,
    forceValidation,
  } = props;
  const [blurred, onBlur] = useReducer(() => true, false);
  const [editing, setEditing] = useState<{
    src: string;
    filename: string;
  } | null>(null);
  const [cropperReady, setCropperReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);
  const [previewDims, setPreviewDims] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const activeSrcRef = useRef<string | null>(null);

  const labelId = useId();
  const descriptionId = useId();

  const objectUrl = useObjectURL(
    value === null ? null : value.data,
    value?.extension === 'svg' ? 'image/svg+xml' : undefined
  );

  useEffect(() => {
    return () => {
      if (activeSrcRef.current) URL.revokeObjectURL(activeSrcRef.current);
    };
  }, []);

  useEffect(() => {
    if (!editing) return;
    const img = imageRef.current;
    if (!img) return;
    const userReady = cropper?.ready;
    const instance = new Cropper(img, {
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 1,
      background: false,
      responsive: true,
      ...cropper,
      ready(event) {
        userReady?.call(this, event);
        setCropperReady(true);
      },
    });
    cropperRef.current = instance;
    return () => {
      instance.destroy();
      cropperRef.current = null;
    };
  }, [editing, cropper]);

  function openCropper(src: string, filename: string) {
    if (activeSrcRef.current) URL.revokeObjectURL(activeSrcRef.current);
    activeSrcRef.current = src;
    setModalError(null);
    setBusy(false);
    setCropperReady(false);
    setEditing({ src, filename });
  }

  function closeCropper() {
    if (activeSrcRef.current) {
      URL.revokeObjectURL(activeSrcRef.current);
      activeSrcRef.current = null;
    }
    setEditing(null);
    setModalError(null);
    setBusy(false);
    setCropperReady(false);
  }

  function acceptFile(file: File) {
    const looksLikeImage =
      file.type.startsWith('image/') ||
      /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(file.name);
    if (!looksLikeImage) {
      setDropError(`"${file.name}" non è un file immagine supportato.`);
      return;
    }
    setDropError(null);
    openCropper(URL.createObjectURL(file), file.name);
  }

  function onFileSelected(files: FileList | null) {
    const file = files?.[0];
    if (file) acceptFile(file);
  }

  async function applyCrop() {
    const instance = cropperRef.current;
    if (!instance || !editing || busy) return;
    const canvas = instance.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });
    if (!canvas) {
      setModalError('Impossibile generare il ritaglio.');
      return;
    }
    setBusy(true);
    setModalError(null);
    try {
      const result = await encodeCanvas(
        canvas,
        editing.filename.match(/\.([^.]+$)/)?.[1] ?? ''
      );
      const baseName =
        editing.filename.replace(/\.[^.]+$/, '') || 'immagine';
      onChange({
        data: new Uint8Array(await result.blob.arrayBuffer()),
        extension: result.extension,
        filename: `${baseName}.${result.extension}`,
      });
      closeCropper();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <Flex
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={labelId}
      direction="column"
      gap="medium"
      role="group"
      onBlur={onBlur}
    >
      <FieldLabel
        id={labelId}
        elementType="span"
        isRequired={validation?.isRequired}
      >
        {label}
      </FieldLabel>
      {description && (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      )}
      <DropZone
        aria-label={`${label} — trascina un'immagine oppure seleziona un file`}
        getDropOperation={types => (types.has('image/*') ? 'copy' : 'cancel')}
        onDrop={async event => {
          const item = event.items.find(isFileDropItem);
          if (!item) return;
          acceptFile(await item.getFile());
        }}
        width="100%"
      >
        {({ isDropTarget }) =>
          value === null ? (
            <Flex
              direction="column"
              alignItems="center"
              gap="regular"
              padding="xlarge"
            >
              <Icon src={imagePlusIcon} size="large" />
              <Text slot="label">
                {isDropTarget
                  ? 'Rilascia qui l’immagine'
                  : 'Trascina qui un’immagine'}
              </Text>
              <Text color="neutralSecondary" size="small">
                oppure
              </Text>
              <FileTrigger
                acceptedFileTypes={['image/*']}
                onSelect={onFileSelected}
              >
                <ActionButton>Scegli file…</ActionButton>
              </FileTrigger>
            </Flex>
          ) : (
            <Flex
              direction="column"
              alignItems="center"
              gap="regular"
              padding="regular"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={objectUrl ?? undefined}
                alt=""
                onLoad={event =>
                  setPreviewDims({
                    w: event.currentTarget.naturalWidth,
                    h: event.currentTarget.naturalHeight,
                  })
                }
                style={{
                  display: 'block',
                  maxHeight: tokenSchema.size.alias.singleLineWidth,
                  maxWidth: '100%',
                }}
              />
              {previewDims && (
                <Text color="neutralSecondary" size="small">
                  {previewDims.w}×{previewDims.h} px ·{' '}
                  {fmtBytes(value.data.byteLength)}
                </Text>
              )}
            </Flex>
          )
        }
      </DropZone>
      {value !== null && (
        <ButtonGroup>
          <FileTrigger
            acceptedFileTypes={['image/*']}
            onSelect={onFileSelected}
          >
            <ActionButton>Cambia immagine…</ActionButton>
          </FileTrigger>
          <ActionButton
            prominence="low"
            onPress={() => {
              onChange(null);
              setPreviewDims(null);
              setDropError(null);
              onBlur();
            }}
          >
            Rimuovi
          </ActionButton>
        </ButtonGroup>
      )}
      {dropError && <FieldMessage>{dropError}</FieldMessage>}
      {(forceValidation || blurred) &&
        validation?.isRequired &&
        value === null && <FieldMessage>{label} è obbligatorio</FieldMessage>}
      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Ritaglia immagine — ${label}`}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              background: tokenSchema.color.background.canvas,
              color: tokenSchema.color.foreground.neutral,
              borderRadius: 8,
              width: 'min(920px, 100%)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: `1px solid ${tokenSchema.color.border.neutral}`,
              }}
            >
              <strong>Ritaglia immagine — {label}</strong>
            </div>
            <div
              style={{
                flex: 1,
                minHeight: 320,
                maxHeight: '60vh',
                overflow: 'hidden',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={editing.src}
                alt=""
                style={{ display: 'block', maxWidth: '100%' }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 12,
                padding: '14px 18px',
                borderTop: `1px solid ${tokenSchema.color.border.neutral}`,
              }}
            >
              <span style={{ fontSize: 13, color: tokenSchema.color.foreground.critical }}>
                {modalError}
              </span>
              <ButtonGroup>
                <ActionButton onPress={closeCropper} isDisabled={busy}>
                  Annulla
                </ActionButton>
                <ActionButton
                  onPress={applyCrop}
                  isDisabled={!cropperReady || busy}
                >
                  {busy ? 'Elaborazione…' : 'Applica ritaglio'}
                </ActionButton>
              </ButtonGroup>
            </div>
          </div>
        </div>
      )}
    </Flex>
  );
}
