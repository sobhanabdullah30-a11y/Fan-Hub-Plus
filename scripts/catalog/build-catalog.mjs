import { mkdir, writeFile } from 'node:fs/promises';
import { worlds } from './worlds.mjs';

const base = 'https://tech360-fanhub.runasp.net/catalog';
const output = new URL('../../frontend/public/catalog/', import.meta.url);
await mkdir(output, { recursive: true });
const records = [];
const narration = [];
const galleryNotes = [
  ['A pale crescent rises behind overlapping roofs, separating the city from the open sky.', 'A warm lantern marks the next step through the dark, with rays leading away from its center.', 'The telescope tilts upward on a spare tripod, turning the empty space above it into the subject.'],
  ['A triangular relay tower places its signal above the landing surface.', 'An elliptical route wraps around the central station and links two smaller waypoints.', 'An oblique coordinate grid gives the arrival area a readable direction.'],
  ['An amber beam cuts across the lighthouse tower and gives the harbor scene its visual anchor.', 'A rounded window divides a small source of light while diagonal marks suggest rain outside.', 'The tower returns as a familiar silhouette, inviting a comparison with the first view.'],
  ['A screen holds a clock-like dial, making time the focal point of an otherwise quiet control panel.', 'Paired reels and a record button reduce the archive to the object that carries its missing voices.', 'The circular display returns after the recorder, connecting a machine with the hour it cannot explain.'],
  ['Unequal light bars build a rising rhythm, like a stage cue gathering intensity.', 'A pair of headphones frames a small pulse of lines, keeping the act of listening at the center.', 'Repeated magenta bars alternate between long and short marks to create a second visual beat.'],
  ['The lantern’s dark frame contains a bright core, echoing a wayfinding sign seen at night.', 'A branching line breaks the route into decisions, with circular markers identifying the key turns.', 'Three unequal panels divide the city into separate moments rather than one continuous panorama.'],
  ['Diagonal folds meet at a pointed hull, letting a few dark edges describe the paper boat.', 'A second boat composition places a rippling line below the hull to suggest the canal surface.', 'Two arched lines span an open space, and the water beneath repeats their movement more softly.'],
  ['Paired eye openings and a central fold make the mask recognizable without decorative detail.', 'A cape’s outer shape and its contrasting seam show how one layer can define a costume.', 'Open scissors point toward the space above them, connecting the finished silhouette back to pattern work.'],
];
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

