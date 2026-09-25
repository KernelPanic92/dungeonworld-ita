import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { materialThumbnail } from "@/lib/materials";
import {
  MATERIAL_SOURCE_OPTIONS,
  MATERIAL_TYPE_OPTIONS,
} from "@/lib/materials-parsers";
import type { Material } from "@/lib/keystatic";

export function MaterialCard({
  material,
  version,
}: {
  material: Material;
  version: string;
}) {
  const thumbnail = materialThumbnail(material, version);
  const typeLabel =
    MATERIAL_TYPE_OPTIONS.find((t) => t.value === material.type)?.label ??
    material.type;
  const sourceLabel =
    MATERIAL_SOURCE_OPTIONS.find((s) => s.value === material.source)?.label ??
    material.source;
  const isCollection = material.type === "collection";

  return (
    <Link
      href={`/${version}/materiali/${material.slug}`}
      className="group block h-full"
    >
      <Card className="h-full overflow-hidden transition-all duration-300 group-hover:border-dw/60 group-hover:shadow-lg group-hover:shadow-dw/5 group-focus-visible:ring-2 group-focus-visible:ring-dw/50">
        <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
          {thumbnail ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={thumbnail}
              alt={material.showcase?.heroName ?? material.name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-linear-to-br from-dw/20 via-muted to-muted text-4xl font-bold text-dw/60">
              {material.name.charAt(0)}
            </div>
          )}
          <div className="absolute left-2 top-2 flex gap-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur">
              {typeLabel}
            </Badge>
            <Badge
              variant={material.source === "official" ? "default" : "outline"}
              className={
                material.source === "official"
                  ? "bg-dw text-on-dw"
                  : "bg-background/80 backdrop-blur"
              }
            >
              {sourceLabel}
            </Badge>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-lg group-hover:text-dw transition-colors">
            {material.name}
          </CardTitle>
          {isCollection ? (
            <p className="text-xs text-muted-foreground">
              {material.contains.length > 0
                ? `${material.contains.length} materiali`
                : "Collezione vuota"}
            </p>
          ) : material.collection ? (
            <p className="text-xs text-muted-foreground">{material.collection.name}</p>
          ) : null}
        </CardHeader>
        <CardContent>
          <CardDescription className="line-clamp-3 text-sm">
            {material.shortDescription || material.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="gap-2 text-xs text-muted-foreground">
          {material.date ? (
            <span>{new Date(material.date).toLocaleDateString("it-IT")}</span>
          ) : null}
          {material.version ? <span>v{material.version}</span> : null}
        </CardFooter>
      </Card>
    </Link>
  );
}
