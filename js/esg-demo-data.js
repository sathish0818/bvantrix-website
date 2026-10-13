/* ============================================================================
   BVANTRIX — ESG demo content.

   THIS IS THE ONLY FILE TO EDIT when the questions change. The engine in
   esg-demo.js reads it and never hard-codes a question, a weight or a label.

   SCHEMA
   ------
   dimensions[]   id, name, short, blurb
   questions[]    id, dim, text, help, frameworks[], weight, options[]
                  options[]  label, value (0-4), note?
                  Every question must also offer a "don't know" option with
                  value: null — those do not score, they lower confidence,
                  which is the honest way to handle a gap.
   decision       the worked example shown after the score
   ============================================================================ */

window.ESG_DEMO = {

  /* ── The six dimensions a score is built from ───────────────────────── */
  dimensions: [
    { id: 'climate',  name: 'Climate & emissions',     short: 'Climate',
      blurb: 'What you emit, what you measure, and whether anyone has checked.' },
    { id: 'resource', name: 'Resources & circularity', short: 'Resources',
      blurb: 'Energy, water, waste and what happens to an asset at end of life.' },
    { id: 'people',   name: 'People & workforce',      short: 'People',
      blurb: 'Safety, pay, turnover and the conditions your decisions set.' },
    { id: 'supply',   name: 'Community & supply chain',short: 'Supply chain',
      blurb: 'How far your visibility reaches past your own four walls.' },
    { id: 'govern',   name: 'Governance & ethics',     short: 'Governance',
      blurb: 'Who is accountable, and what happens when something goes wrong.' },
    { id: 'data',     name: 'Data & disclosure',       short: 'Disclosure',
      blurb: 'Whether the numbers you report could survive an auditor.' }
  ],

  /* ── 15 scored questions ────────────────────────────────────────────
     PLACEHOLDER CONTENT — written to exercise the engine. Replace the
     text, help, frameworks and options with the real set; keep the shape. */
  questions: [
    { id: 'q1', dim: 'climate', weight: 1.2,
      text: 'Do you measure Scope 1 and Scope 2 emissions?',
      help: 'Scope 1 is what you burn. Scope 2 is the electricity you buy.',
      frameworks: ['BRSR P6', 'GRI 305', 'ISSB S2'],
      options: [
        { label: 'Both, verified by a third party', value: 4 },
        { label: 'Both, self-reported',             value: 3 },
        { label: 'One of the two',                  value: 2 },
        { label: 'Estimated, not measured',         value: 1 },
        { label: 'Not measured',                    value: 0 },
        { label: "I don't know",                    value: null }
      ] },

    { id: 'q2', dim: 'climate', weight: 1.0,
      text: 'Is there a reduction target with a date attached?',
      help: 'A target without a date is an intention.',
      frameworks: ['BRSR P6', 'ISSB S2'],
      options: [
        { label: 'Yes, externally validated',   value: 4 },
        { label: 'Yes, board-approved',         value: 3 },
        { label: 'Yes, informal',               value: 2 },
        { label: 'In discussion',               value: 1 },
        { label: 'No target',                   value: 0 },
        { label: "I don't know",                value: null }
      ] },

    { id: 'q3', dim: 'climate', weight: 0.8,
      text: 'Does carbon cost appear in capital decisions?',
      help: 'An internal carbon price, or carbon in the business case.',
      frameworks: ['ISSB S2', 'GRI 201-2'],
      options: [
        { label: 'Yes, a priced input in every case', value: 4 },
        { label: 'Yes, for large projects only',      value: 3 },
        { label: 'Considered, not quantified',        value: 2 },
        { label: 'Occasionally raised',               value: 1 },
        { label: 'Not considered',                    value: 0 },
        { label: "I don't know",                      value: null }
      ] },

    { id: 'q4', dim: 'resource', weight: 1.0,
      text: 'Do you track energy use by site or asset?',
      help: 'Per-asset beats per-company for deciding anything.',
      frameworks: ['BRSR P6', 'GRI 302'],
      options: [
        { label: 'Per asset, continuously',  value: 4 },
        { label: 'Per site, monthly',        value: 3 },
        { label: 'Per site, annually',       value: 2 },
        { label: 'Company total only',       value: 1 },
        { label: 'Not tracked',              value: 0 },
        { label: "I don't know",             value: null }
      ] },

    { id: 'q5', dim: 'resource', weight: 0.9,
      text: 'Is end-of-life planned when an asset is bought?',
      help: 'Disposal, resale, refurbishment or recovery.',
      frameworks: ['GRI 306', 'BRSR P2'],
      options: [
        { label: 'Always, with a recovery route',  value: 4 },
        { label: 'For major assets',               value: 3 },
        { label: 'Sometimes',                      value: 2 },
        { label: 'Only when disposal comes up',    value: 1 },
        { label: 'Never',                          value: 0 },
        { label: "I don't know",                   value: null }
      ] },

    { id: 'q6', dim: 'resource', weight: 0.7,
      text: 'Do you measure water withdrawal in stressed areas?',
      help: 'Only counts if you know which of your sites are stressed.',
      frameworks: ['BRSR P6', 'GRI 303'],
      options: [
        { label: 'Yes, by site, against local stress', value: 4 },
        { label: 'Yes, by site',                       value: 3 },
        { label: 'Company total only',                 value: 2 },
        { label: 'Estimated',                          value: 1 },
        { label: 'Not measured',                       value: 0 },
        { label: "I don't know",                       value: null }
      ] },

    { id: 'q7', dim: 'people', weight: 1.1,
      text: 'Are safety incidents recorded and acted on?',
      help: 'Recording without a closure loop is just a log.',
      frameworks: ['BRSR P3', 'GRI 403'],
      options: [
        { label: 'Recorded, investigated, closed out', value: 4 },
        { label: 'Recorded and investigated',          value: 3 },
        { label: 'Recorded only',                      value: 2 },
        { label: 'Serious incidents only',             value: 1 },
        { label: 'Not systematically',                 value: 0 },
        { label: "I don't know",                       value: null }
      ] },

    { id: 'q8', dim: 'people', weight: 0.9,
      text: 'Do you know your voluntary turnover by function?',
      help: 'The aggregate number hides where the problem is.',
      frameworks: ['BRSR P3', 'GRI 401'],
      options: [
        { label: 'By function and reason',  value: 4 },
        { label: 'By function',             value: 3 },
        { label: 'Company-wide only',       value: 2 },
        { label: 'Roughly',                 value: 1 },
        { label: 'Not tracked',             value: 0 },
        { label: "I don't know",            value: null }
      ] },

    { id: 'q9', dim: 'people', weight: 0.8,
      text: 'Is workforce impact assessed before operational change?',
      help: 'Before a shift pattern, a site move, an automation project.',
      frameworks: ['BRSR P3', 'GRI 402'],
      options: [
        { label: 'Always, formally',     value: 4 },
        { label: 'For major change',     value: 3 },
        { label: 'Informally',           value: 2 },
        { label: 'Rarely',               value: 1 },
        { label: 'Never',                value: 0 },
        { label: "I don't know",         value: null }
      ] },

    { id: 'q10', dim: 'supply', weight: 1.0,
      text: 'How far into your supply chain can you see?',
      help: 'Tier 1 is your suppliers. Tier 2 is theirs.',
      frameworks: ['BRSR P2', 'GRI 308', 'ISSB S1'],
      options: [
        { label: 'Tier 2 and beyond, with data', value: 4 },
        { label: 'Tier 1 with data, Tier 2 named', value: 3 },
        { label: 'Tier 1 with data',             value: 2 },
        { label: 'Tier 1 named only',            value: 1 },
        { label: 'No visibility',                value: 0 },
        { label: "I don't know",                 value: null }
      ] },

    { id: 'q11', dim: 'supply', weight: 0.8,
      text: 'Are suppliers screened on environmental and social criteria?',
      help: 'At onboarding, and then again afterwards.',
      frameworks: ['BRSR P2', 'GRI 414'],
      options: [
        { label: 'At onboarding and reassessed',  value: 4 },
        { label: 'At onboarding',                 value: 3 },
        { label: 'Major suppliers only',          value: 2 },
        { label: 'Ad hoc',                        value: 1 },
        { label: 'Not screened',                  value: 0 },
        { label: "I don't know",                  value: null }
      ] },

    { id: 'q12', dim: 'govern', weight: 1.2,
      text: 'Who owns ESG outcomes?',
      help: 'Ownership means consequences, not a job title.',
      frameworks: ['BRSR P1', 'GRI 2-13', 'ISSB S1'],
      options: [
        { label: 'Board, with it in executive pay', value: 4 },
        { label: 'Board committee',                 value: 3 },
        { label: 'A named executive',               value: 2 },
        { label: 'Shared, unclear',                 value: 1 },
        { label: 'Nobody specific',                 value: 0 },
        { label: "I don't know",                    value: null }
      ] },

    { id: 'q13', dim: 'govern', weight: 0.9,
      text: 'Can you reconstruct why a major decision was made?',
      help: 'Inputs, alternatives considered, who approved it.',
      frameworks: ['GRI 2-12', 'ISSB S1'],
      options: [
        { label: 'Yes, with the evidence behind it', value: 4 },
        { label: 'Yes, the decision and approver',   value: 3 },
        { label: 'Partially',                        value: 2 },
        { label: 'Only for the largest',             value: 1 },
        { label: 'No',                               value: 0 },
        { label: "I don't know",                     value: null }
      ] },

    { id: 'q14', dim: 'data', weight: 1.1,
      text: 'Could your reported numbers survive an audit?',
      help: 'Traceable to a source, with the method written down.',
      frameworks: ['BRSR', 'ISSB S1'],
      options: [
        { label: 'Already externally assured',     value: 4 },
        { label: 'Traceable, not yet assured',     value: 3 },
        { label: 'Mostly traceable',               value: 2 },
        { label: 'Rebuilt each year by hand',      value: 1 },
        { label: 'No, and we know it',             value: 0 },
        { label: "I don't know",                   value: null }
      ] },

    { id: 'q15', dim: 'data', weight: 1.0,
      text: 'How long does it take to answer a new ESG question?',
      help: 'From a regulator, an investor or a customer.',
      frameworks: ['BRSR', 'ISSB S1'],
      options: [
        { label: 'Hours — the data is queryable', value: 4 },
        { label: 'Days',                          value: 3 },
        { label: 'A week or two',                 value: 2 },
        { label: 'Over a month',                  value: 1 },
        { label: 'We often cannot',               value: 0 },
        { label: "I don't know",                  value: null }
      ] }
  ],

  /* ── Step 2: context. Unscored — it frames the result. ──────────────── */
  profile: [
    { id: 'sector', label: 'Sector',
      options: ['Manufacturing', 'Energy & utilities', 'Infrastructure',
                'Financial services', 'IT & services', 'Other'] },
    { id: 'size', label: 'People',
      options: ['Under 500', '500 – 5,000', '5,000 – 20,000', 'Over 20,000'] },
    { id: 'reporting', label: 'ESG reporting today',
      options: ['BRSR filed', 'Voluntary report', 'Preparing the first one',
                'Not reporting yet'] }
  ],

  /* ── Step 6: the worked decision ────────────────────────────────────── */
  decision: {
    question: 'A production asset is nearing end of life. What should you do?',
    context: 'Twelve years old. Rising maintenance. Still within tolerance.',
    /* criteria are weighted by the visitor's own dimension scores — the
       weakest dimension becomes the heaviest consideration */
    criteria: [
      { id: 'financial',  label: 'Financial impact',   dim: null },
      { id: 'carbon',     label: 'Carbon impact',      dim: 'climate' },
      { id: 'resourceUse',label: 'Resource use',       dim: 'resource' },
      { id: 'people',     label: 'People impact',      dim: 'people' },
      { id: 'compliance', label: 'Compliance exposure',dim: 'govern' },
      { id: 'evidence',   label: 'Evidence trail',     dim: 'data' }
    ],
    options: [
      { id: 'replace', label: 'Replace',
        summary: 'New asset, highest capital outlay, best efficiency.',
        scores: { financial: 2, carbon: 4, resourceUse: 2, people: 3, compliance: 4, evidence: 3 },
        notes: {
          financial: 'Largest outlay now; lowest running cost later.',
          carbon: 'Cuts operating emissions sharply, but embodied carbon lands this year.',
          resourceUse: 'The old asset has to go somewhere.',
          people: 'Retraining required; safer to operate.',
          compliance: 'Clears the standard well beyond the current threshold.',
          evidence: 'A clean baseline from day one.'
        } },
      { id: 'maintain', label: 'Maintain',
        summary: 'Keep running, absorb rising maintenance.',
        scores: { financial: 3, carbon: 1, resourceUse: 3, people: 2, compliance: 1, evidence: 2 },
        notes: {
          financial: 'Cheapest today. The curve is against you.',
          carbon: 'Efficiency keeps degrading.',
          resourceUse: 'Nothing new consumed, nothing disposed.',
          people: 'More unplanned work, more exposure.',
          compliance: 'Closest to the threshold if it tightens.',
          evidence: 'History exists but is scattered.'
        } },
      { id: 'upgrade', label: 'Upgrade',
        summary: 'Retrofit the critical components.',
        scores: { financial: 4, carbon: 3, resourceUse: 4, people: 3, compliance: 3, evidence: 3 },
        notes: {
          financial: 'Middle outlay, most of the benefit.',
          carbon: 'Most of the efficiency gain, little embodied carbon.',
          resourceUse: 'Keeps the chassis, replaces the worn parts.',
          people: 'Shorter shutdown than replacement.',
          compliance: 'Clears the current standard with headroom.',
          evidence: 'Partial baseline; the retrofit is documented.'
        } }
    ]
  },

  /* ── How the number is arrived at ───────────────────────────────────── */
  scoring: {
    max: 4,
    /* confidence falls with every unanswered or unknown question */
    confidence: [
      { minAnswered: 0.95, label: 'Good',     note: 'Enough answered to be worth acting on.' },
      { minAnswered: 0.75, label: 'Moderate', note: 'Indicative. The gaps below are the ones to close.' },
      { minAnswered: 0.00, label: 'Low',      note: 'Too many unknowns to treat this as a measurement.' }
    ],
    bands: [
      { min: 80, label: 'Decision-ready',  note: 'Your data could carry a decision today.' },
      { min: 60, label: 'Reporting-ready', note: 'You can report. Deciding with it is harder.' },
      { min: 40, label: 'Partial',         note: 'Strong in places, blind in others.' },
      { min: 20, label: 'Early',           note: 'The foundations are being laid.' },
      { min: 0,  label: 'Starting',        note: 'Most of this is still to build.' }
    ]
  }
};