function symbol(name, color, dark) {
  const shapes = {
    moon: '<circle cx="280" cy="150" r="100"/><circle cx="322" cy="120" r="93" fill="BACK"/><path d="M30 440V317l75-46 73 46v123h25V273l76-45 81 45v167h20V333l76-47 75 47v107Z" opacity=".55"/><path d="M60 350h30m30 0h30m87-34h28m28 0h28m90 43h30m22 0h30" stroke="BACK" stroke-width="20"/>',
    beacon: '<path d="m145 402 135-278 135 278Z" fill="none" stroke="CURRENT" stroke-width="12"/><circle cx="280" cy="128" r="32"/><path d="M190 65q90-80 180 0M155 26q125-115 250 0" fill="none" stroke="CURRENT" stroke-width="8"/><path d="M76 436h410m-336-32h260" stroke="CURRENT" stroke-width="8"/>',
    orbit: '<circle cx="280" cy="250" r="72"/><ellipse cx="280" cy="250" rx="224" ry="96" transform="rotate(-27 280 250)" fill="none" stroke="CURRENT" stroke-width="12"/><circle cx="431" cy="112" r="26"/><circle cx="114" cy="370" r="17"/>',
    lighthouse: '<path d="m234 175-40 253h172l-40-253Z"/><path d="M219 130h122v52H219zm-21-5 82-69 82 69Z"/><path d="M230 273h102M221 329h120" stroke="BACK" stroke-width="28"/><path d="m220 159-178-38v76zm123 0 174-38v76Z" opacity=".35"/>',
    window: '<rect x="140" y="65" width="280" height="355" rx="120"/><path d="M280 68v352M140 225h280" stroke="BACK" stroke-width="16"/><path d="M173 125h27m151 180h27M56 95l-30 55m490 30-30 55m-30 187-30 55" stroke="CURRENT" stroke-width="6"/>',
    waveform: '<path d="M55 249h50m30-47v100m37-148v194m37-234v274m38-300v326m38-348v370m38-320v270m38-217v164m38-126v90m38-51h45" fill="none" stroke="CURRENT" stroke-width="18" stroke-linecap="round"/>',
    route: '<path d="M65 408h92V230h112V107h197M157 230H72m197 0h141v114h90" fill="none" stroke="CURRENT" stroke-width="16" stroke-linejoin="round"/><circle cx="65" cy="408" r="28"/><circle cx="466" cy="107" r="28"/><circle cx="410" cy="344" r="25" fill="BACK" stroke="CURRENT" stroke-width="8"/>',
    bridge: '<path d="M58 373q222-330 444 0M58 405q222-290 444 0" fill="none" stroke="CURRENT" stroke-width="18"/><path d="M58 375v83m444-83v83M114 317v73m68-130v80m196-81v80m70-22v73" stroke="CURRENT" stroke-width="10"/><path d="M40 473q80-30 160 0t160 0t160 0" fill="none" stroke="CURRENT" stroke-width="6"/>',
    telescope: '<path d="m160 220 210-100 35 80-210 100Z"/><circle cx="389" cy="162" r="47" fill="BACK" stroke="CURRENT" stroke-width="12"/><path d="m280 260-90 190m90-190 90 190m-90-190v195" fill="none" stroke="CURRENT" stroke-width="14"/>',
    controller: '<path d="M170 160h220q54 0 78 70l30 115q9 70-54 59l-74-64H190l-74 64q-63 11-54-59l30-115q24-70 78-70Z"/><path d="M155 215v85m-42-42h84" stroke="BACK" stroke-width="18"/><circle cx="365" cy="235" r="15" fill="BACK"/><circle cx="414" cy="281" r="15" fill="BACK"/>',
    robot: '<rect x="143" y="105" width="275" height="245" rx="45"/><path d="M280 105V60m-40 0h80" stroke="CURRENT" stroke-width="12"/><rect x="180" y="155" width="200" height="85" rx="30" fill="BACK"/><circle cx="225" cy="198" r="18"/><circle cx="335" cy="198" r="18"/><path d="M210 290h140" stroke="BACK" stroke-width="12"/><path d="m175 350-35 70m245-70 35 70" stroke="CURRENT" stroke-width="24"/>',
    film: '<rect x="105" y="110" width="355" height="270" rx="20"/><rect x="140" y="165" width="285" height="158" fill="BACK"/><path d="m250 194 85 50-85 50Z"/><path d="M145 135h35m35 0h35m35 0h35m35 0h35m-245 215h35m35 0h35m35 0h35m35 0h35" stroke="BACK" stroke-width="18"/>',
    lantern: '<path d="M230 100q50-90 100 0m-125 30h150l-15 250H220Z" fill="none" stroke="CURRENT" stroke-width="16"/><path d="M183 115h195v33H183zm25 264h147v35H208z"/><path d="m280 180 47 125-47 39-47-39Z"/><path d="M80 260h80m240 0h80M132 145l47 38m214 142 47 38" stroke="CURRENT" stroke-width="5" opacity=".5"/>',
    screen: '<rect x="70" y="100" width="420" height="265" rx="25"/><rect x="98" y="127" width="364" height="208" rx="10" fill="BACK"/><path d="M220 412h120m-60-47v47" stroke="CURRENT" stroke-width="18"/><circle cx="280" cy="230" r="70" fill="none" stroke="CURRENT" stroke-width="6"/><path d="M280 175v60l43 27" fill="none" stroke="CURRENT" stroke-width="10"/>',
    recorder: '<rect x="157" y="60" width="246" height="365" rx="24"/><rect x="188" y="105" width="184" height="118" rx="10" fill="BACK"/><circle cx="233" cy="165" r="28"/><circle cx="326" cy="165" r="28"/><circle cx="280" cy="300" r="34" fill="BACK"/><path d="M212 375h136" stroke="BACK" stroke-width="13"/>',
    headphones: '<path d="M115 275v-45a165 165 0 0 1 330 0v45" fill="none" stroke="CURRENT" stroke-width="32"/><rect x="80" y="240" width="92" height="150" rx="35"/><rect x="389" y="240" width="92" height="150" rx="35"/><path d="M225 200v125m55-160v185m55-150v125" stroke="CURRENT" stroke-width="14" stroke-linecap="round"/>',
    panels: '<path d="M78 90h215v170H78zm240 0h162v170H318zM78 285h402v140H78Z" fill="none" stroke="CURRENT" stroke-width="12"/><path d="m122 216 54-95 59 95Zm221-64h104v57H343Zm-230 194h330m-330 36h215" stroke="CURRENT" stroke-width="8"/>',
    ink: '<path d="m170 365 147-240 80 50-151 236-99 31Z"/><path d="m319 124 27-43q15-21 39-5l35 22q20 16 6 37l-26 41Z" opacity=".65"/><path d="m168 365 78 46-98 31Z" fill="BACK" stroke="CURRENT" stroke-width="5"/><path d="M90 465h380" stroke="CURRENT" stroke-width="4"/>',
    boat: '<path d="m65 270 205-167 225 167-92 135H154Z"/><path d="m65 270 275-56-70-111 10 302m60-191 155 56H65" fill="none" stroke="BACK" stroke-width="7"/><path d="M70 438q70-30 140 0t140 0t140 0" fill="none" stroke="CURRENT" stroke-width="5"/>',
    mask: '<path d="M80 160q100-42 200 18 100-60 200-18l-28 148q-57 100-172 32-115 68-172-32Z"/><path d="M133 227q50-45 105 6-55 58-105-6m190 6q55-51 105-6-50 64-105 6" fill="BACK"/><path d="m280 178-15 135h30Z" fill="BACK" opacity=".5"/>',
    scissors: '<circle cx="182" cy="355" r="63" fill="none" stroke="CURRENT" stroke-width="18"/><circle cx="378" cy="355" r="63" fill="none" stroke="CURRENT" stroke-width="18"/><path d="m220 310 155-215-93 260L185 95l153 215" fill="none" stroke="CURRENT" stroke-width="19"/>',
    book: '<path d="M132 80h275v350H132q-30 0-30-30V110q0-30 30-30Z"/><path d="M142 85v300m-36 15h302" stroke="BACK" stroke-width="10"/><circle cx="274" cy="215" r="63" fill="none" stroke="BACK" stroke-width="7"/><path d="m247 217 28-44 30 44-30 41Z" fill="BACK"/>',
    mat: '<path d="m52 203 333-115 133 207-336 120Z"/><g stroke="BACK" stroke-width="4" opacity=".5"><path d="m100 217 330-114m-304 151 330-113m-303 151 330-113m-300 148 330-114M135 175l127 207m-57-231 127 207m-57-231 127 207"/></g>',
    print: '<rect x="120" y="55" width="320" height="405" rx="4"/><rect x="143" y="78" width="274" height="359" fill="BACK"/><circle cx="280" cy="210" r="88"/><path d="m180 374 100-195 100 195Z" fill="BACK" stroke="CURRENT" stroke-width="9"/>',
    bag: '<path d="M215 150V93q65-70 130 0v57" fill="none" stroke="CURRENT" stroke-width="19"/><rect x="110" y="140" width="340" height="290" rx="40"/><path d="M115 157v123q165 90 330 0V157" fill="BACK" opacity=".55"/><rect x="255" y="282" width="50" height="70" rx="10" fill="BACK"/>',
    pin: '<path d="m280 65 173 100v210L280 470 107 375V165Z"/><path d="m280 95 148 87v176l-148 85-148-85V182Z" fill="BACK"/><path d="m280 150 61 108-61 125-61-125Z"/><circle cx="280" cy="259" r="25" fill="BACK"/>',
    bookmarks: '<path d="M80 90h112v330l-56-50-56 50zm145-30h112v330l-56-50-56 50zm145 60h112v330l-56-50-56 50Z"/><circle cx="136" cy="193" r="25" fill="BACK"/><path d="m251 165 30-40 30 40-30 40Zm145 20h60v64h-60Z" fill="BACK"/>',
    cape: '<path d="M209 85q70 45 142 0l146 320q-217 90-434 0Z"/><path d="M280 130v300M209 85l71 105 71-105" fill="none" stroke="BACK" stroke-width="10"/><circle cx="280" cy="169" r="22" fill="BACK"/>',
  };
  return `<g fill="${color}">${(shapes[name] || shapes.moon).replaceAll('CURRENT', color).replaceAll('BACK', dark)}</g>`;
}

