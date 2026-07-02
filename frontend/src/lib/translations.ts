export type Lang = 'en' | 'de';

const en = {
	// META
	page_title: 'ShutUP Forwarder — AI-Powered Car Transport',
	page_desc:
		'Take a photo of your car, tell us where it needs to go. Our AI finds a driver, negotiates the price, tracks the journey, and protects you if anything goes wrong.',

	// NAV
	nav_how: 'How it works',
	nav_step: 'Step by step',
	nav_features: 'Features',
	nav_screens: 'Screens',
	nav_faq: 'FAQ',
	nav_drivers: 'For Drivers',
	nav_signin: 'Sign in',
	nav_quote: 'Get a quote',
	nav_trips_board: 'Trips Board',
	nav_manage_team: 'Manage Team',
	nav_driver_requests: 'Driver Requests',
	nav_available_loads: 'Available Loads',
	nav_my_trips: 'My Trips',
	nav_book_service: 'Book a Service',

	// HERO
	hero_badge: '✦ Now with AI negotiation',
	hero_h1_1: 'Your car, transported.',
	hero_h1_2: 'Zero stress.',
	hero_sub:
		'Snap a photo, drop a pin. Our AI finds a verified driver, locks in the best price, and watches over your car from pickup to delivery — with a photo record that protects you if anything goes wrong.',
	hero_cta_primary: 'Get an instant quote →',
	hero_cta_secondary: 'See how it works',
	hero_trust_rating: '4.8 · 2 000+ transports',
	hero_trust_photos: '📷 Photos locked at pickup',
	hero_trust_ai: '🤖 AI negotiates for you',
	hero_trust_europe: '🇪🇺 All of Europe covered',

	// Phone mockup (hero)
	phone_job: 'Job #SF-4821',
	phone_route: 'Amsterdam → Munich',
	phone_car: 'BMW 3 Series · 2019',
	phone_collected: '✅ Car collected · Thu 09:00',
	phone_departed: '✅ Departed Netherlands',
	phone_active: '◉ Cologne — on schedule',
	phone_future: '○ Munich · Est. Sat 09:00',
	phone_driver: '🚛 Pieter van Dam',

	// HOW IT WORKS
	how_label: 'Simple process',
	how_title: 'From photo to delivery in 3 steps',
	how_sub: 'You do three things. The AI does the rest.',
	step1_title: 'Submit your car',
	step1_desc:
		"Fill in your car's details, snap photos of every angle (our AI spots existing damage instantly), and enter pickup and delivery addresses.",
	step2_title: 'AI finds you a driver',
	step2_desc:
		'We broadcast your job to verified drivers. Our AI evaluates bids and negotiates the best price for you — usually within 3 hours.',
	step3_title: 'Track, receive, accept',
	step3_desc:
		"Follow your car live. At delivery, our AI compares before-and-after photos. If nothing changed, tap Accept. If there's damage, we handle the insurance claim.",

	// FEATURES
	features_label: 'Why us',
	features_title: 'Everything handled for you',
	features_sub: 'Not a form that sends you emails. A system that actually does the work.',
	feat1_title: 'AI price negotiation',
	feat1_desc:
		"Our AI negotiates on your behalf in real time. It knows what a fair price looks like for every route in Europe and won't budge past your budget.",
	feat2_title: 'Locked photo evidence',
	feat2_desc:
		"Three immutable photo sets — yours at submission, driver's at pickup, driver's at delivery. No one can alter them. You're always protected.",
	feat3_title: 'Live tracking',
	feat3_desc:
		'Know exactly where your car is at any time. Automatic status updates via WhatsApp, email, or push — no chasing needed.',
	feat4_title: 'Instant damage detection',
	feat4_desc:
		"AI compares before and after photos pixel by pixel. New scratches don't slip through. Every difference is flagged with photo evidence attached.",
	feat5_title: 'Insurance claim handled',
	feat5_desc:
		"If damage is detected, our AI drafts the claim with all evidence. A qualified adjuster reviews it — you don't deal with the insurer yourself.",
	feat6_title: 'Compliance built in',
	feat6_desc:
		'Cross-border paperwork (CMR waybills, customs forms, power of attorney) is checked automatically before your job is dispatched.',

	// PROTECTION
	prot_label: 'Evidence chain',
	prot_title: 'Your car is protected at every handover',
	prot_sub: 'Three locked photo sets create an unbreakable record — before, during, and after.',
	ev1_title: 'You upload',
	ev1_desc: 'All sides + existing damage noted by AI at submission',
	ev2_title: 'Driver at pickup',
	ev2_desc: 'Mandatory photo set before loading. Cannot proceed without it.',
	ev3_title: 'Driver at delivery',
	ev3_desc: 'Full photo set at destination before handover.',
	ev4_title: 'AI compares all 3',
	ev4_desc: 'Any new damage is caught, documented, and flagged automatically.',
	prot_note_strong: 'Important:',
	prot_note:
		"The AI's damage report is advisory. A qualified human insurance adjuster always reviews any claim before it is filed. No automated liability decisions.",

	// FOR WHO
	who_label: "Who it's for",
	who_title: 'For individuals and businesses',
	ind_title: 'Individuals',
	ind_li1: 'Bought a car abroad and need it home',
	ind_li2: 'Moving and want your car to follow',
	ind_li3: 'Sending a car to a holiday home',
	ind_li4: 'Non-running or classic car transport',
	ind_cta: 'Get a personal quote',
	biz_badge: 'Popular for businesses',
	biz_title: 'Businesses',
	biz_li1: 'Car dealers moving stock between locations',
	biz_li2: 'Fleet operators relocating vehicles',
	biz_li3: 'Rental companies balancing depots',
	biz_li4: 'Wholesalers with regular transport needs',
	biz_cta: 'Get a business quote',

	// DRIVERS
	drv_label: 'Are you a driver?',
	drv_title: 'Join the forwarder network',
	drv_sub:
		'Get a real-time feed of available jobs on your routes. Accept at posted rates or counter-bid. Get paid fast. Build your rating.',
	drv_li1: '✅ Jobs matched to your active routes',
	drv_li2: '✅ One-tap accept or counter-bid',
	drv_li3: '✅ Clear pickup & delivery instructions',
	drv_li4: '✅ Fast payout after delivery confirmation',
	drv_li5: '✅ Rating system that rewards reliability',
	drv_cta: 'Apply as a driver',
	drv_jobs: 'Available Jobs',

	// JOURNEY
	jour_label: 'End to end',
	jour_title: 'The complete picture',
	jour_sub:
		'From the moment you submit your car to the moment you accept delivery — every step is handled.',

	// STEP BY STEP
	sbs_label: 'Detailed walkthrough',
	sbs_title: 'What happens at each stage',
	s1_num: 'Step 1',
	s1_title: 'You fill in a simple form',
	s1_desc:
		"You tell us about your car and where it needs to go. The app walks you through it in five screens. The AI reads your chassis number automatically — just point the camera at it — and <strong>immediately highlights any existing scratches or dents</strong> as you upload photos.",
	s2_num: 'Step 2',
	s2_title: 'AI finds you a driver',
	s2_desc:
		"You don't contact anyone. The AI broadcasts your job to our verified driver network and handles all negotiation. It knows what a fair price looks like for every route in Europe — it won't accept too high, and it protects drivers from being pushed unfairly low.",
	s3_num: 'Step 3',
	s3_title: 'Your car is collected',
	s3_desc:
		'The driver arrives at your pickup address. Before loading the car, they take a <strong>mandatory set of photos</strong> through the app — all sides, dashboard, odometer. These are locked immediately and cannot be edited by anyone. This protects both you and the driver. Everyone agrees on the car\'s exact condition before it moves.',
	s4_num: 'Step 4',
	s4_title: 'Your car is in transit',
	s4_desc:
		'Follow your car live. The AI sends automatic updates via WhatsApp, email, or push at every milestone. If anything unexpected happens — delay, route change, driver goes silent — the AI alerts you and the team.',
	s5_num: 'Step 5',
	s5_title: 'Delivery & damage check',
	s5_desc:
		'At the destination, the driver takes another full photo set. The AI compares them against the pickup photos automatically. Any new damage is flagged with photo evidence. A human insurance adjuster — not an algorithm — reviews every claim before it is filed.',
	s6_num: 'Step 6',
	s6_title: 'You accept or dispute',
	s6_desc:
		'You get a delivery summary with all photos. <strong>Everything looks good?</strong> Tap "Accept" — job complete. <strong>Something isn\'t right?</strong> Tap "Dispute" — a team member reviews it with the full photo and log trail on hand.',

	// WHO IS INVOLVED
	agents_label: 'People & AI',
	agents_title: 'Who is involved — and who does what',
	agents_sub: 'AI handles speed and scale. Humans handle trust and liability.',
	roles_who: 'Who',
	roles_what: 'What they do',
	role_customer: 'You (Customer)',
	role_customer_desc: 'Submit the job, track progress, accept or dispute delivery',
	role_driver: 'Driver / Forwarder',
	role_driver_desc: 'Pick up and deliver the car, take photos at both ends',
	role_ops: 'Operations Manager',
	role_ops_desc: 'Steps in when price negotiations stall or something unusual happens',
	role_adjuster: 'Insurance Adjuster',
	role_adjuster_desc:
		'Reviews any damage claim the AI drafts before it goes to the insurer',
	role_admin: 'Platform Admin',
	role_admin_desc: 'Keeps the system running, vets drivers, manages content',

	// SCREENS
	screens_label: 'App screens',
	screens_title: 'What the app looks like',
	screens_sub:
		'Every screen is designed around one principle: make the right action obvious and everything else automatic.',
	tab_customer: 'Customer App',
	tab_driver: 'Driver App',
	tab_ops: 'Ops Dashboard',
	sc1_label: 'Screen 1 — Vehicle Details',
	sc1_note: 'AI reads the VIN from a camera scan — no typing required.',
	sc2_label: 'Screen 2 — Photo Upload',
	sc2_note: 'AI annotates damage in real time as each photo uploads.',
	sc3_label: 'Screen 3 — Transport Details',
	sc3_note: 'Address autocomplete powered by Google Maps. Compliance checked automatically.',
	sc4_label: 'Screen 4 — AI Working',
	sc4_note: 'Live progress — you see exactly what the AI is doing.',
	sc5_label: 'Screen 5 — Live Tracking',
	sc5_note: 'Real-time progress + direct contact with your driver.',
	sc6_label: 'Screen 6 — Delivery Report',
	sc6_note: 'Side-by-side before/after photos. One tap to accept.',
	sc7_label: 'Screen 7 — Job Feed',
	sc7_note: 'Real-time job feed matched to your registered route network.',
	sc8_label: 'Screen 8 — Pickup Confirmation',
	sc8_note: 'The confirm button stays locked until every required photo is taken.',
	sc_ops_label: 'Operations Manager Dashboard',
	sc_ops_note:
		'The AI surfaces only the jobs that genuinely need a human decision. Everything else runs automatically.',

	// FAQ
	faq_label: 'Questions',
	faq_title: 'Frequently asked questions',
	faq_q1: 'Do I need to be there when the car is collected?',
	faq_a1:
		"Not necessarily — you just need to ensure the driver can access the vehicle. The app coordinates the handover details and the driver takes the mandatory photo set before loading.",
	faq_q2: "What if my car doesn't run?",
	faq_a2:
		'Note it in the form. Drivers who can handle non-running vehicles will see the job, and the price will reflect the extra equipment required.',
	faq_q3: 'How long does transport take?',
	faq_a3:
		'Within a country: usually 1–3 days. Across Europe: typically 5–10 working days depending on distance and route.',
	faq_q4: "What if I disagree with the AI's damage assessment?",
	faq_a4:
		'Tap "Dispute." A human team member reviews the full evidence trail — all three photo sets and the audit log — and makes the final call. The AI\'s report is advisory, never final.',
	faq_q5: 'Is my car insured during transport?',
	faq_a5:
		"The driver's carrier liability covers the vehicle during transit. Our AI-assisted photo record ensures any new damage is documented, evidence-backed, and claimable.",
	faq_q6: 'How does the AI negotiate the price?',
	faq_a6:
		"The AI broadcasts your job to matching drivers, evaluates their bids against historical pricing data for your route, and negotiates within bounds set by our Operations Manager. It cannot agree to a price above your budget or below the driver's minimum — if no deal is reached, a human steps in.",

	// TESTIMONIALS
	test_label: 'Reviews',
	test_title: 'What customers say',
	test1_text:
		'"I bought a BMW in Belgium and needed it delivered to Hamburg. The AI found a driver within 2 hours, the price was fair, and I tracked everything live. Arrived without a single new scratch."',
	test1_author: '— Luc L., private buyer',
	test2_text:
		'"We move 20–30 vehicles a month between our dealerships. ShutUP Forwarder cut our coordination time by 80%. The photo evidence system alone is worth it — disputes basically don\'t happen anymore."',
	test2_author: '— Steven V., car dealer',
	test3_text:
		'"My classic Triumph needed moving from Finland to Belgium. I was nervous. The team kept me informed every step, the driver was fantastic, and delivery photos confirmed no issues. Couldn\'t ask for more."',
	test3_author: '— Wouter V., classic car owner',

	// QUOTE CTA
	cta_title: 'Ready to move your car?',
	cta_sub: "Tell us about your car and route. We'll handle everything else.",
	quote_pickup_label: 'Pickup address',
	quote_pickup_ph: 'e.g. Amsterdam, Netherlands',
	quote_delivery_label: 'Delivery address',
	quote_delivery_ph: 'e.g. Munich, Germany',
	quote_car_label: 'Car make & model',
	quote_car_ph: 'e.g. BMW 3 Series 2019',
	quote_email_label: 'Your email',
	quote_email_ph: 'you@example.com',
	quote_btn: 'Get my quote →',
	quote_submitted: '✅ Request received!',
	quote_note: 'Account needed. Quote in under 3 hours. No spam.',

	// FOOTER
	footer_tagline: 'AI-powered car transport across Europe. Fast, fair, fully tracked.',
	footer_platform: 'Platform',
	footer_how: 'How it works',
	footer_features: 'Features',
	footer_protection: 'Car protection',
	footer_business: 'For businesses',
	footer_drivers: 'For drivers',
	footer_routes: 'Routes',
	footer_nl: 'Netherlands',
	footer_de: 'Germany',
	footer_be: 'Belgium',
	footer_fr: 'France',
	footer_eu: 'All of Europe',
	footer_company: 'Company',
	footer_about: 'About us',
	footer_blog: 'Blog',
	footer_careers: 'Careers',
	footer_contact: 'Contact',
	footer_legal: 'Legal',
	footer_tos: 'Terms of service',
	footer_privacy: 'Privacy policy',
	footer_cookies: 'Cookie policy',
	footer_cmr: 'CMR Convention',
	footer_copyright: '© 2026 ShutUP Forwarder. All rights reserved.',
	footer_built: 'Built with the Vercel AI SDK'
};

