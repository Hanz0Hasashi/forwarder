<script lang="ts">
    import { onMount } from 'svelte';
    import { translations, type Lang } from '$lib/translations.js';
    import { goto } from '$app/navigation';
    

    // ── Reactive state ───────────────────────────────────────────────
    let lang = $state<Lang>('en');
    let t = $derived(translations[lang]);

    let activeTab = $state('customer');
    let menuOpen = $state(false);
    let isLoggedIn = $state(false);

    // Quote form
    let pickupAddr = $state('');
    let deliveryAddr = $state('');
    let carModel = $state('');
    let email = $state('');
    let quoteSubmitted = $state(false);
    let quoteFields = $state({ pickup: true, delivery: true, car: true, email: true });

    function setLang(l: Lang) {
        lang = l;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('shutup-lang', l);
        }
    }

    function handleQuoteSubmit() {
        quoteFields = {
            pickup: !!pickupAddr.trim(),
            delivery: !!deliveryAddr.trim(),
            car: !!carModel.trim(),
            email: !!email.trim()
        };

        // If any field is empty, stop and show the red validation warnings
        if (!Object.values(quoteFields).every(Boolean)) return;

        // Validation passed! Show the success state on the button
        quoteSubmitted = true;

        // Wait 1 second so the user sees the success state, then redirect to the submit page
        setTimeout(() => {
            goto('/submit');
        }, 1000); 
    }

    // ── Auth Handling ────────────────────────────────────────────────
    function handleLogout(e: Event) {
        e.preventDefault();
        if (typeof window !== 'undefined' && window.Clerk) {
            window.Clerk.signOut({ redirectUrl: '/' }).then(() => {
                isLoggedIn = false; // Instantly flip the button back to Sign In
            });
        }
    }

    // ── Browser-only setup ───────────────────────────────────────────
    onMount(async () => {
        // Restore language preference
        const saved = localStorage.getItem('shutup-lang') as Lang | null;
        if (saved === 'en' || saved === 'de') lang = saved;

        // AUTH CHECK: Wait for Clerk to fully inject into the browser
        let checkInterval = setInterval(() => {
            if (typeof window !== 'undefined' && window.Clerk) {
                clearInterval(checkInterval); // Found it! Stop checking.
                
                // If Clerk has a user, flip the button to True
                if (window.Clerk.user) {
                    isLoggedIn = true;
                }
            }
        }, 50);

        // Mermaid
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({
            startOnLoad: false,
            theme: 'neutral',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 14,
            flowchart: { curve: 'basis', padding: 20 },
            sequence: { actorMargin: 60, messageMargin: 40 }
        });
        await mermaid.run({ querySelector: '.mermaid' });

        // Nav scroll effect
        const nav = document.getElementById('nav');
        const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });

        // Scroll reveal
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );
        const revealSelectors = [
            '.step', '.feature-card', '.evidence-step', '.for-who-card',
            '.testimonial', '.section-label', '.section-title', '.section-sub',
            '.evidence-chain', '.driver-perks', '.protection-note'
        ];
        revealSelectors.forEach((sel) => {
            document.querySelectorAll(sel).forEach((el, i) => {
                el.classList.add('reveal');
                (el as HTMLElement).style.transitionDelay = `${i * 80}ms`;
                revealObserver.observe(el);
            });
        });

        // Active nav highlight
        const sections = document.querySelectorAll<HTMLElement>('section[id]');
        const navAnchors = document.querySelectorAll<HTMLAnchorElement>('.nav__links a[href^="#"]');
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        navAnchors.forEach((a) => {
                            a.style.color = '';
                            if (a.getAttribute('href') === `#${entry.target.id}`) {
                                a.style.color = 'var(--c-primary)';
                            }
                        });
                    }
                });
            },
            { threshold: 0.4 }
        );
        sections.forEach((s) => sectionObserver.observe(s));

        return () => {
            clearInterval(checkInterval); // Clean up the interval
            window.removeEventListener('scroll', onScroll);
            revealObserver.disconnect();
            sectionObserver.disconnect();
        };
    });
</script>

<svelte:head>
	<title>{t.page_title}</title>
	<meta name="description" content={t.page_desc} />
</svelte:head>

