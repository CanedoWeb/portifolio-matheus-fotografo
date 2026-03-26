if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
    ScrollTrigger.refresh(true);
    setTimeout(() => window.scrollTo(0, 0), 50);
});
document.addEventListener("DOMContentLoaded", (event) => {
    gsap.registerPlugin(ScrollTrigger);

    function applySplitText(elements) {
        if (!elements || elements.length === 0) return;
        elements.forEach(el => {
            const text = el.innerText;
            el.innerHTML = "";
            text.split(' ').forEach((word, wordIndex, wordsArray) => {
                const wordSpan = document.createElement('span');
                wordSpan.style.display = 'inline-block';
                word.split('').forEach(char => {
                    const charSpan = document.createElement('span');
                    charSpan.className = 'split-char';
                    charSpan.innerHTML = char;
                    wordSpan.appendChild(charSpan);
                });
                el.appendChild(wordSpan);
                if (wordIndex < wordsArray.length - 1) {
                    el.appendChild(document.createTextNode(' '));
                }
            });
        });
    }

    // SETUP INICIAL (Agora será feito dentro do matchMedia no initScroll para ser responsivo)
    gsap.set('.img', { opacity: 0 });
    applySplitText(document.querySelectorAll('.default-footer .giant-title, .default-footer .giant-num, .album-label h3, .album-label p'));

    // ==========================================
    // 0. PRELOADER & INTRO LOGIC
    // ==========================================
    const preloader = document.querySelector('.preloader');
    const preloaderPercent = document.querySelector('.preloader-percent');

    // Função de Contagem (Simulada para visual premium)
    let progress = 0;
    function updateProgress() {
        // Incrementos aleatórios para parecer carregamento real
        progress += Math.floor(Math.random() * 10) + 1;

        if (progress >= 100) {
            progress = 100;
            preloaderPercent.innerText = "100%";
            startSite(); // Dispara a revelação
        } else {
            preloaderPercent.innerText = progress + "%";
            // Velocidade variável
            setTimeout(updateProgress, Math.random() * 150 + 50);
        }
    }

    // Inicia a contagem assim que o script carrega
    updateProgress();

    function startSite() {
        // Inicializa o ScrollTrigger IMEDIATAMENTE (antes da intro)
        // A seção "Sobre" já está hidden no CSS, então não há flash
        initScroll();

        const introTl = gsap.timeline();

        // 1. Matar o preloader
        introTl.to(preloader, {
            opacity: 0,
            pointerEvents: "none",
            duration: 1,
            ease: "power2.inOut",
            delay: 0.5
        });

        // 2. Intro Animation (Só começa dps que o preto some)
        const introTexts = document.querySelectorAll('h1 span, .nav-left');
        applySplitText(introTexts);

        introTl.from('h1 .split-char, .nav-left .split-char', {
            duration: 1,
            y: 80,
            rotationX: -90,
            opacity: 0,
            stagger: 0.02,
            ease: "expo.inOut"
        }, "-=0.5")
            .from('.nav-right', {
                duration: 1,
                y: -80,
                x: 80,
                rotation: 45,
                opacity: 0,
                ease: "expo.inOut"
            }, "<")
            .from('.img-hero', {
                duration: 2,
                filter: "blur(10px)",
                x: "0vw",
                y: "0vh",
                rotation: 0,
                scale: 0.5,
                opacity: 0,
                ease: "expo.inOut",
            }, "<")
            .from('.hero-subtitle', {
                opacity: 0,
                y: 40,
                duration: 1,
                ease: "expo.out"
            })
            .fromTo('.hero-btn', {
                opacity: 0,
                y: 40
            }, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "expo.out"
            }, "<");
    }


    // ==========================================
    // SCROLLTIMELINE PRINCIPAL (CHAMADO APÓS INTRO)
    // ==========================================
    // ==========================================
    // GSAP MATCHMEDIA PARA RESPONSIVIDADE
    // ==========================================
    let mm = gsap.matchMedia();
    let mainTl; // Exposto globalmente para o menu acessar os labels

    function initScroll() {

        mm.add({
            // Desktop
            isDesktop: "(min-width: 769px)",
            // Mobile
            isMobile: "(max-width: 768px)"
        }, (context) => {
            let { isDesktop, isMobile } = context.conditions;

            mainTl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: isDesktop ? "+=1000%" : "+=1500%", // Mobile mais longo = mais devagar
                    scrub: 2, // Mais suavização para o scroll rápido do cel
                    pin: true,
                    invalidateOnRefresh: true
                }
            });

            // Label HOME
            mainTl.addLabel("home");

            // --- SETUP INICIAL RESPONSIVO ---
            // Apenas as 3 primeiras visíveis e empilhadas no centro
            gsap.set('.h1', { filter: "blur(1px)", opacity: 1, x: isDesktop ? "-12vw" : "-8vw", y: "-2vh", rotation: -15, scale: isDesktop ? 1 : 0.75, zIndex: 2 });
            gsap.set('.h2', { filter: "blur(1px)", opacity: 1, x: "0vw", y: "-5vh", rotation: -2, scale: isDesktop ? 1 : 0.75, zIndex: 3 });
            gsap.set('.h3', { filter: "blur(1px)", opacity: 1, x: isDesktop ? "12vw" : "8vw", y: "5vh", rotation: 12, scale: isDesktop ? 1 : 0.75, zIndex: 4 });

            // As demais capas começam invisíveis
            gsap.set('.h4, .h5, .h6, .h7', { opacity: 0, x: 0, y: 0, scale: isDesktop ? 1 : 0.75, zIndex: 1 });
            gsap.set('.extra', { opacity: 0, x: 0, y: 0, scale: 0 });

            gsap.set('.about-section, .contact-section', { visibility: 'visible' });

            // FASE 2 — Fade out txt
            mainTl.to('.hero-content', { opacity: 0, y: -50, pointerEvents: "none", duration: 2, ease: "expo.inOut" }, 0);

            // FASE 3 — Junção
            mainTl.to('.img-hero', {
                filter: "blur(0px)",
                x: "0vw",
                y: "0vh",
                rotation: 0,
                scale: isDesktop ? 1 : 0.75, // Mantém menor no Hero Mobile
                duration: 4,
                ease: "expo.inOut"
            }, 1);
            mainTl.to('.h4, .h5, .h6, .h7', { opacity: 1, duration: 4, ease: "expo.inOut" }, 1);

            // Label MELHORES (Início do espalhamento)
            mainTl.addLabel("melhores", "+=0");

            // FASE 4 — Reorganização (Adaptado por Device)
            if (isDesktop) {
                mainTl.to('.h3', { x: "0vw", y: "-28vh", rotation: 8, scale: 0.65, zIndex: 3, duration: 4, ease: "expo.inOut" })
                    .to('.h2', { x: "-18vw", y: "28vh", rotation: 8, scale: 0.65, zIndex: 2, duration: 4, ease: "expo.inOut" })
                    .to('.h1', { x: "-42vw", y: "0vh", rotation: -4, scale: 0.75, zIndex: 1, duration: 4, ease: "expo.inOut" })
                    .to('.h7', { x: "28vw", y: "8vh", rotation: 15, scale: 0.8, zIndex: 7, duration: 4, ease: "expo.inOut" })
                    .to('.h6', { x: "-24vw", y: "-22vh", rotation: -10, scale: 0.65, zIndex: 6, duration: 4, ease: "expo.inOut" })
                    .to('.h5', { x: "42vw", y: "-8vh", rotation: 5, scale: 0.65, zIndex: 5, duration: 4, ease: "expo.inOut" })
                    .to('.h4', { x: "9vw", y: "22vh", rotation: -6, scale: 0.65, zIndex: 4, duration: 4, ease: "expo.inOut" });
            } else {
                // Mobile: Espalhamento mais vertical e centralizado
                mainTl.to('.h3', { x: "0vw", y: "-40vh", rotation: 5, scale: 0.4, zIndex: 10, duration: 4, ease: "expo.inOut" })
                    .to('.h2', { x: "6vw", y: "40vh", rotation: -5, scale: 0.4, zIndex: 9, duration: 4, ease: "expo.inOut" })
                    .to('.h1', { x: "-35vw", y: "10vh", rotation: -8, scale: 0.4, zIndex: 8, duration: 4, ease: "expo.inOut" })
                    .to('.h7', { x: "30vw", y: "-18vh", rotation: 10, scale: 0.4, zIndex: 7, duration: 4, ease: "expo.inOut" })
                    .to('.h6', { x: "-20vw", y: "-20vh", rotation: -5, scale: 0.4, zIndex: 6, duration: 4, ease: "expo.inOut" })
                    .to('.h5', { x: "20vw", y: "20vh", rotation: 5, scale: 0.4, zIndex: 5, duration: 4, ease: "expo.inOut" })
                    .to('.h4', { x: "0vw", y: "0vh", rotation: 0, scale: 0.4, zIndex: 4, duration: 4, ease: "expo.inOut" });
            }

            // FASE 5 — Galeria Alinhada
            mainTl.to('.img-hero', {
                x: (i) => isDesktop ? (i * 18.25 - 36.875) + "vw" : (i * 85) + "vw", // Mobile: 85vw para peeking lateral
                y: isDesktop ? "-10vh" : "0vh",
                rotation: 0,
                scale: isDesktop ? 0.65 : 1, // Mobile: Escala real 1:1 com o CSS (80vw)
                zIndex: (i) => i + 1,
                duration: 3,
                ease: "expo.inOut"
            }, "+=1");

            mainTl.set('.default-footer', { opacity: 1 }, "<");
            mainTl.fromTo('.default-footer .split-char', { opacity: 0, y: 100 }, { opacity: 1, y: 0, stagger: { amount: 2 }, duration: 2, ease: "expo.out" }, "<");

            mainTl.set('.hitboxes-container', { opacity: 1 }, "-=1");
            mainTl.fromTo('.album-label .split-char', { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: { amount: 1.5 }, duration: 1.5, ease: "expo.out" }, "<");
            mainTl.set('.galeria-ui, .hitboxes-container', { pointerEvents: "none" }, "<");
            mainTl.set('.album-link', { pointerEvents: "auto" }, "<");

            // Label GALERIA
            mainTl.addLabel("galeria");

            // FASE 7 — Scroll Horizontal
            mainTl.to('.hitboxes-container, .stage', {
                x: () => {
                    const container = document.querySelector('.hitboxes-container');
                    return -(container.scrollWidth - window.innerWidth);
                },
                ease: "none",
                duration: isDesktop ? 8 : 12
            });

            mainTl.to('.stage, .galeria-ui, .default-footer', { opacity: 0, pointerEvents: "none", duration: 2, ease: "power2.inOut" });

            initContentAnimations();

            return () => {
                // Cleanup
            };
        });
    }

    // Só habilita o Preview de Menu se for desktop (mouse)
    mm.add("(min-width: 769px)", () => {
        initMenuPreview();
    });





    // ==========================================
    // LÓGICA DE CLICK E NATIVE SCROLL MODALS
    // ==========================================
    let isAlbumOpen = false;
    const links = document.querySelectorAll('.album-link');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (isAlbumOpen) return;
            isAlbumOpen = true;

            // Tranca scroll original principal, pra evitar timeline scrub não intencional
            document.body.style.overflow = "hidden";

            const albumIndex = link.getAttribute('data-index');
            const clickedImgClass = `.h${albumIndex}`;
            const titleText = link.getAttribute('data-title');
            const numText = `0${albumIndex}`;

            // Ocultar UI Estática
            gsap.to('.album-label', { opacity: 0, duration: 0.3 });
            gsap.to('.default-footer', {
                opacity: 0, duration: 0.4, onComplete: () => {
                    document.querySelector('.default-footer').style.display = 'none';
                }
            });

            const isMobile = window.innerWidth <= 768;
            
            // Resolve a precisão cirúrgica de cálculo baseada no dispositivo
            const finalWidthPx = isMobile ? (window.innerWidth * 0.8) : Math.min(window.innerWidth * 0.25, 350);
            const finalHeightPx = finalWidthPx * 1.25; // Proporção 4/5 

            // O topo físico da GSAP Capa deve tocar cirurgicamente o topo (ou quase) do viewport!
            // No mobile, adicionamos um pequeno respiro de 2vh para não 'colar' no topo
            const topMargin = isMobile ? (window.innerHeight * 0.05) : 0; 
            const yOffsetTargetinPixels = (finalHeightPx / 2) - (window.innerHeight / 2) + topMargin;

            gsap.to(clickedImgClass, {
                y: yOffsetTargetinPixels, // Interpolação lida nativa imaculada
                scale: 1,
                duration: 0.8,
                ease: "expo.inOut"
            });

            // Encolhe e Ofusca as Outras Capas da Timeline
            const outrasImagens = [1, 2, 3, 4, 5, 6, 7].filter(v => v != albumIndex).map(v => `.h${v}`).join(', ');
            gsap.to(outrasImagens, {
                opacity: 0.3,
                scale: 0.45,
                duration: 0.8,
                ease: "expo.inOut"
            });

            // Reage o HTML da native Modal Isolada para fotos extras!
            const modalId = `album-modal-${albumIndex}`;
            const modalEl = document.getElementById(modalId);

            if (modalEl) {
                modalEl.style.display = "block"; // Mudado pra block para poder ser posicionado precisamente
                modalEl.scrollTop = 0; // Força o Reset do Scroll AQUI enquanto o HTML está visível para não falhar!

                // Iguala o Z-index do Stage com o Z-index da modal nativa para andarem 100% alinhados!
                gsap.set('.stage', { zIndex: 50 });

                const col = modalEl.querySelector('.album-scroll-col');
                // Crava a coluna inteira exatamente no eixo X da capa lendo a geometria física NAQUELE milissegundo!
                const coverEl = document.querySelector(clickedImgClass);
                const rect = coverEl.getBoundingClientRect();
                const currentCenterX = rect.left + (rect.width / 2);

                col.style.left = currentCenterX + "px";
                col.style.transform = `translateX(-50%)`;

                // Applica a matemática à risca blindando qualquer sobreposição visual com a Capa
                // Aumentado para 10vh para dar o 'espaçamento suficiente' solicitado
                col.style.paddingTop = `calc(${finalHeightPx}px + 10vh)`;

                // GSAP anima as imagens extras caindo por baixo do hero preservado!
                gsap.fromTo(modalEl.querySelectorAll('.modal-img'),
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: "expo.out", delay: 0.4 }
                );

                // A MÁGICA FINAL: Sync Matemático do CSS com GSAP!
                // Quando a Modal de Scroll descer as figuras normais nativamente...
                // injetamos a matemática para elevar a Capa Mestre absoluta da Stage no mesmo ratio 1:1 !!
                modalEl.onscroll = () => {
                    gsap.set(clickedImgClass, { y: yOffsetTargetinPixels - modalEl.scrollTop });
                };
            }

            // Toca textos the album open state
            document.querySelector('.album-active-num').innerText = numText;
            document.querySelector('.album-active-title').innerText = titleText;
            applySplitText(document.querySelectorAll('.album-active-num, .album-active-title'));

            document.querySelector('.album-footer').style.display = 'flex';
            gsap.set('.album-footer', { opacity: 1 });
            gsap.fromTo('.album-footer .split-char',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, stagger: { amount: 0.5 }, duration: 0.8, delay: 0.3, ease: "expo.out" }
            );
        });
    });

    // FECHAR AO CLICAR FORA
    document.querySelector('.galeria-ui').addEventListener('click', (e) => {
        // Impede o fechamento se clicou em uma nav ou num album link real
        if (isAlbumOpen && !e.target.closest('.album-link') && !e.target.closest('.gallery-nav') && !e.target.closest('.gallery-footer')) {
            closeAlbum();
        }
    });

    function closeAlbum() {
        isAlbumOpen = false;

        // Devolve as fotos pro fundo absoluto
        gsap.set('.stage', { zIndex: 1 });

        // Recolhe native modals ativas e desconecta os listeners
        document.querySelectorAll('.album-scroll-modal').forEach(m => {
            m.onscroll = null; // Importantíssimo matar a sincronia
            gsap.to(m.querySelectorAll('.modal-img'), {
                opacity: 0, y: 50, duration: 0.4, onComplete: () => {
                    m.style.display = 'none';
                    m.scrollTop = 0; // Volta o modal nativo lá pro topo do álbum para a próxima visita do usuário!
                }
            });
        });

        // Solta a âncora geral restaurando o scroll nativo
        document.body.style.overflow = "";

        const isMobile = window.innerWidth <= 768;

        // Restaura layout da base Stage Phase 5 e puxa opacidade de 1 p/ anular o swap
        gsap.to('.img-hero', {
            y: isMobile ? "0vh" : "-10vh",
            scale: isMobile ? 1 : 0.65,
            opacity: 1,
            duration: 0.8,
            ease: "expo.inOut"
        });

        gsap.to('.album-footer', {
            opacity: 0, duration: 0.4, onComplete: () => {
                document.querySelector('.album-footer').style.display = 'none';
                document.querySelector('.default-footer').style.display = 'flex';

                // Restaura a opacidade dos containers 'pais' antes de animar as letras 'filhas'
                gsap.set('.default-footer, .album-label', { opacity: 1 });

                gsap.fromTo('.default-footer .split-char',
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, stagger: { amount: 0.5 }, duration: 0.8, ease: "expo.out" }
                );
                gsap.fromTo('.album-label .split-char',
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, stagger: { amount: 1 }, duration: 0.8, delay: 0.2, ease: "expo.out" }
                );
            }
        });
    }

    // ==========================================
    // SEÇÃO SOBRE MIM + CONTATO (ANIMAÇÕES DE SCROLL)
    // Registradas após initScroll() para garantir que o pin-spacer já existe
    // e as posições dos gatilhos são calculadas corretamente.
    // ==========================================
    function initContentAnimations() {

        // SOBRE MIM — split text + revelar letra a letra
        const splitElements = document.querySelectorAll('.split-title, .about-text-box p');
        if (splitElements.length > 0) {
            applySplitText(splitElements);
            splitElements.forEach(el => {
                gsap.fromTo(el.querySelectorAll('.split-char'),
                    { opacity: 0, y: -50 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: { amount: 0.6 },
                        duration: 0.8,
                        ease: "expo.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 98%",
                            toggleActions: "play reverse play reverse"
                        }
                    }
                );
            });
        }

        // CONTATO — split text no título e nos links
        const contactSplitEls = document.querySelectorAll('.contact-title, .contact-link');
        applySplitText(contactSplitEls);

        gsap.fromTo('.contact-title .split-char',
            { opacity: 0, y: 80 },
            {
                opacity: 1, y: 0,
                stagger: { amount: 0.8 },
                duration: 1.2,
                ease: "expo.out",
                scrollTrigger: {
                    trigger: ".contact-title",
                    start: "top 95%",
                    toggleActions: "play reverse play reverse"
                }
            }
        );

        gsap.fromTo('.contact-link .split-char',
            { opacity: 0, y: 30 },
            {
                opacity: 1, y: 0,
                stagger: { amount: 1 },
                duration: 0.8,
                ease: "expo.out",
                scrollTrigger: {
                    trigger: ".contact-box-top",
                    start: "top 90%",
                    toggleActions: "play reverse play reverse"
                }
            }
        );

        gsap.from('.contato-btn', {
            opacity: 0,
            y: 40,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: {
                trigger: ".contato-btn",
                start: "top 95%",
                toggleActions: "play reverse play reverse"
            }
        });

        // Fotos da colagem entram em cascata girando
        gsap.from('.collage-img', {
            y: 150,
            opacity: 0,
            rotation: 40,
            scale: 0.5,
            stagger: 0.1,
            duration: 1.2,
            ease: "back.out(1.2)",
            scrollTrigger: {
                trigger: ".contact-section",
                start: "top 75%",
                toggleActions: "play reverse play reverse"
            }
        });
    }


    // ==========================================
    // MENU OVERLAY INTERACTIVE LOGIC
    // ==========================================
    const burgerBtn = document.querySelector('.burger-btn');
    const overlay = document.querySelector('.menu-overlay');

    // Timeline dedicada que fica "guardada" e só é tocada no clique
    const menuTl = gsap.timeline({ paused: true });

    // 1. O fundo preto desliza a opacidade
    menuTl.to(overlay, {
        opacity: 1,
        y: "0%",
        pointerEvents: "auto",
        duration: 0.5,
        ease: "power2.inOut"
    })
        // 2. Os links saltam rasgando de baixo para cima
        .fromTo('.menu-link .link-text', {
            y: "110%", // A posição de repouso deles (estao afogados invisiveis devido ao clip-path do pai)
            rotation: 2 // Uma levíssima torção charmosinha
        }, {
            y: "0%",
            rotation: 0,
            stagger: 0.1, // Distribução 
            duration: 0.8,
            ease: "expo.out"
        }, "-=0.2"); // Eles começam a nascer antes mesmo do fundo ficar perfeitamente breu total

    let isMenuOpen = false;

    // Vínculos de Ação no Mouse -> Toggle
    burgerBtn.addEventListener('click', () => {
        if (!isMenuOpen) {
            menuTl.play();
            burgerBtn.classList.add('open');
            isMenuOpen = true;
        } else {
            menuTl.reverse();
            burgerBtn.classList.remove('open');
            isMenuOpen = false;
        }
    });

    // Helper para converter label em posição de scroll (px)
    function getScrollPos(label) {
        if (!mainTl || !mainTl.scrollTrigger) return 0;
        const labelTime = mainTl.labels[label];
        const totalDuration = mainTl.totalDuration();
        const st = mainTl.scrollTrigger;
        // Interpola a posição do label entre o start e end do ScrollTrigger
        return st.start + (labelTime / totalDuration) * (st.end - st.start);
    }

    // Fecha o menu automaticamente se a pessoa clicar num link dele
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            if (href.startsWith('#')) {
                e.preventDefault();

                // Fecha o menu primeiro
                menuTl.reverse();
                burgerBtn.classList.remove('open');
                isMenuOpen = false;

                // Força o ScrollTrigger a recalcular tudo antes de pular (essencial para pins)
                ScrollTrigger.refresh();

                let scrollTarget;
                if (href === "#home") {
                    scrollTarget = getScrollPos("home");
                } else if (href === "#melhores") {
                    scrollTarget = getScrollPos("melhores");
                } else if (href === "#galeria-ui") {
                    scrollTarget = getScrollPos("galeria");
                } else {
                    // Para seções fora do pin (Sobre/Contato), busca o elemento
                    const el = document.querySelector(href);
                    scrollTarget = el ? el : 0;
                }

                gsap.to(window, {
                    scrollTo: {
                        y: scrollTarget,
                        autoKill: false
                    },
                    duration: 1.5,
                    ease: "power4.inOut"
                });
            } else {
                menuTl.reverse();
                burgerBtn.classList.remove('open');
                isMenuOpen = false;
            }
        });
    });

    // ==========================================
    // INTERAÇÃO PREMIUM: CURSOR-TRACKING IMAGE PREVIEW (MENU)
    // ==========================================
    function initMenuPreview() {
        const menuLinks = document.querySelectorAll('.menu-link');

        menuLinks.forEach(link => {
            const preview = link.querySelector('.menu-preview');
            if (!preview) return;

            // Criamos os setters otimizados (quickTo) para cada preview individual
            const xTo = gsap.quickTo(preview, "x", { duration: 0.4, ease: "power3" });
            const yTo = gsap.quickTo(preview, "y", { duration: 0.4, ease: "power3" });

            link.addEventListener('mouseenter', (e) => {
                // Sincroniza a posição inicial instantaneamente para não "voar" do zero
                gsap.set(preview, {
                    x: e.clientX,
                    y: e.clientY
                });

                // Abre o preview suavemente
                gsap.to(preview, {
                    autoAlpha: 1,
                    scale: 1,
                    duration: 0.3
                });
            });

            link.addEventListener('mousemove', (e) => {
                // Atualiza a posição com o delay elástico do quickTo
                xTo(e.clientX);
                yTo(e.clientY);
            });

            link.addEventListener('mouseleave', () => {
                // Fecha o preview
                gsap.to(preview, {
                    autoAlpha: 0,
                    scale: 0.8,
                    duration: 0.3
                });
            });
        });
    }

    // Inicializa as visualizações de menu (Removido daqui pois agora está no mm.add)
    // initMenuPreview();

    // ==========================================
    // INTERAÇÃO PREMIUM: TILT 3D NO CONTATO (PERSISTENTE)
    // ==========================================
    function initTiltHover() {
        const tiltElements = document.querySelectorAll('.collage-img');

        tiltElements.forEach(el => {
            gsap.set(el, { transformPerspective: 1000 });

            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const relX = (x / rect.width) - 0.5;
                const relY = (y / rect.height) - 0.5;

                const tiltAmount = 10;
                const moveAmount = 10;

                gsap.to(el, {
                    rotationY: relX * tiltAmount,
                    rotationX: -relY * tiltAmount,
                    xPercent: relX * moveAmount,
                    yPercent: relY * moveAmount,
                    duration: 1.5,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });
            // Sem mouseleave: a inclinação fica fixa no último ponto
        });
    }

    initTiltHover();
});