export type Translations = Record<keyof typeof en, string>;

const de: Translations = {
	// META
	page_title: 'ShutUP Forwarder — KI-gestützter Autotransport',
	page_desc:
		'Machen Sie ein Foto von Ihrem Auto und sagen Sie uns, wohin es soll. Unsere KI findet einen Fahrer, verhandelt den Preis, verfolgt die Route und schützt Sie, falls etwas schiefgeht.',

	// NAV
	nav_how: 'Wie es funktioniert',
	nav_step: 'Schritt für Schritt',
	nav_features: 'Funktionen',
	nav_screens: 'App-Screens',
	nav_faq: 'FAQ',
	nav_drivers: 'Für Fahrer',
	nav_signin: 'Anmelden',
	nav_quote: 'Angebot erhalten',
	nav_trips_board: 'Fahrtenübersicht',
	nav_manage_team: 'Team verwalten',
	nav_driver_requests: 'Fahreranfragen',
	nav_available_loads: 'Verfügbare Ladungen',
	nav_my_trips: 'Meine Fahrten',
	nav_book_service: 'Service buchen',

	// HERO
	hero_badge: '✦ Jetzt mit KI-Verhandlung',
	hero_h1_1: 'Ihr Auto, transportiert.',
	hero_h1_2: 'Ohne Stress.',
	hero_sub:
		'Foto machen, Zielort angeben. Unsere KI findet einen verifizierten Fahrer, sichert den besten Preis und überwacht Ihr Auto von der Abholung bis zur Lieferung – mit einem Fotobeweis, der Sie schützt, falls etwas schiefgeht.',
	hero_cta_primary: 'Sofortangebot erhalten →',
	hero_cta_secondary: 'Wie es funktioniert',
	hero_trust_rating: '4,8 · 2.000+ Transporte',
	hero_trust_photos: '📷 Fotos bei Abholung gesichert',
	hero_trust_ai: '🤖 KI verhandelt für Sie',
	hero_trust_europe: '🇪🇺 Ganz Europa abgedeckt',

	// Phone mockup (hero)
	phone_job: 'Auftrag #SF-4821',
	phone_route: 'Amsterdam → München',
	phone_car: 'BMW 3er · 2019',
	phone_collected: '✅ Auto abgeholt · Do 09:00',
	phone_departed: '✅ Niederlande verlassen',
	phone_active: '◉ Köln — pünktlich',
	phone_future: '○ München · Voraussichtl. Sa 09:00',
	phone_driver: '🚛 Pieter van Dam',

	// HOW IT WORKS
	how_label: 'Einfacher Ablauf',
	how_title: 'Vom Foto bis zur Lieferung in 3 Schritten',
	how_sub: 'Sie tun drei Dinge. Die KI erledigt den Rest.',
	step1_title: 'Ihr Auto anmelden',
	step1_desc:
		'Geben Sie die Fahrzeugdaten ein, fotografieren Sie es von allen Seiten (unsere KI erkennt vorhandene Schäden sofort) und geben Sie Abhol- und Lieferadresse an.',
	step2_title: 'KI findet Ihnen einen Fahrer',
	step2_desc:
		'Wir senden Ihren Auftrag an verifizierte Fahrer. Unsere KI bewertet die Angebote und verhandelt den besten Preis für Sie – meist innerhalb von 3 Stunden.',
	step3_title: 'Verfolgen, empfangen, bestätigen',
	step3_desc:
		'Verfolgen Sie Ihr Auto live. Bei der Lieferung vergleicht unsere KI Vorher-Nachher-Fotos. Falls alles in Ordnung ist, tippen Sie auf Akzeptieren. Bei Schäden übernehmen wir den Versicherungsanspruch.',

	// FEATURES
	features_label: 'Warum wir',
	features_title: 'Alles für Sie erledigt',
	features_sub: 'Kein Formular, das Ihnen E-Mails schickt. Ein System, das die Arbeit wirklich erledigt.',
	feat1_title: 'KI-Preisverhandlung',
	feat1_desc:
		'Unsere KI verhandelt in Echtzeit in Ihrem Namen. Sie kennt faire Preise für jede Route in Europa und weicht nicht von Ihrem Budget ab.',
	feat2_title: 'Gesicherte Fotodokumentation',
	feat2_desc:
		'Drei unveränderliche Fotosätze – Ihrer bei Anmeldung, der des Fahrers bei Abholung, der des Fahrers bei Lieferung. Niemand kann sie ändern. Sie sind stets geschützt.',
	feat3_title: 'Live-Tracking',
	feat3_desc:
		'Wissen Sie jederzeit, wo sich Ihr Auto befindet. Automatische Statusupdates per WhatsApp, E-Mail oder Push-Benachrichtigung – kein Nachfragen nötig.',
	feat4_title: 'Sofortige Schadenserkennung',
	feat4_desc:
		'KI vergleicht Vorher- und Nachher-Fotos pixelgenau. Neue Kratzer werden nicht übersehen. Jeder Unterschied wird mit Fotobeweis markiert.',
	feat5_title: 'Versicherungsanspruch inklusive',
	feat5_desc:
		'Bei festgestellten Schäden erstellt unsere KI den Anspruch mit allen Beweisen. Ein qualifizierter Sachverständiger prüft ihn – Sie müssen sich nicht mit der Versicherung auseinandersetzen.',
	feat6_title: 'Compliance automatisch geprüft',
	feat6_desc:
		'Grenzüberschreitende Dokumente (CMR-Frachtbriefe, Zollformulare, Vollmachten) werden automatisch geprüft, bevor Ihr Auftrag erteilt wird.',

	// PROTECTION
	prot_label: 'Beweisskette',
	prot_title: 'Ihr Auto ist bei jeder Übergabe geschützt',
	prot_sub:
		'Drei gesicherte Fotosätze schaffen eine lückenlose Dokumentation – vorher, während und nachher.',
	ev1_title: 'Sie laden hoch',
	ev1_desc: 'Alle Seiten + vorhandene Schäden werden von der KI bei Anmeldung erfasst',
	ev2_title: 'Fahrer bei Abholung',
	ev2_desc: 'Pflichtfotosatz vor dem Einladen. Ohne diesen ist kein Fortfahren möglich.',
	ev3_title: 'Fahrer bei Lieferung',
	ev3_desc: 'Vollständiger Fotosatz am Zielort vor der Übergabe.',
	ev4_title: 'KI vergleicht alle 3',
	ev4_desc: 'Neue Schäden werden automatisch erfasst, dokumentiert und markiert.',
	prot_note_strong: 'Wichtig:',
	prot_note:
		'Der Schadensbericht der KI ist beratend. Ein qualifizierter menschlicher Versicherungssachverständiger prüft jeden Anspruch, bevor er eingereicht wird. Keine automatisierten Haftungsentscheidungen.',

	// FOR WHO
	who_label: 'Für wen',
	who_title: 'Für Privatpersonen und Unternehmen',
	ind_title: 'Privatpersonen',
	ind_li1: 'Auto im Ausland gekauft und nach Hause benötigt',
	ind_li2: 'Umzug und möchten, dass Ihr Auto folgt',
	ind_li3: 'Auto zum Ferienhaus schicken',
	ind_li4: 'Transport fahrunfähiger oder klassischer Fahrzeuge',
	ind_cta: 'Persönliches Angebot erhalten',
	biz_badge: 'Beliebt bei Unternehmen',
	biz_title: 'Unternehmen',
	biz_li1: 'Autohändler, die Fahrzeuge zwischen Standorten bewegen',
	biz_li2: 'Flottenmanager, die Fahrzeuge verlagern',
	biz_li3: 'Autovermietungen, die Depots ausgleichen',
	biz_li4: 'Großhändler mit regelmäßigem Transportbedarf',
	biz_cta: 'Unternehmensangebot erhalten',

	// DRIVERS
	drv_label: 'Sind Sie Fahrer?',
	drv_title: 'Treten Sie dem Forwarder-Netzwerk bei',
	drv_sub:
		'Erhalten Sie einen Echtzeit-Feed verfügbarer Aufträge auf Ihren Routen. Zum angebotenen Preis akzeptieren oder Gegenangebot machen. Schnell bezahlt werden. Bewertung aufbauen.',
	drv_li1: '✅ Aufträge passend zu Ihren aktiven Routen',
	drv_li2: '✅ Ein-Tipp-Akzeptanz oder Gegenangebot',
	drv_li3: '✅ Klare Abhol- und Lieferanweisungen',
	drv_li4: '✅ Schnelle Auszahlung nach Lieferbestätigung',
	drv_li5: '✅ Bewertungssystem, das Zuverlässigkeit belohnt',
	drv_cta: 'Als Fahrer bewerben',
	drv_jobs: 'Verfügbare Aufträge',

	// JOURNEY
	jour_label: 'Von Anfang bis Ende',
	jour_title: 'Das vollständige Bild',
	jour_sub:
		'Von dem Moment, in dem Sie Ihr Auto anmelden, bis zu dem Moment, in dem Sie die Lieferung bestätigen – jeder Schritt wird abgedeckt.',

	// STEP BY STEP
	sbs_label: 'Detaillierte Übersicht',
	sbs_title: 'Was in jedem Schritt passiert',
	s1_num: 'Schritt 1',
	s1_title: 'Sie füllen ein einfaches Formular aus',
	s1_desc:
		'Sie teilen uns mit, um welches Auto es sich handelt und wohin es muss. Die App führt Sie in fünf Screens durch den Prozess. Die KI liest Ihre Fahrgestellnummer automatisch – einfach die Kamera draufhalten – und <strong>hebt sofort vorhandene Kratzer oder Dellen hervor</strong>, während Sie Fotos hochladen.',
	s2_num: 'Schritt 2',
	s2_title: 'KI findet Ihnen einen Fahrer',
	s2_desc:
		'Sie kontaktieren niemanden. Die KI sendet Ihren Auftrag an unser verifiziertes Fahrernetzwerk und übernimmt alle Verhandlungen. Sie kennt faire Preise für jede Route in Europa – sie akzeptiert keine zu hohen Preise und schützt Fahrer davor, unfair gedrückt zu werden.',
	s3_num: 'Schritt 3',
	s3_title: 'Ihr Auto wird abgeholt',
	s3_desc:
		'Der Fahrer kommt zu Ihrer Abholadresse. Vor dem Einladen macht er über die App einen <strong>Pflichtfotosatz</strong> – alle Seiten, Armaturenbrett, Kilometerzähler. Diese werden sofort gesichert und können von niemandem bearbeitet werden. Das schützt Sie und den Fahrer. Alle stimmen dem genauen Zustand des Autos zu, bevor es bewegt wird.',
	s4_num: 'Schritt 4',
	s4_title: 'Ihr Auto ist unterwegs',
	s4_desc:
		'Verfolgen Sie Ihr Auto live. Die KI sendet automatische Updates per WhatsApp, E-Mail oder Push bei jedem Meilenstein. Falls etwas Unerwartetes passiert – Verzögerung, Routenänderung, Fahrer meldet sich nicht – alarmiert die KI Sie und das Team.',
	s5_num: 'Schritt 5',
	s5_title: 'Lieferung & Schadenscheck',
	s5_desc:
		'Am Zielort macht der Fahrer einen weiteren vollständigen Fotosatz. Die KI vergleicht diese automatisch mit den Abholfotos. Neue Schäden werden mit Fotobeweis markiert. Ein menschlicher Versicherungssachverständiger – kein Algorithmus – prüft jeden Anspruch, bevor er eingereicht wird.',
	s6_num: 'Schritt 6',
	s6_title: 'Sie bestätigen oder beanstanden',
	s6_desc:
		'Sie erhalten eine Lieferzusammenfassung mit allen Fotos. <strong>Alles in Ordnung?</strong> Tippen Sie auf "Akzeptieren" – Auftrag abgeschlossen. <strong>Etwas stimmt nicht?</strong> Tippen Sie auf "Beanstanden" – ein Teammitglied prüft es mit dem vollständigen Foto- und Protokollverlauf.',

	// WHO IS INVOLVED
	agents_label: 'Menschen & KI',
	agents_title: 'Wer beteiligt ist – und wer was tut',
	agents_sub: 'KI übernimmt Geschwindigkeit und Umfang. Menschen übernehmen Vertrauen und Haftung.',
	roles_who: 'Wer',
	roles_what: 'Was sie tun',
	role_customer: 'Sie (Kunde)',
	role_customer_desc:
		'Auftrag einreichen, Fortschritt verfolgen, Lieferung bestätigen oder beanstanden',
	role_driver: 'Fahrer / Spediteur',
	role_driver_desc: 'Auto abholen und liefern, an beiden Enden Fotos machen',
	role_ops: 'Betriebsleiter',
	role_ops_desc:
		'Greift ein, wenn Preisverhandlungen stocken oder etwas Ungewöhnliches passiert',
	role_adjuster: 'Versicherungssachverständiger',
	role_adjuster_desc:
		'Prüft jeden von der KI erstellten Schadensanspruch, bevor er an die Versicherung geht',
	role_admin: 'Plattform-Administrator',
	role_admin_desc: 'Hält das System am Laufen, überprüft Fahrer, verwaltet Inhalte',

	// SCREENS
	screens_label: 'App-Screens',
	screens_title: 'So sieht die App aus',
	screens_sub:
		'Jeder Screen ist nach einem Prinzip gestaltet: die richtige Aktion offensichtlich machen und alles andere automatisch ablaufen lassen.',
	tab_customer: 'Kunden-App',
	tab_driver: 'Fahrer-App',
	tab_ops: 'Ops-Dashboard',
	sc1_label: 'Screen 1 — Fahrzeugdaten',
	sc1_note: 'KI liest die FIN mit der Kamera – kein Tippen erforderlich.',
	sc2_label: 'Screen 2 — Foto-Upload',
	sc2_note: 'KI annotiert Schäden in Echtzeit beim Hochladen.',
	sc3_label: 'Screen 3 — Transportdetails',
	sc3_note: 'Adress-Autovervollständigung via Google Maps. Compliance automatisch geprüft.',
	sc4_label: 'Screen 4 — KI arbeitet',
	sc4_note: 'Live-Fortschritt – Sie sehen genau, was die KI tut.',
	sc5_label: 'Screen 5 — Live-Tracking',
	sc5_note: 'Echtzeit-Fortschritt + direkter Kontakt mit Ihrem Fahrer.',
	sc6_label: 'Screen 6 — Lieferbericht',
	sc6_note: 'Vorher-Nachher-Fotos im Vergleich. Ein Tipp zum Akzeptieren.',
	sc7_label: 'Screen 7 — Auftragsfeed',
	sc7_note: 'Echtzeit-Auftragsfeed passend zu Ihrem Routennetzwerk.',
	sc8_label: 'Screen 8 — Abholbestätigung',
	sc8_note:
		'Der Bestätigungsknopf bleibt gesperrt, bis alle erforderlichen Fotos gemacht wurden.',
	sc_ops_label: 'Betriebsleiter-Dashboard',
	sc_ops_note:
		'Die KI zeigt nur die Aufträge an, die wirklich eine menschliche Entscheidung erfordern. Alles andere läuft automatisch.',

	// FAQ
	faq_label: 'Fragen',
	faq_title: 'Häufig gestellte Fragen',
	faq_q1: 'Muss ich dabei sein, wenn das Auto abgeholt wird?',
	faq_a1:
		'Nicht unbedingt – Sie müssen nur sicherstellen, dass der Fahrer Zugang zum Fahrzeug hat. Die App koordiniert die Übergabedetails, und der Fahrer macht den Pflichtfotosatz vor dem Einladen.',
	faq_q2: 'Was, wenn mein Auto nicht fährt?',
	faq_a2:
		'Geben Sie es im Formular an. Fahrer, die nicht fahrtüchtige Fahrzeuge handhaben können, sehen den Auftrag, und der Preis spiegelt das benötigte Zusatzequipment wider.',
	faq_q3: 'Wie lange dauert der Transport?',
	faq_a3:
		'Innerhalb eines Landes: in der Regel 1–3 Tage. Quer durch Europa: typischerweise 5–10 Werktage, je nach Entfernung und Route.',
	faq_q4: 'Was, wenn ich mit der Schadensbewertung der KI nicht einverstanden bin?',
	faq_a4:
		'Tippen Sie auf "Beanstanden." Ein menschliches Teammitglied prüft den vollständigen Beweispfad – alle drei Fotosätze und das Protokoll – und trifft die endgültige Entscheidung. Der Bericht der KI ist beratend, niemals endgültig.',
	faq_q5: 'Ist mein Auto während des Transports versichert?',
	faq_a5:
		'Die Frachtführerhaftung des Fahrers deckt das Fahrzeug während des Transports ab. Unsere KI-gestützte Fotodokumentation stellt sicher, dass neue Schäden dokumentiert, beweisgestützt und erstattungsfähig sind.',
	faq_q6: 'Wie verhandelt die KI den Preis?',
	faq_a6:
		'Die KI sendet Ihren Auftrag an passende Fahrer, bewertet deren Angebote anhand historischer Preisdaten für Ihre Route und verhandelt innerhalb von Grenzen, die von unserem Betriebsleiter festgelegt wurden. Sie kann keinem Preis über Ihrem Budget oder unter dem Minimum des Fahrers zustimmen – wenn keine Einigung erzielt wird, greift ein Mensch ein.',

	// TESTIMONIALS
	test_label: 'Bewertungen',
	test_title: 'Was Kunden sagen',
	test1_text:
		'„Ich habe in Belgien ein BMW gekauft und musste es nach Hamburg liefern lassen. Die KI fand innerhalb von 2 Stunden einen Fahrer, der Preis war fair, und ich habe alles live verfolgt. Ankam ohne einen einzigen neuen Kratzer."',
	test1_author: '— Luc L., Privatkäufer',
	test2_text:
		'„Wir bewegen 20–30 Fahrzeuge pro Monat zwischen unseren Autohäusern. ShutUP Forwarder hat unsere Koordinationszeit um 80 % reduziert. Das Fotodokumentationssystem allein ist es wert – Streitigkeiten passieren praktisch nicht mehr."',
	test2_author: '— Steven V., Autohändler',
	test3_text:
		'„Mein klassischer Triumph musste von Finnland nach Belgien gebracht werden. Ich war nervös. Das Team hat mich bei jedem Schritt informiert, der Fahrer war fantastisch, und die Lieferfotos bestätigten keine Probleme. Besser geht es nicht."',
	test3_author: '— Wouter V., Oldtimerbesitzer',

	// QUOTE CTA
	cta_title: 'Bereit, Ihr Auto zu transportieren?',
	cta_sub: 'Erzählen Sie uns von Ihrem Auto und Ihrer Route. Wir kümmern uns um den Rest.',
	quote_pickup_label: 'Abholadresse',
	quote_pickup_ph: 'z.B. Amsterdam, Niederlande',
	quote_delivery_label: 'Lieferadresse',
	quote_delivery_ph: 'z.B. München, Deutschland',
	quote_car_label: 'Automarke & Modell',
	quote_car_ph: 'z.B. BMW 3er 2019',
	quote_email_label: 'Ihre E-Mail',
	quote_email_ph: 'sie@beispiel.de',
	quote_btn: 'Mein Angebot erhalten →',
	quote_submitted: '✅ Anfrage erhalten!',
	quote_note: 'Kein Konto erforderlich. Angebot in unter 3 Stunden. Kein Spam.',

	// FOOTER
	footer_tagline:
		'KI-gestützter Autotransport durch Europa. Schnell, fair, vollständig getrackt.',
	footer_platform: 'Plattform',
	footer_how: 'Wie es funktioniert',
	footer_features: 'Funktionen',
	footer_protection: 'Fahrzeugschutz',
	footer_business: 'Für Unternehmen',
	footer_drivers: 'Für Fahrer',
	footer_routes: 'Routen',
	footer_nl: 'Niederlande',
	footer_de: 'Deutschland',
	footer_be: 'Belgien',
	footer_fr: 'Frankreich',
	footer_eu: 'Ganz Europa',
	footer_company: 'Unternehmen',
	footer_about: 'Über uns',
	footer_blog: 'Blog',
	footer_careers: 'Karriere',
	footer_contact: 'Kontakt',
	footer_legal: 'Rechtliches',
	footer_tos: 'Nutzungsbedingungen',
	footer_privacy: 'Datenschutzrichtlinie',
	footer_cookies: 'Cookie-Richtlinie',
	footer_cmr: 'CMR-Übereinkommen',
	footer_copyright: '© 2026 ShutUP Forwarder. Alle Rechte vorbehalten.',
	footer_built: 'Erstellt mit dem Vercel AI SDK'
};

export const translations: Record<Lang, Translations> = { en, de };