<!-- ─── NAV ─────────────────────────────────────────────────────── -->
<header class="nav" id="nav">
	<div class="container nav__inner">
		<a href="#" class="nav__logo">
			<span class="logo-icon">🚗</span>
			<span>ShutUP <strong>Forwarder</strong></span>
		</a>
		<nav class="nav__links" class:open={menuOpen} aria-label="Main navigation">
			<!-- svelte-ignore a11y_invalid_attribute -->
			<a href="#how-it-works" onclick={() => (menuOpen = false)}>{t.nav_how}</a>
			<!-- svelte-ignore a11y_invalid_attribute -->
			<a href="#step-by-step" onclick={() => (menuOpen = false)}>{t.nav_step}</a>
			<!-- svelte-ignore a11y_invalid_attribute -->
			<a href="#features" onclick={() => (menuOpen = false)}>{t.nav_features}</a>
			<!-- svelte-ignore a11y_invalid_attribute -->
			<a href="#screens" onclick={() => (menuOpen = false)}>{t.nav_screens}</a>
			<!-- svelte-ignore a11y_invalid_attribute -->
			<a href="#faq" onclick={() => (menuOpen = false)}>{t.nav_faq}</a>
			<!-- svelte-ignore a11y_invalid_attribute -->
			<a href="#drivers" class="nav__driver-link" onclick={() => (menuOpen = false)}>{t.nav_drivers}</a>
		</nav>
		<div class="nav__actions" class:open={menuOpen}>
    <div class="lang-switcher">
        <button class="lang-btn" class:active={lang === 'en'} onclick={() => setLang('en')}>EN</button>
        <button class="lang-btn" class:active={lang === 'de'} onclick={() => setLang('de')}>DE</button>
    </div>

    {#if isLoggedIn}
        <button class="btn btn--ghost" onclick={handleLogout}>
            Logout
        </button>
    {:else}
        <a href="/login" class="btn btn--ghost">{t.nav_signin}</a>
    {/if}

    <a href="#quote" class="btn btn--primary">{t.nav_quote}</a>
</div>
		<button
			class="nav__burger"
			id="burger"
			aria-label="Open menu"
			onclick={() => (menuOpen = !menuOpen)}
		>
			<span></span><span></span><span></span>
		</button>
	</div>
</header>

<!-- ─── HERO ─────────────────────────────────────────────────────── -->
<section class="hero">
	<div class="hero__bg-grid"></div>
	<div class="container hero__inner">
		<div class="badge">{t.hero_badge}</div>
		<h1 class="hero__headline">
			{t.hero_h1_1}<br />
			<span class="gradient-text">{t.hero_h1_2}</span>
		</h1>
		<p class="hero__sub">{t.hero_sub}</p>
		<div class="hero__ctas">
			<a href="#quote" class="btn btn--primary btn--lg">{t.hero_cta_primary}</a>
			<a href="#how-it-works" class="btn btn--ghost btn--lg">{t.hero_cta_secondary}</a>
		</div>
		<div class="hero__trust">
			<div class="trust-item">
				<span class="trust-stars">★★★★★</span>
				<span>{t.hero_trust_rating}</span>
			</div>
			<div class="trust-divider"></div>
			<div class="trust-item">{t.hero_trust_photos}</div>
			<div class="trust-divider"></div>
			<div class="trust-item">{t.hero_trust_ai}</div>
			<div class="trust-divider"></div>
			<div class="trust-item">{t.hero_trust_europe}</div>
		</div>
	</div>

	<div class="container hero__mockup-wrap">
		<div class="phone-mockup">
			<div class="phone-screen">
				<div class="phone-bar">
					<span class="phone-dot"></span>
					<span class="phone-title">{t.phone_job}</span>
					<span class="phone-dot"></span>
				</div>
				<div class="phone-row phone-route">{t.phone_route}</div>
				<div class="phone-row phone-car">{t.phone_car}</div>
				<div class="phone-timeline">
					<div class="tl-item tl-done">{t.phone_collected}</div>
					<div class="tl-item tl-done">{t.phone_departed}</div>
					<div class="tl-item tl-active">{t.phone_active}</div>
					<div class="tl-item tl-future">{t.phone_future}</div>
				</div>
				<div class="phone-driver">
					<span>{t.phone_driver}</span>
					<span class="driver-stars">★★★★☆ 4.7</span>
				</div>
				<div class="phone-actions">
					<button class="phone-btn phone-btn--call">📞 Call</button>
					<button class="phone-btn phone-btn--msg">💬 Message</button>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- ─── HOW IT WORKS ──────────────────────────────────────────────── -->
<section class="section" id="how-it-works">
	<div class="container">
		<div class="section-label">{t.how_label}</div>
		<h2 class="section-title">{t.how_title}</h2>
		<p class="section-sub">{t.how_sub}</p>

		<div class="steps">
			<div class="step">
				<div class="step__num">01</div>
				<div class="step__icon">📋</div>
				<h3>{t.step1_title}</h3>
				<p>{t.step1_desc}</p>
			</div>
			<div class="step__connector"></div>
			<div class="step">
				<div class="step__num">02</div>
				<div class="step__icon">🤖</div>
				<h3>{t.step2_title}</h3>
				<p>{t.step2_desc}</p>
			</div>
			<div class="step__connector"></div>
			<div class="step">
				<div class="step__num">03</div>
				<div class="step__icon">✅</div>
				<h3>{t.step3_title}</h3>
				<p>{t.step3_desc}</p>
			</div>
		</div>
	</div>
</section>

<!-- ─── FEATURES ─────────────────────────────────────────────────── -->
<section class="section section--alt" id="features">
	<div class="container">
		<div class="section-label">{t.features_label}</div>
		<h2 class="section-title">{t.features_title}</h2>
		<p class="section-sub">{t.features_sub}</p>

		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">🤝</div>
				<h3>{t.feat1_title}</h3>
				<p>{t.feat1_desc}</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">📸</div>
				<h3>{t.feat2_title}</h3>
				<p>{t.feat2_desc}</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">📍</div>
				<h3>{t.feat3_title}</h3>
				<p>{t.feat3_desc}</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🔍</div>
				<h3>{t.feat4_title}</h3>
				<p>{t.feat4_desc}</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">📄</div>
				<h3>{t.feat5_title}</h3>
				<p>{t.feat5_desc}</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">📜</div>
				<h3>{t.feat6_title}</h3>
				<p>{t.feat6_desc}</p>
			</div>
		</div>
	</div>
</section>
<!-- ─── PROTECTION ────────────────────────────────────────────────── -->
<section class="section" id="protection">
	<div class="container">
		<div class="section-label">{t.prot_label}</div>
		<h2 class="section-title">{t.prot_title}</h2>
		<p class="section-sub">{t.prot_sub}</p>

		<div class="evidence-chain">
			<div class="evidence-step">
				<div class="evidence-icon">📱</div>
				<h4>{t.ev1_title}</h4>
				<p>{t.ev1_desc}</p>
				<div class="evidence-badge">🔒 Locked</div>
			</div>
			<div class="evidence-arrow">→</div>
			<div class="evidence-step">
				<div class="evidence-icon">🚛</div>
				<h4>{t.ev2_title}</h4>
				<p>{t.ev2_desc}</p>
				<div class="evidence-badge">🔒 Locked</div>
			</div>
			<div class="evidence-arrow">→</div>
			<div class="evidence-step">
				<div class="evidence-icon">🏠</div>
				<h4>{t.ev3_title}</h4>
				<p>{t.ev3_desc}</p>
				<div class="evidence-badge">🔒 Locked</div>
			</div>
			<div class="evidence-arrow">→</div>
			<div class="evidence-step evidence-step--result">
				<div class="evidence-icon">🤖</div>
				<h4>{t.ev4_title}</h4>
				<p>{t.ev4_desc}</p>
				<div class="evidence-badge evidence-badge--ai">✦ AI Report</div>
			</div>
		</div>

		<div class="protection-note">
			<strong>{t.prot_note_strong}</strong> {t.prot_note}
		</div>
	</div>
</section>

<!-- ─── FOR WHO ───────────────────────────────────────────────────── -->
<section class="section section--alt" id="for-who">
	<div class="container">
		<div class="section-label">{t.who_label}</div>
		<h2 class="section-title">{t.who_title}</h2>

		<div class="for-who-grid">
			<div class="for-who-card">
				<div class="for-who-icon">🧑</div>
				<h3>{t.ind_title}</h3>
				<ul>
					<li>{t.ind_li1}</li>
					<li>{t.ind_li2}</li>
					<li>{t.ind_li3}</li>
					<li>{t.ind_li4}</li>
				</ul>
				<a href="#quote" class="btn btn--primary">{t.ind_cta}</a>
			</div>
			<div class="for-who-card for-who-card--business">
				<div class="for-who-card__badge">{t.biz_badge}</div>
				<div class="for-who-icon">🏢</div>
				<h3>{t.biz_title}</h3>
				<ul>
					<li>{t.biz_li1}</li>
					<li>{t.biz_li2}</li>
					<li>{t.biz_li3}</li>
					<li>{t.biz_li4}</li>
				</ul>
				<a href="#quote" class="btn btn--primary">{t.biz_cta}</a>
			</div>
		</div>
	</div>
</section>

<!-- ─── DRIVERS ───────────────────────────────────────────────────── -->
<section class="section drivers-section" id="drivers">
	<div class="container drivers-inner">
		<div class="drivers-text">
			<div class="section-label section-label--light">{t.drv_label}</div>
			<h2 class="section-title section-title--light">{t.drv_title}</h2>
			<p class="section-sub section-sub--light">{t.drv_sub}</p>
			<ul class="driver-perks">
				<li>{t.drv_li1}</li>
				<li>{t.drv_li2}</li>
				<li>{t.drv_li3}</li>
				<li>{t.drv_li4}</li>
				<li>{t.drv_li5}</li>
			</ul>
			<a href="#" class="btn btn--white btn--lg">{t.drv_cta}</a>
		</div>
		<div class="drivers-mockup">
			<div class="phone-mockup phone-mockup--dark">
				<div class="phone-screen phone-screen--dark">
					<div class="phone-bar phone-bar--dark">
						<span class="phone-title">{t.drv_jobs}</span>
						<span class="phone-notif">🔔 2</span>
					</div>
					<div class="job-card">
						<div class="job-route">Amsterdam → Munich</div>
						<div class="job-car">BMW 3 Series · 2019</div>
						<div class="job-date">📅 Thu 22 Apr</div>
						<div class="job-price">💶 €320 – €380</div>
						<div class="job-btns">
							<button class="job-btn job-btn--bid">💬 Bid</button>
							<button class="job-btn job-btn--accept">✅ Accept</button>
						</div>
					</div>
					<div class="job-card job-card--dim">
						<div class="job-route">Rotterdam → Berlin</div>
						<div class="job-car">VW Golf · ⚠️ Non-running</div>
						<div class="job-date">📅 Fri 23 Apr</div>
						<div class="job-price">💶 €290 – €350</div>
						<div class="job-btns">
							<button class="job-btn job-btn--bid">💬 Bid</button>
							<button class="job-btn job-btn--accept">✅ Accept</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- ─── FULL JOURNEY DIAGRAM ─────────────────────────────────────── -->
<section class="section section--alt" id="journey">
	<div class="container">
		<div class="section-label">{t.jour_label}</div>
		<h2 class="section-title">{t.jour_title}</h2>
		<p class="section-sub">{t.jour_sub}</p>
		<div class="mermaid-wrap">
			<pre class="mermaid">
flowchart TD
    A(["🧑 You (the Customer)"]) -->|"Submit car details + photos"| B["📋 Job Created"]
    B --> C["🤖 AI checks your car & validates details"]
    C --> D["📢 AI sends job to all available drivers"]
    D --> E(["🚛 Drivers bid on your job"])
    E --> F["🤖 AI negotiates best price for you"]
    F --> G(["✅ Driver accepts the job"])
    G --> H["📸 Driver photos your car at pickup"]
    H --> I["🚗 Car is in transit — AI tracks progress"]
    I --> J["📸 Driver photos your car at delivery"]
    J --> K["🤖 AI compares before & after photos"]
    K -->|"No damage"| L(["✅ You accept delivery — Job complete!"])
    K -->|"Damage found"| M["🤖 AI files insurance claim"]
    M --> N(["👨‍💼 Insurance Adjuster reviews & settles"])
			</pre>
		</div>
	</div>
</section>

<!-- ─── STEP BY STEP ──────────────────────────────────────────────── -->
<section class="section" id="step-by-step">
	<div class="container">
		<div class="section-label">{t.sbs_label}</div>
		<h2 class="section-title">{t.sbs_title}</h2>

		<div class="deep-step">
			<div class="deep-step__header">
				<div class="deep-step__num">{t.s1_num}</div>
				<h3>{t.s1_title}</h3>
			</div>
			<p class="deep-step__desc">{@html t.s1_desc}</p>
			<div class="mermaid-wrap">
				<pre class="mermaid">
flowchart LR
    S1["🔢 Chassis number & car details"] --> S2["📸 Photos of your car — all sides + damage"] --> S3["📍 Pickup address & delivery address"] --> S4["📅 Preferred dates & contact info"] --> S5["✅ Submit"]
				</pre>
			</div>
		</div>

		<div class="deep-step">
			<div class="deep-step__header">
				<div class="deep-step__num">{t.s2_num}</div>
				<h3>{t.s2_title}</h3>
			</div>
			<p class="deep-step__desc">{t.s2_desc}</p>
			<div class="mermaid-wrap">
				<pre class="mermaid">
sequenceDiagram
    participant AI as 🤖 AI Dispatch
    participant D1 as 🚛 Driver A
    participant D2 as 🚛 Driver B
    participant D3 as 🚛 Driver C
    participant You as 🧑 You
    AI->>D1: Job available: Amsterdam → Munich
    AI->>D2: Job available: Amsterdam → Munich
    AI->>D3: Job available: Amsterdam → Munich
    D1-->>AI: Bid: €380
    D2-->>AI: Bid: €420
    D3-->>AI: Bid: €350
    AI->>D3: Can you do €330?
    D3-->>AI: Yes, €340 is my best
    AI->>You: ✅ Driver found — €340, pickup Thursday
				</pre>
			</div>
		</div>

		<div class="deep-step">
			<div class="deep-step__header">
				<div class="deep-step__num">{t.s3_num}</div>
				<h3>{t.s3_title}</h3>
			</div>
			<p class="deep-step__desc">{@html t.s3_desc}</p>
		</div>

		<div class="deep-step">
			<div class="deep-step__header">
				<div class="deep-step__num">{t.s4_num}</div>
				<h3>{t.s4_title}</h3>
			</div>
			<p class="deep-step__desc">{t.s4_desc}</p>
			<div class="mermaid-wrap">
				<pre class="mermaid">
flowchart LR
    T1["📦 Thu 09:00\nCar collected\nPhotos locked"] --> T2["🚗 Thu 10:30\nOn its way!"]
    T2 --> T3["🇩🇪 Fri 14:00\nCrossing into\nGermany"]
    T3 --> T4["🌙 Fri 18:00\nArrives\ntomorrow"]
    T4 --> T5["✅ Sat 09:30\nDelivered\nin Munich"]
				</pre>
			</div>
		</div>

		<div class="deep-step">
			<div class="deep-step__header">
				<div class="deep-step__num">{t.s5_num}</div>
				<h3>{t.s5_title}</h3>
			</div>
			<p class="deep-step__desc">{t.s5_desc}</p>
			<div class="mermaid-wrap">
				<pre class="mermaid">
flowchart TD
    A["📸 Pickup photos (locked at collection)"] --> C
    B["📸 Delivery photos (taken on arrival)"] --> C
    C["🤖 AI compares both sets"] --> D&#123;Any new damage?&#125;
    D -->|No| E["✅ Clean report — you accept delivery"]
    D -->|Yes| F["📋 AI writes damage report with photo evidence"]
    F --> G["👨‍💼 Insurance Adjuster reviews the report"]
    G --> H["💬 Adjuster contacts your insurer"]
    H --> I["💰 Claim settled"]
				</pre>
			</div>
		</div>

		<div class="deep-step">
			<div class="deep-step__header">
				<div class="deep-step__num">{t.s6_num}</div>
				<h3>{t.s6_title}</h3>
			</div>
			<p class="deep-step__desc">{@html t.s6_desc}</p>
		</div>
	</div>
</section>

<!-- ─── WHO IS INVOLVED ────────────────────────────────────────────── -->
<section class="section section--alt" id="agents">
	<div class="container">
		<div class="section-label">{t.agents_label}</div>
		<h2 class="section-title">{t.agents_title}</h2>
		<p class="section-sub">{t.agents_sub}</p>

		<div class="mermaid-wrap mermaid-wrap--wide">
			<pre class="mermaid">
graph TD
    subgraph People["👤 People"]
        C["🧑 Customer (you)"]
        F["🚛 Driver / Forwarder"]
        OM["👩‍💼 Operations Manager (ShutUP staff)"]
        IA["👨‍💼 Insurance Adjuster (partner)"]
    end
    subgraph Agents["🤖 AI Agents — working behind the scenes"]
        A1["Intake Agent\nReads your car & photos"]
        A2["Dispatch Agent\nFinds & selects a driver"]
        A3["Compliance Agent\nChecks legal paperwork"]
        A4["In-Transit Agent\nTracks the journey"]
        A5["Delivery Agent\nCompares photos"]
        A6["Insurance Agent\nDrafts damage claims"]
        A7["Comms Agent\nSends you updates"]
    end
    C -->|submits job| A1
    A1 -->|validated job| A2
    A2 -->|broadcasts to| F
    F -->|bids & accepts| A2
    A2 -->|checks docs with| A3
    A3 -.->|flags issues to| OM
    F -->|pickup & delivery photos| A5
    A4 -->|status updates| C
    A5 -->|damage found| A6
    A6 -->|claim draft| IA
    A7 -->|messages| C
    OM -->|approves exceptions| A2
			</pre>
		</div>

		<div class="roles-table-wrap">
			<table class="roles-table">
				<thead>
					<tr><th>{t.roles_who}</th><th>{t.roles_what}</th></tr>
				</thead>
				<tbody>
					<tr>
						<td>🧑 <strong>{t.role_customer}</strong></td>
						<td>{t.role_customer_desc}</td>
					</tr>
					<tr>
						<td>🚛 <strong>{t.role_driver}</strong></td>
						<td>{t.role_driver_desc}</td>
					</tr>
					<tr>
						<td>👩‍💼 <strong>{t.role_ops}</strong></td>
						<td>{t.role_ops_desc}</td>
					</tr>
					<tr>
						<td>👨‍💼 <strong>{t.role_adjuster}</strong></td>
						<td>{t.role_adjuster_desc}</td>
					</tr>
					<tr>
						<td>🔧 <strong>{t.role_admin}</strong></td>
						<td>{t.role_admin_desc}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</section>

<!-- ─── SCREEN WIREFRAMES ─────────────────────────────────────────── -->
<section class="section" id="screens">
	<div class="container">
		<div class="section-label">{t.screens_label}</div>
		<h2 class="section-title">{t.screens_title}</h2>
		<p class="section-sub">{t.screens_sub}</p>

		<div class="screens-tabs">
			<div class="screens-tab-bar">
				<button
					class="screens-tab"
					class:active={activeTab === 'customer'}
					onclick={() => (activeTab = 'customer')}
				>{t.tab_customer}</button>
				<button
					class="screens-tab"
					class:active={activeTab === 'driver'}
					onclick={() => (activeTab = 'driver')}
				>{t.tab_driver}</button>
				<button
					class="screens-tab"
					class:active={activeTab === 'ops'}
					onclick={() => (activeTab = 'ops')}
				>{t.tab_ops}</button>
			</div>

			<!-- Customer screens -->
			<div class="screens-panel" class:active={activeTab === 'customer'}>
				<div class="screens-grid">
					<div class="screen-card">
						<div class="screen-card__label">{t.sc1_label}</div>
						<pre class="wireframe">┌──────────────────────────────────┐
│  ShutUP Forwarder             ≡  │
│──────────────────────────────────│
│  ① Vehicle  ② Photos  ③ Route   │
│  ④ Contact  ⑤ Review            │
│                                  │
│  Step 1: Vehicle Identity        │
│                                  │
│  Chassis / VIN Number            │
│  ┌──────────────────────────┐   │
│  │  WBA3A5C50CF256551       │   │
│  └──────────────────────────┘   │
│  [ 📷 Scan with camera instead ] │
│                                  │
│  Make              Model         │
│  ┌─────────────┐  ┌───────────┐ │
│  │  BMW      ▾ │  │ 3 Series▾ │ │
│  └─────────────┘  └───────────┘ │
│                                  │
│  Year              Fuel type     │
│  ┌─────────────┐  ┌───────────┐ │
│  │  2019     ▾ │  │ Diesel  ▾ │ │
│  └─────────────┘  └───────────┘ │
│                                  │
│  ┌──────────────────────────┐   │
│  │         Next →           │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘</pre>
						<p class="screen-card__note">{t.sc1_note}</p>
					</div>

					<div class="screen-card">
						<div class="screen-card__label">{t.sc2_label}</div>
						<pre class="wireframe">┌──────────────────────────────────┐
│  ShutUP Forwarder             ≡  │
│──────────────────────────────────│
│  Step 2: Vehicle Condition       │
│  Photograph your car from        │
│  every angle before it moves.    │
│                                  │
│  ┌─────────────┐ ┌─────────────┐│
│  │   FRONT     │ │    REAR     ││
│  │  ✅ Done    │ │  ✅ Done    ││
│  └─────────────┘ └─────────────┘│
│  ┌─────────────┐ ┌─────────────┐│
│  │  LEFT SIDE  │ │ RIGHT SIDE  ││
│  │  ✅ Done    │ │  📷 Take    ││
│  └─────────────┘ └─────────────┘│
│                                  │
│  ┌──────────────────────────┐   │
│  │  ⚠️  AI spotted:         │   │
│  │  Scratch on front bumper │   │
│  │  (pre-existing — noted)  │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │  ✏️ Confirm & Next →     │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘</pre>
						<p class="screen-card__note">{t.sc2_note}</p>
					</div>

					<div class="screen-card">
						<div class="screen-card__label">{t.sc3_label}</div>
						<pre class="wireframe">┌──────────────────────────────────┐
│  ShutUP Forwarder             ≡  │
│──────────────────────────────────│
│  Step 3: Transport Details       │
│                                  │
│  Pickup Address                  │
│  ┌──────────────────────────┐   │
│  │  Herengracht 12,         │   │
│  │  1015 BZ Amsterdam       │   │
│  └──────────────────────────┘   │
│                                  │
│  Pickup Window                   │
│  ┌──────────────────────────┐   │
│  │  Thu 22 Apr – Mon 26 Apr │   │
│  └──────────────────────────┘   │
│                                  │
│  Delivery Address                │
│  ┌──────────────────────────┐   │
│  │  Maximilianstr. 5,       │   │
│  │  80539 Munich            │   │
│  └──────────────────────────┘   │
│                                  │
│  Does the car drive on its own?  │
│  ●  Yes    ○  No                 │
│                                  │
│  ┌──────────────────────────┐   │
│  │         Next →           │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘</pre>
						<p class="screen-card__note">{t.sc3_note}</p>
					</div>

					<div class="screen-card">
						<div class="screen-card__label">{t.sc4_label}</div>
						<pre class="wireframe">┌──────────────────────────────────┐
│  ShutUP Forwarder             ≡  │
│──────────────────────────────────│
│  Job #SF-4821  ·  Submitted ✅   │
│  BMW 3 Series 2019               │
│  Amsterdam  ──────►  Munich      │
│──────────────────────────────────│
│                                  │
│  🤖 AI is working on your job…   │
│                                  │
│  ✅  Car details verified        │
│  ✅  Photos annotated            │
│  ✅  Route & docs checked        │
│  ⏳  Finding available drivers…  │
│                                  │
│  ┌──────────────────────────┐   │
│  │  3 drivers notified      │   │
│  │  Awaiting bids…          │   │
│  └──────────────────────────┘   │
│                                  │
│  You'll hear back in &lt;3 hours.   │
│                                  │
└──────────────────────────────────┘</pre>
						<p class="screen-card__note">{t.sc4_note}</p>
					</div>

					<div class="screen-card">
						<div class="screen-card__label">{t.sc5_label}</div>
						<pre class="wireframe">┌──────────────────────────────────┐
│  ShutUP Forwarder             ≡  │
│──────────────────────────────────│
│  Job #SF-4821                    │
│  BMW 3 Series · Amsterdam→Munich │
│──────────────────────────────────│
│                                  │
│  ●━━━━━━━━━◉━━━━━━━━━○           │
│  Amsterdam  (here)   Munich      │
│                                  │
│  ✅  Thu 09:00  Car collected    │
│  ✅  Thu 14:00  Departed NL      │
│  ✅  Fri 14:00  Entered Germany  │
│  ◉   Fri 17:30  On the way       │
│  ○   Sat 09:00  Est. delivery    │
│                                  │
│  Driver: Pieter van Dam          │
│  ★★★★☆  4.7 · 312 trips         │
│  [ 📞 Call ]   [ 💬 Message ]   │
│                                  │
└──────────────────────────────────┘</pre>
						<p class="screen-card__note">{t.sc5_note}</p>
					</div>

					<div class="screen-card">
						<div class="screen-card__label">{t.sc6_label}</div>
						<pre class="wireframe">┌──────────────────────────────────┐
│  ShutUP Forwarder             ≡  │
│──────────────────────────────────│
│  Delivery Report · Job #SF-4821  │
│──────────────────────────────────│
│                                  │
│   ✅  No new damage detected     │
│       AI confidence: 98%         │
│       8 photos compared          │
│                                  │
│  BEFORE (Amsterdam)              │
│  ┌─────────┐ ┌─────────┐        │
│  │ [front] │ │ [rear]  │  …     │
│  └─────────┘ └─────────┘        │
│                                  │
│  AFTER (Munich)                  │
│  ┌─────────┐ ┌─────────┐        │
│  │ [front] │ │ [rear]  │  …     │
│  └─────────┘ └─────────┘        │
│                                  │
│  ┌───────────────┐ ┌──────────┐ │
│  │ ✅ Accept     │ │⚠️ Dispute│ │
│  └───────────────┘ └──────────┘ │
└──────────────────────────────────┘</pre>
						<p class="screen-card__note">{t.sc6_note}</p>
					</div>
				</div>
			</div>

			<!-- Driver screens -->
			<div class="screens-panel" class:active={activeTab === 'driver'}>
				<div class="screens-grid">
					<div class="screen-card">
						<div class="screen-card__label">{t.sc7_label}</div>
						<pre class="wireframe">┌──────────────────────────────────┐
│  ≡  Forwarder App        🔔 2   │
│──────────────────────────────────│
│  Available Jobs Near You         │
│                                  │
│  ┌──────────────────────────┐   │
│  │  Amsterdam → Munich      │   │
│  │  BMW 3 Series · 2019     │   │
│  │  Running · No extras     │   │
│  │  📅 Pickup: Thu 22 Apr   │   │
│  │  💶 Est. €320 – €380     │   │
│  │  ┌──────────┐ ┌────────┐ │   │
│  │  │  💬 Bid  │ │✅ Accept│ │   │
│  │  └──────────┘ └────────┘ │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │  Rotterdam → Berlin      │   │
│  │  Volkswagen Golf · 2021  │   │
│  │  ⚠️ Non-running          │   │
│  │  📅 Pickup: Fri 23 Apr   │   │
│  │  💶 Est. €290 – €350     │   │
│  │  ┌──────────┐ ┌────────┐ │   │
│  │  │  💬 Bid  │ │✅ Accept│ │   │
│  │  └──────────┘ └────────┘ │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘</pre>
						<p class="screen-card__note">{t.sc7_note}</p>
					</div>

					<div class="screen-card">
						<div class="screen-card__label">{t.sc8_label}</div>
						<pre class="wireframe">┌──────────────────────────────────┐
│  ←  Job #SF-4821                 │
│──────────────────────────────────│
│  📸 Pickup Confirmation          │
│  BMW 3 Series · Herengracht 12   │
│                                  │
│  Photograph the car before       │
│  loading. Photos are locked      │
│  once confirmed.                 │
│                                  │
│  ┌─────────────┐ ┌─────────────┐│
│  │   FRONT     │ │    REAR     ││
│  │  ✅ Done    │ │  ✅ Done    ││
│  └─────────────┘ └─────────────┘│
│  ┌─────────────┐ ┌─────────────┐│
│  │  LEFT SIDE  │ │ RIGHT SIDE  ││
│  │  ✅ Done    │ │  ✅ Done    ││
│  └─────────────┘ └─────────────┘│
│  ┌─────────────┐ ┌─────────────┐│
│  │  INTERIOR   │ │  ODOMETER   ││
│  │  ✅ Done    │ │  📷 Take    ││
│  └─────────────┘ └─────────────┘│
│                                  │
│  ⚠️  1 photo remaining           │
│  ┌──────────────────────────┐   │
│  │  🔒 Lock & Confirm (1 ✗) │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘</pre>
						<p class="screen-card__note">{t.sc8_note}</p>
					</div>
				</div>
			</div>

			<!-- Ops dashboard -->
			<div class="screens-panel" class:active={activeTab === 'ops'}>
				<div class="screens-grid screens-grid--wide">
					<div class="screen-card screen-card--wide">
						<div class="screen-card__label">{t.sc_ops_label}</div>
						<pre class="wireframe wireframe--wide">┌────────────────────────────────────────────────────────────┐
│  ShutUP Forwarder — Operations Dashboard                   │
│────────────────────────────────────────────────────────────│
│                                                            │
│  🔴 Needs Attention (2)    🟡 In Progress (14)   ✅ Done  │
│────────────────────────────────────────────────────────────│
│                                                            │
│  ⚠️  Job #SF-4819  ·  Negotiation stalled                  │
│     Rotterdam → Warsaw  ·  No deal after 4 rounds          │
│     AI suggested ceiling: €410  ·  Driver asking: €460     │
│     [ Approve €460 ]   [ Set new ceiling ]   [ Cancel ]   │
│                                                            │
│  ⚠️  Job #SF-4803  ·  Driver went silent  ·  8h no update  │
│     BMW X5  ·  Lyon → Madrid  ·  Customer notified         │
│     [ Reassign driver ]   [ Contact driver ]               │
│                                                            │
│────────────────────────────────────────────────────────────│
│  14 jobs running smoothly — no action needed               │
└────────────────────────────────────────────────────────────┘</pre>
						<p class="screen-card__note">{t.sc_ops_note}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- ─── FAQ ───────────────────────────────────────────────────────── -->
<section class="section section--alt" id="faq">
	<div class="container faq-container">
		<div class="section-label">{t.faq_label}</div>
		<h2 class="section-title">{t.faq_title}</h2>
		<div class="faq-list">
			<details class="faq-item">
				<summary>{t.faq_q1}</summary>
				<p>{t.faq_a1}</p>
			</details>
			<details class="faq-item">
				<summary>{t.faq_q2}</summary>
				<p>{t.faq_a2}</p>
			</details>
			<details class="faq-item">
				<summary>{t.faq_q3}</summary>
				<p>{t.faq_a3}</p>
			</details>
			<details class="faq-item">
				<summary>{t.faq_q4}</summary>
				<p>{t.faq_a4}</p>
			</details>
			<details class="faq-item">
				<summary>{t.faq_q5}</summary>
				<p>{t.faq_a5}</p>
			</details>
			<details class="faq-item">
				<summary>{t.faq_q6}</summary>
				<p>{t.faq_a6}</p>
			</details>
		</div>
	</div>
</section>

<!-- ─── TESTIMONIALS ─────────────────────────────────────────────── -->
<section class="section" id="testimonials">
	<div class="container">
		<div class="section-label">{t.test_label}</div>
		<h2 class="section-title">{t.test_title}</h2>
		<div class="testimonials-grid">
			<div class="testimonial">
				<div class="testimonial-stars">★★★★★</div>
				<p>{t.test1_text}</p>
				<div class="testimonial-author">{t.test1_author}</div>
			</div>
			<div class="testimonial">
				<div class="testimonial-stars">★★★★★</div>
				<p>{t.test2_text}</p>
				<div class="testimonial-author">{t.test2_author}</div>
			</div>
			<div class="testimonial">
				<div class="testimonial-stars">★★★★★</div>
				<p>{t.test3_text}</p>
				<div class="testimonial-author">{t.test3_author}</div>
			</div>
		</div>
	</div>
</section>

<!-- ─── QUOTE CTA ─────────────────────────────────────────────────── -->
<section class="section cta-section" id="quote">
	<div class="container cta-inner">
		<h2 class="cta-title">{t.cta_title}</h2>
		<p class="cta-sub">{t.cta_sub}</p>
		<div class="quote-form">
			<div class="quote-row">
				<div class="quote-field">
					<label for="pickup">{t.quote_pickup_label}</label>
					<input
						id="pickup"
						type="text"
						placeholder={t.quote_pickup_ph}
						bind:value={pickupAddr}
						style={!quoteFields.pickup ? 'border-color: #f87171' : ''}
					/>
				</div>
				<div class="quote-arrow">→</div>
				<div class="quote-field">
					<label for="delivery">{t.quote_delivery_label}</label>
					<input
						id="delivery"
						type="text"
						placeholder={t.quote_delivery_ph}
						bind:value={deliveryAddr}
						style={!quoteFields.delivery ? 'border-color: #f87171' : ''}
					/>
				</div>
			</div>
			<div class="quote-row quote-row--bottom">
				<div class="quote-field">
					<label for="car">{t.quote_car_label}</label>
					<input
						id="car"
						type="text"
						placeholder={t.quote_car_ph}
						bind:value={carModel}
						style={!quoteFields.car ? 'border-color: #f87171' : ''}
					/>
				</div>
				<div class="quote-field">
					<label for="email">{t.quote_email_label}</label>
					<input
						id="email"
						type="email"
						placeholder={t.quote_email_ph}
						bind:value={email}
						style={!quoteFields.email ? 'border-color: #f87171' : ''}
					/>
				</div>
				<button
					class="btn btn--primary btn--lg quote-submit"
					disabled={quoteSubmitted}
					onclick={handleQuoteSubmit}
				>
					{quoteSubmitted ? t.quote_submitted : t.quote_btn}
				</button>
			</div>
			<p class="quote-note">{t.quote_note}</p>
		</div>
	</div>
</section>

<!-- ─── FOOTER ────────────────────────────────────────────────────── -->
<footer class="footer">
	<div class="container footer-inner">
		<div class="footer-brand">
			<a href="#" class="nav__logo">
				<span class="logo-icon">🚗</span>
				<span>ShutUP <strong>Forwarder</strong></span>
			</a>
			<p>{t.footer_tagline}</p>
			<div class="footer-social">
				<a href="#" aria-label="LinkedIn">in</a>
				<a href="#" aria-label="Instagram">ig</a>
				<a href="#" aria-label="Facebook">fb</a>
			</div>
		</div>
		<div class="footer-links">
			<div class="footer-col">
				<h5>{t.footer_platform}</h5>
				<a href="#how-it-works">{t.footer_how}</a>
				<a href="#features">{t.footer_features}</a>
				<a href="#protection">{t.footer_protection}</a>
				<a href="#for-who">{t.footer_businesses}</a>
				<a href="#drivers">{t.footer_drivers}</a>
			</div>
			<div class="footer-col">
				<h5>{t.footer_routes}</h5>
				<a href="#">{t.footer_nl}</a>
				<a href="#">{t.footer_de}</a>
				<a href="#">{t.footer_be}</a>
				<a href="#">{t.footer_fr}</a>
				<a href="#">{t.footer_europe}</a>
			</div>
			<div class="footer-col">
				<h5>{t.footer_company}</h5>
				<a href="#">{t.footer_about}</a>
				<a href="#">{t.footer_blog}</a>
				<a href="#">{t.footer_careers}</a>
				<a href="#">{t.footer_contact}</a>
			</div>
			<div class="footer-col">
				<h5>{t.footer_legal}</h5>
				<a href="#">{t.footer_terms}</a>
				<a href="#">{t.footer_privacy}</a>
				<a href="#">{t.footer_cookies}</a>
				<a href="#">{t.footer_cmr}</a>
			</div>
		</div>
	</div>
	<div class="container footer-bottom">
		<span>{t.footer_copyright}</span>
		<span>{t.footer_built}</span>
	</div>
</footer>