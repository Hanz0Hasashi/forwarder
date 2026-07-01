<script lang="ts">
    import { onMount } from 'svelte';
    import { translations, type Lang } from '$lib/translations.js';
    import { goto } from '$app/navigation';
    
    // ── Reactive state ───────────────────────────────────────────────
    let lang = $state<Lang>('en');
    let t = $derived(translations[lang]);

    let menuOpen = $state(false);
    let isLoggedIn = $state(false);
    let currentRole = $state('');

    // ── Quote form ───────────────────────────────────────────────────
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

        if (!Object.values(quoteFields).every(Boolean)) return;

        quoteSubmitted = true;

        setTimeout(() => {
            goto('/submit');
        }, 1000); 
    }

    function handleLogout(e: Event) {
        e.preventDefault();
        if (typeof window !== 'undefined' && window.Clerk) {
            window.Clerk.signOut({ redirectUrl: '/' }).then(() => {
                isLoggedIn = false; 
                currentRole = '';
                localStorage.removeItem('userRole');
            });
        }
    }

    onMount(() => {
        const saved = localStorage.getItem('shutup-lang') as Lang | null;
        if (saved === 'en' || saved === 'de') lang = saved;

        // 1. Grab the role from memory
        currentRole = localStorage.getItem('userRole') || '';

        // 2. INSTANT UI FIX: If they have a role, they are logged in. Show the Logout button immediately.
        if (currentRole) {
            isLoggedIn = true;
        }

        // 3. Robust Clerk Polling: Don't stop checking until the user is actually loaded
        let checkInterval = setInterval(() => {
            if (typeof window !== 'undefined' && window.Clerk) {
                if (window.Clerk.user) {
                    isLoggedIn = true;
                    clearInterval(checkInterval); // NOW we can safely stop checking
                }
            }
        }, 100);

        // Safety net: kill the interval after 3 seconds if they are genuinely logged out
        setTimeout(() => {
            clearInterval(checkInterval);
        }, 3000);

        const nav = document.getElementById('nav');
        const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });

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
            clearInterval(checkInterval); 
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

<section class="hero">
    <div class="hero__bg-grid"></div>
    <div class="container hero-flex">
        <div class="hero__inner">
            <div class="badge">{t.hero_badge}</div>
            <h1 class="hero__headline">
                {t.hero_h1_1}<br />
                <span class="gradient-text">{t.hero_h1_2}</span>
            </h1>
            <p class="hero__sub">{t.hero_sub}</p>
            

            <div class="hero__trust mt-10">
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

        <div class="hero__mockup-wrap">
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
    </div>
</section>

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

{#if !currentRole}
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
            <a href="/driver-apply" class="btn btn--white btn--lg">{t.drv_cta}</a>
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
{/if}

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
        </div>

        <div class="deep-step">
            <div class="deep-step__header">
                <div class="deep-step__num">{t.s2_num}</div>
                <h3>{t.s2_title}</h3>
            </div>
            <p class="deep-step__desc">{t.s2_desc}</p>
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
        </div>

        <div class="deep-step">
            <div class="deep-step__header">
                <div class="deep-step__num">{t.s5_num}</div>
                <h3>{t.s5_title}</h3>
            </div>
            <p class="deep-step__desc">{t.s5_desc}</p>
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

<section class="section section--alt" id="agents">
    <div class="container">
        <div class="section-label">{t.agents_label}</div>
        <h2 class="section-title">{t.agents_title}</h2>
        <p class="section-sub">{t.agents_sub}</p>

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


<footer class="footer">
    <div class="container footer-inner">
        <div class="footer-brand">
            <a href="#" class="nav__logo">
                <span class="logo-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                        <path d="M10 17h4V5H2v12h3"></path>
                        <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"></path>
                        <path d="M14 17h1"></path>
                        <circle cx="7.5" cy="17.5" r="2.5"></circle>
                        <circle cx="17.5" cy="17.5" r="2.5"></circle>
                    </svg>
                </span>
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
                <a href="#for-who">{t.footer_business}</a>
                <a href="#drivers">{t.footer_drivers}</a>
            </div>
            <div class="footer-col">
                <h5>{t.footer_routes}</h5>
                <a href="#">{t.footer_nl}</a>
                <a href="#">{t.footer_de}</a>
                <a href="#">{t.footer_be}</a>
                <a href="#">{t.footer_fr}</a>
                <a href="#">{t.footer_eu}</a>
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
                <a href="#">{t.footer_tos}</a>
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

<style>
    /* Desktop layout for Hero */
    @media (min-width: 1024px) {
        .hero-flex {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 2rem;
            position: relative;
            z-index: 10;
        }
        .hero__inner, .hero__mockup-wrap {
            flex: 1;
            margin: 0 !important;
        }
        .hero__mockup-wrap {
            display: flex;
            justify-content: flex-end;
        }
    }
</style>