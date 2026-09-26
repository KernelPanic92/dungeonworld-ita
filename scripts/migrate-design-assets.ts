/**
 * Migrates material file assets to reference the design/ folder instead of
 * storing PDFs inside the material entry. The mapping was built from the
 * actual content (docs/materiali/<slug>) vs the design sources (design/),
 * matching each material to its authoritative design file.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse, stringify } from "yaml";

// material entrySlug -> design file paths (one per file asset, in order)
const DESIGN = {
  barbaro: ["design/standard/classi/Barbaro.pdf"],
  bardo: ["design/standard/classi/Bardo.pdf"],
  chierico: [
    "design/standard/classi/Chierico.pdf",
    "design/standard/classi/chierico-incantesimi.pdf",
  ],
  druido: ["design/standard/classi/Druido.pdf"],
  guerriero: ["design/standard/classi/Guerriero.pdf"],
  ladro: ["design/standard/classi/Ladro.pdf"],
  mago: [
    "design/standard/classi/Mago.pdf",
    "design/standard/classi/mago-incantesimi.pdf",
  ],
  paladino: ["design/standard/classi/Paladino.pdf"],
  ramingo: ["design/standard/classi/Ramingo.pdf"],
  "riassunto-del-gm": ["design/standard/GM/Riassunto GM.pdf"],
  "riassunto-delle-mosse": ["design/standard/classi/Le Mosse.pdf"],
  "scheda-dei-fronti": ["design/standard/fronti/fronti.pdf"],
  "guida-a-dungeon-world": ["design/community/guida-a-dungeon-world.pdf"],
  "david-guyll-e-melissa-fisher-a-dungeon-world-playbook-bardo": [
    "design/homebrew/classi/David Guyll e Melissa Fisher/A Dungeon World Playbook/bardo.pdf",
  ],
  "david-guyll-e-melissa-fisher-a-dungeon-world-playbook-psionico": [
    "design/homebrew/classi/David Guyll e Melissa Fisher/A Dungeon World Playbook/psionico.pdf",
  ],
  "jacob-randolph-a-dungeon-world-playbook-strega": [
    "design/homebrew/classi/Jacob Randolph/A Dungeon World Playbook/strega.pdf",
  ],
  "jacob-randolph-alternative-playbook-artefice": [
    "design/homebrew/classi/Jacob Randolph/Alternative Playbook/artefice.pdf",
  ],
  "jacob-randolph-alternative-playbook-mago": [
    "design/homebrew/classi/Jacob Randolph/Alternative Playbook/mago.pdf",
  ],
  "jacob-randolph-alternative-playbook-sacerdote": [
    "design/homebrew/classi/Jacob Randolph/Alternative Playbook/sacerdote.pdf",
  ],
  "jacob-randolph-alternative-playbook-templare": [
    "design/homebrew/classi/Jacob Randolph/Alternative Playbook/templare.pdf",
  ],
  "jacob-randolph-mage-revised-mago-astrale": [
    "design/homebrew/classi/Jacob Randolph/Mage Revised/mago-astrale.pdf",
  ],
  "jacob-randolph-mage-revised-mago-del-tempo": [
    "design/homebrew/classi/Jacob Randolph/Mage Revised/mago-tempo.pdf",
  ],
  "jacob-randolph-mage-revised-mago-delle-maschere": [
    "design/homebrew/classi/Jacob Randolph/Mage Revised/Mago delle Maschere.pdf",
  ],
  "jacob-randolph-mage-revised-mago-dellinverno": [
    "design/homebrew/classi/Jacob Randolph/Mage Revised/mago-inverno.pdf",
  ],
  "jacob-randolph-mage-revised-mago-draconico": [
    "design/homebrew/classi/Jacob Randolph/Mage Revised/mago-draconico.pdf",
  ],
  "jacob-randolph-the-dashing-hero-spadaccino": [
    "design/homebrew/classi/Jacob Randolph/The Dashing Hero/Spadaccino.pdf",
  ],
  "james-mendez-hodes-raccolta-generale-monaco": [
    "design/homebrew/classi/James Mendez Hodes/Monaco.pdf",
  ],
  "nemo-hana-a-dungeon-world-playbook-ingannatore": [
    "design/homebrew/classi/Nemo Hana/A Dungeon World Playbook/ingannatore.pdf",
  ],
  "peter-johansen-lore-and-lords-pack-berserker": [
    "design/homebrew/classi/Peter Johansen/Lore and Lords Pack/berserker.pdf",
  ],
  "peter-johansen-lore-and-lords-pack-cacciatore": [
    "design/homebrew/classi/Peter Johansen/Lore and Lords Pack/cacciatore.pdf",
  ],
  "peter-johansen-lore-and-lords-pack-cavaliere-nero": [
    "design/homebrew/classi/Peter Johansen/Lore and Lords Pack/cavaliere nero.pdf",
  ],
  "peter-johansen-lore-and-lords-pack-monaco": [
    "design/homebrew/classi/Peter Johansen/Lore and Lords Pack/monaco.pdf",
  ],
  "peter-johansen-lore-and-lords-pack-professionista": [
    "design/homebrew/classi/Peter Johansen/Lore and Lords Pack/[compendio] professionista.pdf",
  ],
  "peter-johansen-lore-and-lords-pack-sciamano": [
    "design/homebrew/classi/Peter Johansen/Lore and Lords Pack/sciamano.pdf",
  ],
  "peter-johansen-lore-and-lords-pack-trickster": [
    "design/homebrew/classi/Peter Johansen/Lore and Lords Pack/trickster.pdf",
  ],
  "peter-johansen-lore-and-lords-pack-vampiro": [
    "design/homebrew/classi/Peter Johansen/Lore and Lords Pack/vampiro.pdf",
  ],
  "peter-johansen-secrets-and-sorcery-pack-cavaliere-dei-draghi": [
    "design/homebrew/classi/Peter Johansen/Secrets and Sorcery Pack/il cavaliere dei draghi.pdf",
  ],
  "peter-johansen-war-and-wonders-pack-abitante-del-villaggio": [
    "design/homebrew/classi/Peter Johansen/War and Wonders Pack/abitante del villaggio.pdf",
  ],
  "peter-johansen-war-and-wonders-pack-bestia": [
    "design/homebrew/classi/Peter Johansen/War and Wonders Pack/bestia.pdf",
  ],
  "peter-johansen-war-and-wonders-pack-maestro-delle-maschere": [
    "design/homebrew/classi/Peter Johansen/War and Wonders Pack/maestro delle maschere.pdf",
  ],
  "peter-johansen-war-and-wonders-pack-pistolero": [
    "design/homebrew/classi/Peter Johansen/War and Wonders Pack/pistolero.pdf",
  ],
  "peter-johansen-war-and-wonders-pack-signore-della-guerra": [
    "design/homebrew/classi/Peter Johansen/War and Wonders Pack/signore della guerra.pdf",
  ],
  "peter-johansen-war-and-wonders-pack-stolto": [
    "design/homebrew/classi/Peter Johansen/War and Wonders Pack/stolto.pdf",
  ],
  "peter-johansen-war-and-wonders-pack-warlock": [
    "design/homebrew/classi/Peter Johansen/War and Wonders Pack/warlock.pdf",
  ],
  "primarchthemage-a-dungeon-world-playbook-witcher": [
    "design/homebrew/classi/PrimarchtheMage/A Dungeon World Playbook/witcher.pdf",
  ],
  "stefan-grambart-dungeon-world-playbooks-immolatore": [
    "design/homebrew/classi/Stefan Grambart/Dungeon World PLAYBOOKS/immolatore.pdf",
  ],
  "trenton-kennedy-greyoak-e-deanna-nygren-greyoak-grim-world-cacciatore": [
    "design/homebrew/classi/Trenton Kennedy Greyoak e Deanna Nygren Greyoak/grim world/cacciatore.pdf",
  ],
  "trenton-kennedy-greyoak-e-deanna-nygren-greyoak-grim-world-canalizzatore": [
    "design/homebrew/classi/Trenton Kennedy Greyoak e Deanna Nygren Greyoak/grim world/canalizzatore.pdf",
  ],
  "trenton-kennedy-greyoak-e-deanna-nygren-greyoak-grim-world-maestro-della-battaglia": [
    "design/homebrew/classi/Trenton Kennedy Greyoak e Deanna Nygren Greyoak/grim world/maestro-della-battaglia.pdf",
  ],
  "trenton-kennedy-greyoak-e-deanna-nygren-greyoak-grim-world-necromante": [
    "design/homebrew/classi/Trenton Kennedy Greyoak e Deanna Nygren Greyoak/grim world/necromante.pdf",
  ],
  "trenton-kennedy-greyoak-e-deanna-nygren-greyoak-grim-world-schermagliatore": [
    "design/homebrew/classi/Trenton Kennedy Greyoak e Deanna Nygren Greyoak/grim world/schermagliatore.pdf",
  ],
} as const;

async function main() {
  let updated = 0;
  const oldPdfs: string[] = [];

  for (const [entrySlug, targets] of Object.entries(DESIGN)) {
    const file = path.join("docs", "materiali", "1.0", entrySlug, "index.mdoc");
    let raw: string;
    try {
      raw = await readFile(file, "utf8");
    } catch {
      console.warn(`SKIP ${entrySlug}: file not found`);
      continue;
    }
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) continue;
    const data = parse(m[1]) as {
      assets?: Array<{ discriminant: string; value: { file?: string } }>;
    };
    const fileAssets = (data.assets ?? []).filter((a) => a.discriminant === "file");
    if (fileAssets.length === 0) {
      console.warn(`SKIP ${entrySlug}: no file assets`);
      continue;
    }
    if (fileAssets.length !== targets.length) {
      console.warn(
        `SKIP ${entrySlug}: ${fileAssets.length} assets but ${targets.length} targets`,
      );
      continue;
    }
    fileAssets.forEach((a, i) => {
      if (a.value.file) oldPdfs.push(`docs/materiali/1.0/${entrySlug}/${a.value.file}`);
      a.value.file = targets[i];
    });
    await writeFile(file, `---\n${stringify(data).trimEnd()}\n---\n${m[2]}`);
    updated++;
  }

  console.log(`Updated ${updated} materials.`);
  console.log("Old PDFs to remove:");
  for (const p of oldPdfs) console.log(`  ${p}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});