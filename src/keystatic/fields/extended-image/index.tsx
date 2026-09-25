import { type AssetFormField } from '@keystatic/core';
import type Cropper from 'cropperjs';

import { ExtendedImageInput } from './input';

// Same semantics as the internal helpers of fields.image in @keystatic/core.
function fixPath(path: string) {
  return path.replace(/\\/g, '/');
}

function getSrcPrefix(
  publicPath: string | undefined,
  slug: string | undefined
) {
  return typeof publicPath === 'string'
    ? `${publicPath.replace(/\/*$/, '')}/${slug === undefined ? '' : slug + '/'}`
    : '';
}

type RequiredValidation<IsRequired extends boolean | undefined> =
  IsRequired extends true ? { validation: { isRequired: true } } : unknown;

function assertRequired<T, IsRequired extends boolean | undefined>(
  value: T | null,
  validation: undefined | { isRequired?: IsRequired },
  label: string
): asserts value is T | (IsRequired extends true ? never : null) {
  if (value === null && validation?.isRequired) {
    throw new Error(`${label} è obbligatorio`);
  }
}

export function extendedImage<IsRequired extends boolean | undefined>({
  label,
  description,
  directory,
  publicPath,
  validation,
  cropper,
}: {
  label: string;
  description?: string;
  directory?: string;
  publicPath?: string;
  validation?: { isRequired?: IsRequired };
  /** Options forwarded to the CropperJS instance (e.g. `{ aspectRatio: 16 / 9 }`). */
  cropper?: Cropper.Options<HTMLImageElement>;
} & RequiredValidation<IsRequired>): AssetFormField<
  { data: Uint8Array; extension: string; filename: string } | null,
  | { data: Uint8Array; extension: string; filename: string }
  | (IsRequired extends true ? never : null),
  string | (IsRequired extends true ? never : null)
> {
  return {
    kind: 'form',
    formKind: 'asset',
    label,
    Input(props) {
      return (
        <ExtendedImageInput
          label={label}
          description={description}
          validation={validation}
          cropper={cropper}
          {...props}
        />
      );
    },
    defaultValue() {
      return null;
    },
    filename(value, args) {
      if (typeof value === 'string') {
        return value.slice(getSrcPrefix(publicPath, args.slug).length);
      }
      return undefined;
    },
    parse(value, args) {
      if (value === undefined) {
        return null;
      }
      if (typeof value !== 'string') {
        throw new Error('Must be a string');
      }
      if (args.asset === undefined) {
        return null;
      }
      return {
        data: args.asset,
        filename: value.slice(getSrcPrefix(publicPath, args.slug).length),
        extension: value.match(/\.([^.]+$)/)?.[1] ?? '',
      };
    },
    validate(value) {
      assertRequired(value, validation, label);
      return value;
    },
    serialize(value, args) {
      if (value === null) {
        return { value: undefined, asset: undefined };
      }
      const filename = args.suggestedFilenamePrefix
        ? args.suggestedFilenamePrefix + '.' + value.extension
        : value.filename;
      return {
        value: `${getSrcPrefix(publicPath, args.slug)}${filename}`,
        asset: { filename, content: value.data },
      };
    },
    directory: directory ? fixPath(directory) : undefined,
    reader: {
      parse(value) {
        if (typeof value !== 'string' && value !== undefined) {
          throw new Error('Must be a string');
        }
        const val = value === undefined ? null : value;
        assertRequired(val, validation, label);
        return val;
      },
    },
  };
}
