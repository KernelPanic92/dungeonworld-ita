import type { JsonLdObject } from "schema-dts";

interface JsonLdProps {
  /** One JSON-LD object, or an array (each rendered as its own <script> tag). */
  data: JsonLdObject | JsonLdObject[];
}

/**
 * Renders a JSON-LD block (schema.org structured data).
 * `<` is escaped to avoid breaking the script tag on content like "</script>".
 */
export function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}