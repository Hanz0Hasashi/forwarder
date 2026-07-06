<script lang="ts">
    import { onMount } from 'svelte';
    import { translations, type Lang } from '$lib/translations.js';

    let lang = $state<Lang>('en');
    let t = $derived(translations[lang]);
    let currentRole = $state('');

    const steps = $derived([
        { num: '01', icon: '📋', title: t.step1_title, desc: t.step1_desc },
        { num: '02', icon: '🤖', title: t.step2_title, desc: t.step2_desc },
        { num: '03', icon: '✅', title: t.step3_title, desc: t.step3_desc }
    ]);

    const features = $derived([
        { icon: '🤝', title: t.feat1_title, desc: t.feat1_desc },
        { icon: '📸', title: t.feat2_title, desc: t.feat2_desc },
        { icon: '📍', title: t.feat3_title, desc: t.feat3_desc },
        { icon: '🔍', title: t.feat4_title, desc: t.feat4_desc },
        { icon: '📄', title: t.feat5_title, desc: t.feat5_desc },
        { icon: '📜', title: t.feat6_title, desc: t.feat6_desc }
    ]);

    const faqItems = $derived([
        { q: t.faq_q1, a: t.faq_a1 },
        { q: t.faq_q2, a: t.faq_a2 },
        { q: t.faq_q3, a: t.faq_a3 },
        { q: t.faq_q4, a: t.faq_a4 },
        { q: t.faq_q5, a: t.faq_a5 },
        { q: t.faq_q6, a: t.faq_a6 }
    ]);

    const testimonials = $derived([
        { text: t.test1_text, author: t.test1_author },
        { text: t.test2_text, author: t.test2_author },
        { text: t.test3_text, author: t.test3_author }
    ]);

    function setLang(l: Lang) {
        lang = l;
        localStorage.setItem('shutup-lang', l);
    }

    onMount(() => {
        const saved = localStorage.getItem('shutup-lang') as Lang | null;
        if (saved === 'en' || saved === 'de') lang = saved;
        currentRole = localStorage.getItem('userRole') || '';
    });
</script>

<svelte:head>
    <title>{t.page_title}</title>
    <meta name="description" content={t.page_desc} />
</svelte:head>