function illustration(world, title, type, index, motif, caption = '') {
  const [light, mid, dark] = world.colors;
  const stars = Array.from({ length: 28 }, (_, n) => `<circle cx="${(n * 173 + index * 61) % 1200}" cy="${(n * 73 + 35) % 710}" r="${n % 3 + 1}" fill="${light}" opacity=".3"/>`).join('');
  let art = symbol(motif, light, dark);
  if (type === 'Character') {
    // Each original character has different hair, clothing, palette and story prop.
    const hair = index % 2 ? 'M188 156q-5-121 90-120 103 0 110 126l-58-69-30 52-55-38Z' : 'M183 157Q169 41 277 34q118 12 108 135l-45-65-123 46Z';
    art = `<path d="M87 490q20-193 193-193t193 193" fill="${mid}"/><path d="m205 300 75 80 75-80-25 190H230Z" fill="${light}"/><rect x="251" y="232" width="59" height="88" rx="20" fill="#be8974"/><ellipse cx="280" cy="175" rx="91" ry="112" fill="${index % 3 ? '#dfb294' : '#9f6c58'}"/><path d="${hair}" fill="${dark}"/><path d="M220 184h24m72 0h24m-73 60q13 9 29 0" stroke="${dark}" stroke-width="7" stroke-linecap="round"/><path d="m118 468 22-96m280 0 22 96" stroke="${light}" stroke-width="5"/><g transform="translate(347 289) scale(.36)">${symbol(motif, light, dark)}</g>`;
  }
  const lines = title.split(' '); let rows = [''];
  for (const word of lines) { if ((rows.at(-1) + word).length > 25) rows.push(''); rows[rows.length - 1] += `${word} `; }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750" role="img" aria-label="${escape(title)}">
  <defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="${dark}"/><stop offset="1" stop-color="${mid}"/></linearGradient><radialGradient id="halo"><stop stop-color="${light}" stop-opacity=".25"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></radialGradient></defs>
  <rect width="1200" height="750" fill="url(#bg)"/><circle cx="${index % 2 ? 900 : 780}" cy="310" r="490" fill="url(#halo)"/>${stars}
  <g fill="none" stroke="${light}" opacity=".12"><circle cx="870" cy="365" r="300"/><circle cx="870" cy="365" r="235"/><path d="M0 650h1200M50 0v750"/></g>
  <g transform="translate(${type === 'Character' ? 570 : 580} 115) scale(.95)">${art}</g>
  <text x="72" y="105" fill="${light}" font-family="Arial,sans-serif" font-size="18" letter-spacing="5">${escape(world.category.toUpperCase())} / ${escape(type.toUpperCase())}</text>
  <rect x="72" y="167" width="62" height="5" rx="2" fill="${light}"/>
  <text fill="#fff" font-family="Arial,sans-serif" font-size="${rows.length > 3 ? 38 : 43}" font-weight="700">${rows.map((line, n) => `<tspan x="72" y="${270 + n * 57}">${escape(line.trim())}</tspan>`).join('')}</text>
  <text x="72" y="${Math.max(510, 300 + rows.length * 57)}" fill="${light}" font-family="Arial,sans-serif" font-size="19">${escape(caption || world.fandom)}</text>
  <text x="72" y="687" fill="#fff" opacity=".65" font-family="Arial,sans-serif" font-size="14" letter-spacing="3">FAN HUB / ORIGINAL EDITORIAL ART</text></svg>`;
}

async function add(world, key, type, title, description, body, motif, extra = {}) {
  const slug = `${world.slug}-${key}`;
  const artworkWorld = { ...world, fandom: extra.fandom || world.fandom };
  await writeFile(new URL(`${slug}.svg`, output), illustration(artworkWorld, title, type, records.length, motif));
  const record = { key: slug, category: world.category, type, title, description, body, fandom: world.fandom,
    genre: type === 'Character' ? 'Original fiction' : type === 'Merchandise' ? 'Design concept' : 'Creative culture',
    tags: ['fanhub-editorial-v2', slug, world.slug, type.toLowerCase()], imageUrls: [`${base}/${slug}.svg`], featured: false, ...extra };
  records.push(record);
  return record;
}

for (const [index, world] of worlds.entries()) {
  for (const [n, article] of world.articles.entries()) {
    const [title, description, h1, p1, h2, p2] = article;
    await add(world, `guide-${n + 1}`, 'Article', title, description, `## ${h1}\n\n${p1}\n\n## ${h2}\n\n${p2}`, n ? ['moon', 'route', 'lantern', 'recorder', 'book', 'panels', 'ink', 'scissors'][index] : world.motif, { featured: n === 0 });
  }
  const [name, intro, origin, arc, prop] = world.character;
  await add(world, 'character', 'Character', name, intro, `## Origin\n\n${origin}\n\n## The choice that defines them\n\n${arc}\n\n## World notes\n\nAn original fictional character from ${world.fandom}. The portrait is an original stylized illustration.`, prop);
  const [galleryTitle, galleryDescription, scenes] = world.gallery;
  const gallery = await add(world, 'gallery', 'Image', galleryTitle, galleryDescription, scenes.map((s, n) => `## ${s}\n\n${galleryNotes[index][n]}`).join('\n\n'), world.motif);
  for (const [n, scene] of scenes.entries()) {
    const filename = `${world.slug}-plate-${n + 1}.svg`;
    const motifs = [['moon', 'lantern', 'telescope'], ['beacon', 'orbit', 'mat'], ['lighthouse', 'window', 'lighthouse'], ['screen', 'recorder', 'screen'], ['waveform', 'headphones', 'waveform'], ['lantern', 'route', 'panels'], ['boat', 'boat', 'bridge'], ['mask', 'cape', 'scissors']];
    await writeFile(new URL(filename, output), illustration(world, scene, 'Art study', index + n, motifs[index][n], `PLATE ${n + 1} / ${world.fandom}`));
    gallery.imageUrls.push(`${base}/${filename}`);
  }
  const [audioTitle, audioDescription, audioText] = world.audio;
  await add(world, 'voice', 'Audio', audioTitle, audioDescription, `## Transcript\n\n${audioText}\n\n## Recording note\n\nOriginal fictional writing with synthetic narration. This voice does not represent a real performer.`, ['telescope', 'robot', 'lighthouse', 'recorder', 'headphones', 'route', 'boat', 'scissors'][index], { mediaUrl: `${base}/${world.slug}-voice.mp3` });
  narration.push({ key: `${world.slug}-voice`, text: audioText, voice: index % 2 ? 'Microsoft David Desktop' : 'Microsoft Zira Desktop', video: false });
  const [videoTitle, videoDescription, videoText] = world.video;
  await add(world, 'film', 'Video', videoTitle, videoDescription, `## Watch for\n\n${videoDescription} The animated artwork and spoken explanation were created for this collection.\n\n## Narration transcript\n\n${videoText}\n\n## Credits\n\nOriginal editorial illustrations and writing; synthetic narration. No commercial footage or music is used.`, world.motif, { mediaUrl: `${base}/${world.slug}-film.mp4` });
  narration.push({ key: `${world.slug}-film`, text: videoText, voice: index % 2 ? 'Microsoft Zira Desktop' : 'Microsoft David Desktop', video: true, plates: scenes.map((_, n) => `${world.slug}-plate-${n + 1}`) });
  const [productTitle, productDescription, productBody, productMotif] = world.product;
  await add(world, 'design', 'Merchandise', productTitle, productDescription, `## Design notes\n\n${productBody}\n\n## Collection\n\nA display-only design from ${world.fandom}.`, productMotif);
}

