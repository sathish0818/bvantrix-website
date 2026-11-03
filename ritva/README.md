# RITVA

An ESG Intelligence Platform, powered by BVANTRIX Pvt Ltd.

Built from `RITVA_Website_Implementation_Brief.docx` (approved copy, UI/UX
direction and development requirements) with the supplied reference design as
the visual guide.

```
ritva/
  index.html        the whole site, one page
  css/ritva.css     tokens, layout, responsive rules
  js/ritva.js       phone menu, light entrances, enquiry form
```

Images come from `../assets/`, which already holds the licensed photographs
and their credits in `credits.json`.

## What the brief asked for, and where it is

| Brief | Where |
|---|---|
| Hero, wordmark dominant, tagline as headline | `.hero` |
| Three dimensions: Earth, People, Governance | `.band` |
| About RITVA | `#about` |
| How it works, four steps | `#how` |
| Why RITVA, five values | `#why` |
| Insights, five categories | `#insights` |
| Contact, five fields | `#contact` |
| Final call to action, dark field, gold button | `.close-cta` |
| Footer, About BVANTRIX plus slim legal strip | `.foot` |

Copy is the approved copy. Where the brief wrote a label and a description
joined by a dash, the two are separate elements here instead, which reads the
same and sets better.

## Decisions worth knowing

**The assessment is not built.** The brief's section 7 describes a seven step
journey, and section 8 says that if the assessment is not fully integrated at
launch, the site should use a clearly identified enquiry flow rather than a
dead assessment button. So every `Assess your ESG maturity` button goes to the
enquiry form, which is honest about what happens next. Building the assessment
itself is the next piece of work.

**Form delivery is not wired.** `RITVA_ENDPOINT` at the top of `js/ritva.js`
is empty, so the form falls back to the visitor's own mail application. Paste a
form endpoint there and it posts properly instead. Until then, a visitor
without a mail client cannot reach you through the form.

**One photograph, not eight.** The brief asks for business, manufacturing,
healthcare, logistics, retail and technology imagery. The only photographs in
hand are industrial and all properly licensed, so the page uses one rather than
padding it with pictures that fight the brief's own guardrails. The industries
strip in the reference design is not built for the same reason: it needs eight
licensed images.

**Nothing is invented.** No customer logos, testimonials, impact figures,
certifications, statistics or regulatory claims appear anywhere, per guardrail
7. The product dashboard in the reference design is not reproduced, because the
numbers on it would be invented and read as real.

**Privacy and Terms are not written.** Those two footer links currently point
at the contact section. They need real pages before launch, and the brief's
data responsibility note applies: publish only security, hosting and retention
claims that are true.

## Checked

- WCAG AA contrast on every text style, measured in the browser: 15 of 15 pass.
- No horizontal scroll, overflow, clipped text or undersized tap target at
  320, 375, 414, 600, 768, 920, 1024, 1366, 1440, 1920 or 2671px wide.
- Form validation blocks an empty submit and a malformed email, marks the
  fields, and moves focus to the first one that needs attention.
- Headings run h1 then h2 then h3 with one h1 on the page.

## House style

`taste-skill-ignore` comments mark the places where the approved reference
design deliberately uses a pattern the in-house linter rejects: section labels
above headings, numbered steps, and divider rules. The brief specifies all
three. Everything else the linter flags has been fixed.