<div class="bg-slate-50 text-slate-900">
    <section class="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-br from-white via-sky-50 to-orange-50">
        <div class="absolute inset-0 opacity-50 [background-image:radial-gradient(#dbeafe_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div class="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
            <div>
                <div class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                    {t.hero_badge}
                </div>
                <h1 class="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                    {t.hero_h1_1}
                    <span class="block bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">{t.hero_h1_2}</span>
                </h1>
                <p class="mt-5 max-w-xl text-base text-slate-600 sm:text-lg">{t.hero_sub}</p>

                <div class="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-600 shadow-sm backdrop-blur">
                    <span class="font-semibold text-amber-500">★★★★★</span>
                    <span>{t.hero_trust_rating}</span>
                    <span class="hidden h-4 w-px bg-slate-200 sm:inline-block"></span>
                    <span>{t.hero_trust_photos}</span>
                    <span class="hidden h-4 w-px bg-slate-200 sm:inline-block"></span>
                    <span>{t.hero_trust_ai}</span>
                    <span class="hidden h-4 w-px bg-slate-200 sm:inline-block"></span>
                    <span>{t.hero_trust_europe}</span>
                </div>

                <div class="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-1 py-1">
                    <button
                        class="rounded-full px-3 py-1 text-xs font-bold transition"
                        class:bg-slate-900={lang === 'en'}
                        class:text-white={lang === 'en'}
                        class:text-slate-600={lang !== 'en'}
                        onclick={() => setLang('en')}
                    >
                        EN
                    </button>
                    <button
                        class="rounded-full px-3 py-1 text-xs font-bold transition"
                        class:bg-slate-900={lang === 'de'}
                        class:text-white={lang === 'de'}
                        class:text-slate-600={lang !== 'de'}
                        onclick={() => setLang('de')}
                    >
                        DE
                    </button>
                </div>
            </div>

            <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
                <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div class="mb-3 flex items-center justify-between border-b border-slate-200 pb-3 text-xs font-semibold text-slate-500">
                        <span>•</span>
                        <span>{t.phone_job}</span>
                        <span>•</span>
                    </div>
                    <div class="text-sm font-bold text-slate-900">{t.phone_route}</div>
                    <div class="mt-1 text-xs text-slate-500">{t.phone_car}</div>
                    <div class="mt-4 space-y-2 text-xs">
                        <div class="text-emerald-600">{t.phone_collected}</div>
                        <div class="text-emerald-600">{t.phone_departed}</div>
                        <div class="font-semibold text-blue-600">{t.phone_active}</div>
                        <div class="text-slate-500">{t.phone_future}</div>
                    </div>
                    <div class="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs">
                        <span>{t.phone_driver}</span>
                        <span class="font-semibold text-amber-500">★★★★☆ 4.7</span>
                    </div>
                    <div class="mt-3 grid grid-cols-2 gap-2">
                        <button class="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1.5 text-xs font-semibold text-blue-700">📞 Call</button>
                        <button class="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-700">💬 Message</button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="how-it-works">
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">{t.how_label}</p>
        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t.how_title}</h2>
        <p class="mt-4 max-w-2xl text-slate-600">{t.how_sub}</p>

        <div class="mt-10 grid gap-4 md:grid-cols-3">
            {#each steps as step}
                <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <p class="text-xs font-extrabold tracking-[0.18em] text-blue-600">{step.num}</p>
                    <p class="mt-3 text-3xl">{step.icon}</p>
                    <h3 class="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                    <p class="mt-2 text-sm text-slate-600">{step.desc}</p>
                </article>
            {/each}
        </div>
    </section>

    <section class="border-y border-slate-200/70 bg-white" id="features">
        <div class="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">{t.features_label}</p>
            <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t.features_title}</h2>
            <p class="mt-4 max-w-2xl text-slate-600">{t.features_sub}</p>

            <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {#each features as feature}
                    <article class="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:shadow-md">
                        <p class="text-2xl">{feature.icon}</p>
                        <h3 class="mt-4 text-lg font-bold text-slate-900">{feature.title}</h3>
                        <p class="mt-2 text-sm text-slate-600">{feature.desc}</p>
                    </article>
                {/each}
            </div>
        </div>
    </section>

    <section class="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="protection">
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">{t.prot_label}</p>
        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t.prot_title}</h2>
        <p class="mt-4 max-w-2xl text-slate-600">{t.prot_sub}</p>

        <div class="mt-10 grid gap-4 lg:grid-cols-4">
            <article class="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                <p class="text-2xl">📱</p>
                <h4 class="mt-2 font-bold">{t.ev1_title}</h4>
                <p class="mt-1 text-sm text-slate-600">{t.ev1_desc}</p>
                <span class="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">🔒 Locked</span>
            </article>
            <article class="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                <p class="text-2xl">🚛</p>
                <h4 class="mt-2 font-bold">{t.ev2_title}</h4>
                <p class="mt-1 text-sm text-slate-600">{t.ev2_desc}</p>
                <span class="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">🔒 Locked</span>
            </article>
            <article class="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                <p class="text-2xl">🏠</p>
                <h4 class="mt-2 font-bold">{t.ev3_title}</h4>
                <p class="mt-1 text-sm text-slate-600">{t.ev3_desc}</p>
                <span class="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">🔒 Locked</span>
            </article>
            <article class="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-orange-50 p-5 text-center">
                <p class="text-2xl">🤖</p>
                <h4 class="mt-2 font-bold">{t.ev4_title}</h4>
                <p class="mt-1 text-sm text-slate-600">{t.ev4_desc}</p>
                <span class="mt-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">✦ AI Report</span>
            </article>
        </div>

        <p class="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>{t.prot_note_strong}</strong> {t.prot_note}
        </p>
    </section>

    <section class="border-y border-slate-200/70 bg-white" id="for-who">
        <div class="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">{t.who_label}</p>
            <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t.who_title}</h2>

            <div class="mt-10 grid gap-6 lg:grid-cols-2">
                <article class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <p class="text-3xl">🧑</p>
                    <h3 class="mt-4 text-2xl font-bold">{t.ind_title}</h3>
                    <ul class="mt-4 space-y-2 text-sm text-slate-600">
                        <li>• {t.ind_li1}</li>
                        <li>• {t.ind_li2}</li>
                        <li>• {t.ind_li3}</li>
                        <li>• {t.ind_li4}</li>
                    </ul>
                    <a href="/submit" class="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">{t.ind_cta}</a>
                </article>

                <article class="relative rounded-2xl border border-blue-300 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
                    <span class="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">{t.biz_badge}</span>
                    <p class="text-3xl">🏢</p>
                    <h3 class="mt-4 text-2xl font-bold">{t.biz_title}</h3>
                    <ul class="mt-4 space-y-2 text-sm text-slate-600">
                        <li>• {t.biz_li1}</li>
                        <li>• {t.biz_li2}</li>
                        <li>• {t.biz_li3}</li>
                        <li>• {t.biz_li4}</li>
                    </ul>
                    <a href="/submit" class="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">{t.biz_cta}</a>
                </article>
            </div>
        </div>
    </section>

    {#if !currentRole}
        <section class="bg-gradient-to-br from-slate-950 to-slate-900 text-white" id="drivers">
            <div class="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
                <div>
                    <p class="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">{t.drv_label}</p>
                    <h2 class="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{t.drv_title}</h2>
                    <p class="mt-4 max-w-2xl text-slate-300">{t.drv_sub}</p>
                    <ul class="mt-6 space-y-2 text-sm text-slate-200">
                        <li>• {t.drv_li1}</li>
                        <li>• {t.drv_li2}</li>
                        <li>• {t.drv_li3}</li>
                        <li>• {t.drv_li4}</li>
                        <li>• {t.drv_li5}</li>
                    </ul>
                    <a href="/driver-apply" class="mt-7 inline-flex rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">{t.drv_cta}</a>
                </div>

                <div class="rounded-3xl border border-slate-700 bg-slate-800 p-5">
                    <div class="text-sm font-semibold text-slate-200">{t.drv_jobs}</div>
                    <div class="mt-4 space-y-3">
                        <article class="rounded-xl border border-slate-700 bg-slate-900 p-3">
                            <p class="font-semibold">Amsterdam → Munich</p>
                            <p class="text-xs text-slate-400">BMW 3 Series · 2019</p>
                            <p class="mt-1 text-xs text-slate-400">📅 Thu 22 Apr</p>
                            <p class="mt-1 text-sm font-bold text-amber-400">💶 €320 – €380</p>
                            <div class="mt-2 grid grid-cols-2 gap-2">
                                <button class="rounded-lg bg-blue-950 px-2 py-1 text-xs font-semibold text-sky-300">💬 Bid</button>
                                <button class="rounded-lg bg-emerald-950 px-2 py-1 text-xs font-semibold text-emerald-300">✅ Accept</button>
                            </div>
                        </article>
                        <article class="rounded-xl border border-slate-700 bg-slate-900/60 p-3 opacity-80">
                            <p class="font-semibold">Rotterdam → Berlin</p>
                            <p class="text-xs text-slate-400">VW Golf · ⚠️ Non-running</p>
                            <p class="mt-1 text-xs text-slate-400">📅 Fri 23 Apr</p>
                            <p class="mt-1 text-sm font-bold text-amber-400">💶 €290 – €350</p>
                            <div class="mt-2 grid grid-cols-2 gap-2">
                                <button class="rounded-lg bg-blue-950 px-2 py-1 text-xs font-semibold text-sky-300">💬 Bid</button>
                                <button class="rounded-lg bg-emerald-950 px-2 py-1 text-xs font-semibold text-emerald-300">✅ Accept</button>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </section>
    {/if}

    <section class="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="step-by-step">
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">{t.sbs_label}</p>
        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t.sbs_title}</h2>

        <div class="mt-10 space-y-8">
            <article class="border-l-4 border-blue-600 pl-5">
                <p class="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">{t.s1_num}</p>
                <h3 class="mt-1 text-xl font-bold">{t.s1_title}</h3>
                <p class="mt-2 text-slate-600">{@html t.s1_desc}</p>
            </article>
            <article class="border-l-4 border-blue-600 pl-5">
                <p class="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">{t.s2_num}</p>
                <h3 class="mt-1 text-xl font-bold">{t.s2_title}</h3>
                <p class="mt-2 text-slate-600">{t.s2_desc}</p>
            </article>
            <article class="border-l-4 border-blue-600 pl-5">
                <p class="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">{t.s3_num}</p>
                <h3 class="mt-1 text-xl font-bold">{t.s3_title}</h3>
                <p class="mt-2 text-slate-600">{@html t.s3_desc}</p>
            </article>
            <article class="border-l-4 border-blue-600 pl-5">
                <p class="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">{t.s4_num}</p>
                <h3 class="mt-1 text-xl font-bold">{t.s4_title}</h3>
                <p class="mt-2 text-slate-600">{t.s4_desc}</p>
            </article>
            <article class="border-l-4 border-blue-600 pl-5">
                <p class="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">{t.s5_num}</p>
                <h3 class="mt-1 text-xl font-bold">{t.s5_title}</h3>
                <p class="mt-2 text-slate-600">{t.s5_desc}</p>
            </article>
            <article class="border-l-4 border-blue-600 pl-5">
                <p class="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">{t.s6_num}</p>
                <h3 class="mt-1 text-xl font-bold">{t.s6_title}</h3>
                <p class="mt-2 text-slate-600">{@html t.s6_desc}</p>
            </article>
        </div>
    </section>

    <section class="border-y border-slate-200/70 bg-white" id="agents">
        <div class="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">{t.agents_label}</p>
            <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t.agents_title}</h2>
            <p class="mt-4 max-w-2xl text-slate-600">{t.agents_sub}</p>

            <div class="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50">
                <table class="min-w-full text-left text-sm">
                    <thead class="bg-slate-100 text-xs font-bold uppercase tracking-wide text-slate-600">
                        <tr>
                            <th class="px-4 py-3">{t.roles_who}</th>
                            <th class="px-4 py-3">{t.roles_what}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
                        <tr><td class="px-4 py-3">🧑 <strong>{t.role_customer}</strong></td><td class="px-4 py-3">{t.role_customer_desc}</td></tr>
                        <tr><td class="px-4 py-3">🚛 <strong>{t.role_driver}</strong></td><td class="px-4 py-3">{t.role_driver_desc}</td></tr>
                        <tr><td class="px-4 py-3">👩‍💼 <strong>{t.role_ops}</strong></td><td class="px-4 py-3">{t.role_ops_desc}</td></tr>
                        <tr><td class="px-4 py-3">👨‍💼 <strong>{t.role_adjuster}</strong></td><td class="px-4 py-3">{t.role_adjuster_desc}</td></tr>
                        <tr><td class="px-4 py-3">🔧 <strong>{t.role_admin}</strong></td><td class="px-4 py-3">{t.role_admin_desc}</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <section class="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8" id="faq">
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">{t.faq_label}</p>
        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t.faq_title}</h2>

        <div class="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {#each faqItems as item}
                <details class="group p-4">
                    <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                        {item.q}
                        <span class="text-blue-600 transition group-open:rotate-45">+</span>
                    </summary>
                    <p class="pt-3 text-sm text-slate-600">{item.a}</p>
                </details>
            {/each}
        </div>
    </section>

    <section class="border-y border-slate-200/70 bg-white" id="testimonials">
        <div class="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">{t.test_label}</p>
            <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t.test_title}</h2>
            <div class="mt-10 grid gap-4 md:grid-cols-3">
                {#each testimonials as item}
                    <article class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                        <p class="text-amber-500">★★★★★</p>
                        <p class="mt-3 text-sm italic text-slate-600">{item.text}</p>
                        <p class="mt-4 text-sm font-semibold text-slate-900">{item.author}</p>
                    </article>
                {/each}
            </div>
        </div>
    </section>

    <footer class="bg-slate-950 text-slate-300">
        <div class="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:px-8">
            <div class="lg:col-span-2">
                <a href="/" class="inline-flex items-center gap-2 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10 17h4V5H2v12h3"></path>
                        <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"></path>
                        <path d="M14 17h1"></path>
                        <circle cx="7.5" cy="17.5" r="2.5"></circle>
                        <circle cx="17.5" cy="17.5" r="2.5"></circle>
                    </svg>
                    <span class="font-bold">ShutUP Forwarder</span>
                </a>
                <p class="mt-4 max-w-md text-sm text-slate-400">{t.footer_tagline}</p>
                <div class="mt-4 flex gap-3">
                    <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" class="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700">in</a>
                    <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" class="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700">ig</a>
                    <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" class="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700">fb</a>
                </div>
            </div>

            <div>
                <h5 class="text-xs font-bold uppercase tracking-[0.2em] text-slate-200">{t.footer_platform}</h5>
                <div class="mt-3 space-y-2 text-sm text-slate-400">
                    <a class="block hover:text-white" href="#how-it-works">{t.footer_how}</a>
                    <a class="block hover:text-white" href="#features">{t.footer_features}</a>
                    <a class="block hover:text-white" href="#protection">{t.footer_protection}</a>
                    <a class="block hover:text-white" href="#for-who">{t.footer_business}</a>
                    <a class="block hover:text-white" href="#drivers">{t.footer_drivers}</a>
                </div>
            </div>

            <div>
                <h5 class="text-xs font-bold uppercase tracking-[0.2em] text-slate-200">{t.footer_routes}</h5>
                <div class="mt-3 space-y-2 text-sm text-slate-400">
                    <a class="block hover:text-white" href="/submit?region=nl">{t.footer_nl}</a>
                    <a class="block hover:text-white" href="/submit?region=de">{t.footer_de}</a>
                    <a class="block hover:text-white" href="/submit?region=be">{t.footer_be}</a>
                    <a class="block hover:text-white" href="/submit?region=fr">{t.footer_fr}</a>
                    <a class="block hover:text-white" href="/submit?region=eu">{t.footer_eu}</a>
                </div>
            </div>

            <div>
                <h5 class="text-xs font-bold uppercase tracking-[0.2em] text-slate-200">{t.footer_legal}</h5>
                <div class="mt-3 space-y-2 text-sm text-slate-400">
                    <a class="block hover:text-white" href="/#faq">{t.footer_tos}</a>
                    <a class="block hover:text-white" href="/#faq">{t.footer_privacy}</a>
                    <a class="block hover:text-white" href="/#faq">{t.footer_cookies}</a>
                    <a class="block hover:text-white" href="/#protection">{t.footer_cmr}</a>
                </div>
            </div>
        </div>

        <div class="border-t border-slate-800">
            <div class="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                <span>{t.footer_copyright}</span>
                <span>{t.footer_built}</span>
            </div>
        </div>
    </footer>
</div>