// Verified official event/release dates; images are our own editorial illustrations.
const eventInfo = [
  [5, 'nycc-2026', 'New York Comic Con 2026', 'Four days of comics and pop-culture programming at the Javits Center in New York.', 'New York', 'Javits Center', 40.7578, -74.0021, '2026-10-08T04:00:00Z', '2026-10-12T03:59:00Z', 'https://www.newyorkcomiccon.com/'],
  [7, 'mcm-london-2026', 'MCM London Comic Con — October 2026', 'A London convention bringing fans, creators and cosplay communities together at ExCeL.', 'London', 'ExCeL London', 51.5081, 0.0295, '2026-10-22T23:00:00Z', '2026-10-25T23:59:00Z', 'https://www.mcmcomiccon.com/london/en-us.html'],
];
for (const [i, key, title, description, city, venue, latitude, longitude, startsAt, endsAt, source] of eventInfo) {
  await add(worlds[i], key, 'Event', title, description, `## Plan your visit\n\n${description} The listing covers the announced convention dates, not daily admission hours. Check the organizer for tickets, accessibility arrangements, opening times and programme changes before travelling.\n\n## Official information\n\n${source}\n\nVerified on 26 September 2026. The cover is an original editorial illustration, not an event photograph.`, worlds[i].motif,
    { fandom: title.split(' — ')[0], genre: 'Convention', city, venue, latitude, longitude, startsAt, endsAt, ticketUrl: source });
}
await add(worlds[1], 'gta-vi', 'Release', 'Grand Theft Auto VI — release watch', 'Rockstar lists 19 November 2026 for its next Grand Theft Auto release.', '## Announced release\n\nThe official Rockstar page lists 19 November 2026. Visit the publisher for platform, edition and availability information; dates may change.\n\n## Publisher\n\nhttps://www.rockstargames.com/VI\n\nChecked on 26 September 2026. The cover is an independent editorial illustration, not official game art.', 'controller', { fandom: 'Grand Theft Auto', genre: 'Action adventure', releaseDate: '2026-11-19T00:00:00Z' });
await add(worlds[2], 'avengers-doomsday', 'Release', 'Avengers: Doomsday — cinema calendar', 'Disney lists the theatrical release for 18 December 2026.', '## On the calendar\n\nDisney’s official movie page lists 18 December 2026 for the theatrical release. Local cinema schedules and ticket availability should be checked separately.\n\n## Official movie page\n\nhttps://movies.disney.com/avengers-doomsday\n\nChecked on 26 September 2026. The cover is an independent editorial illustration, not an official poster.', 'film', { fandom: 'Marvel', genre: 'Superhero', releaseDate: '2026-12-18T00:00:00Z' });

for (const field of ['key', 'title', 'description', 'body']) {
  if (new Set(records.map(r => r[field])).size !== records.length) throw new Error(`Duplicate ${field}`);
}
await writeFile(new URL('../data/editorial-content.json', import.meta.url), JSON.stringify(records, null, 2) + '\n');
await writeFile(new URL('./narration.json', import.meta.url), JSON.stringify(narration, null, 2) + '\n');
console.log(`Built ${records.length} distinct content records with original illustrations and ${narration.length} narration scripts.`);
