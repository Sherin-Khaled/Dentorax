import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

const shared = read("../components/dental/ContactMethods.tsx");
const contact = read("../pages/contact.tsx");
const about = read("../pages/about.tsx");
const styles = read("../index.css");
const english = JSON.parse(read("../locales/en.json"));
const arabic = JSON.parse(read("../locales/ar.json"));

test("Contact and About consume one shared contact-method implementation", () => {
  assert.match(contact, /import \{ ContactMethods \} from "@\/components\/dental\/ContactMethods"/);
  assert.match(about, /import \{ ContactMethods \} from "@\/components\/dental\/ContactMethods"/);
  assert.equal((contact.match(/<ContactMethods \/>/g) ?? []).length, 1);
  assert.equal((about.match(/<ContactMethods \/>/g) ?? []).length, 1);
  assert.doesNotMatch(about, /CONTACT_ACTIONS\.map|href="\/contact"[\s\S]{0,300}aboutPage\.contact\.actions/);
});

test("shared data preserves the approved contact values and warehouse Maps action", () => {
  for (const expected of [
    "tel:+201552229405",
    "tel:+20223955981",
    "mailto:contact@dentora-x.com",
    "https://wa.me/201035777335",
    "18 St Gheet Al Eda - Abdeen - Cairo",
    "https://maps.app.goo.gl/8nHcgy3pM56rfD9D7?g_st=aw",
  ]) assert.match(shared, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(shared, /0223615151|01065057035|Branch Landline|Branch Mobile/);
  assert.match(shared, /target=\{action\.external \? "_blank"/);
  assert.match(shared, /rel=\{action\.external \? "noopener noreferrer"/);
});

test("cards reveal through fine-pointer hover, touch pointer activation, and keyboard focus", () => {
  assert.match(styles, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(styles, /\.contact-method-card:hover \.contact-method-card__inner/);
  assert.match(shared, /event\.pointerType === "mouse"/);
  assert.match(shared, /onPointerUp/);
  assert.match(shared, /\["Enter", " "\]\.includes\(event\.key\)/);
  assert.match(shared, /event\.key === "Escape"/);
  assert.match(styles, /\.contact-method-card:focus-within/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});

test("Visit address and Maps action are localized for EN and AR", () => {
  assert.equal(english.contactPage.cardSubtitles["Location Address"], "18 St Gheet Al Eda - Abdeen - Cairo");
  assert.equal(arabic.contactPage.cardSubtitles["Location Address"], "18 شارع غيط العدة - عابدين - القاهرة");
  assert.equal(english.contactPage.openInGoogleMaps, "Open in Google Maps");
  assert.equal(arabic.contactPage.openInGoogleMaps, "فتح في خرائط جوجل");
});
