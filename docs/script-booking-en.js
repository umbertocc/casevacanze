async function eseguiPrenotazioneOnline(datiPrenotazione) {
    const response = await fetch('https://demo-mail-993653817397.europe-west8.run.app/api/prenotazioni/public', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(datiPrenotazione)
    });

    if (!response.ok) {
        const details = await response.text().catch(function() { return ''; });
        const error = new Error(details || 'Prenotazione non completata');
        error.status = response.status;
        throw error;
    }

    return response.json().catch(function() {
        return { ok: true };
    });
}

async function getPublicPaymentSession(prenotazioneId) {
    const response = await fetch(`https://demo-mail-993653817397.europe-west8.run.app/api/prenotazioni/public/${encodeURIComponent(prenotazioneId)}/payment-session`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        const details = await response.text().catch(function() { return ''; });
        const error = new Error(details || 'Impossibile avviare la sessione di pagamento');
        error.status = response.status;
        throw error;
    }

    return response.json();
}

function ensurePrenotaModalContainer() {
    let modalDiv = document.getElementById('prenota-modal');
    if (modalDiv) return modalDiv;

    modalDiv = document.createElement('div');
    modalDiv.id = 'prenota-modal';
    modalDiv.style = 'display:none;position:fixed;z-index:10000;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.5);align-items:stretch;justify-content:stretch;';
    modalDiv.innerHTML = `<div id="prenota-modal-content" style="background:#fff;padding:48px 20px 20px 20px;width:100%;height:100%;position:relative;overflow-y:auto;box-sizing:border-box;">
                    <button id="closePrenotaModal" style="position:fixed;top:10px;right:12px;font-size:2.2em;line-height:1;background:#fff;border:1px solid #ccc;border-radius:50%;width:44px;height:44px;cursor:pointer;z-index:10001;color:#333;display:flex;align-items:center;justify-content:center;">&times;</button>
                    <div id="prenota-modal-body" style="max-width:600px;margin:0 auto;"></div>
                </div>`;
    document.body.appendChild(modalDiv);
    document.getElementById('closePrenotaModal').onclick = () => {
        modalDiv.style.display = 'none';
    };

    return modalDiv;
}

function openPreventivoRequestModal(appartamento, prezzoTotale, checkIn, checkOut, casaId) {
    const modalDiv = ensurePrenotaModalContainer();
    const modalBody = document.getElementById('prenota-modal-body');
    const prezzoNumerico = Number(prezzoTotale);
    const prezzoValido = Number.isFinite(prezzoNumerico);
    const prezzoFormattato = prezzoValido
        ? prezzoNumerico.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
        : '';
    const formatDateLabel = function(value) {
        if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value || '-';
        }
        const parts = value.split('-');
        return parts[2] + '/' + parts[1] + '/' + parts[0];
    };

    modalBody.innerHTML = `
        <div style="margin:10px 0 12px 0;display:flex;justify-content:space-between;align-items:center;gap:10px;">
            <h2 style="margin:0;font-size:1.2em;color:#2d7a46;">Request information</h2>
        </div>
        <p style="margin:0 0 12px 0;color:#4b5563;font-size:0.95em;">Fill in your details to receive availability confirmation and the final price. No charge now and no booking commitment.</p>
        <div style="margin-bottom:10px;font-weight:600;font-size:0.95em;">${appartamento || 'General request'}</div>
        ${prezzoValido ? `<div style="margin-bottom:10px;padding:8px 10px;border-radius:8px;background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;font-weight:700;font-size:0.95em;">Total price: ${prezzoFormattato}</div>` : ''}
        <div style="margin-bottom:10px;display:grid;grid-template-columns:1fr;gap:6px;">
            <div style="padding:8px 10px;border-radius:8px;background:#f8fafc;border:1px solid #dbeafe;color:#1e3a8a;font-size:0.9em;"><strong>Check-in:</strong> ${formatDateLabel(checkIn)}</div>
            <div style="padding:8px 10px;border-radius:8px;background:#f8fafc;border:1px solid #dbeafe;color:#1e3a8a;font-size:0.9em;"><strong>Check-out:</strong> ${formatDateLabel(checkOut)}</div>
        </div>
        <form id="quickPreventivoForm" style="margin-bottom:0;">
            <input type="hidden" name="appartamento" value="${appartamento || ''}">
            <input type="hidden" name="casaId" value="${casaId || ''}">
            <input type="hidden" name="prezzo" value="${prezzoValido ? prezzoNumerico : ''}">
            <input type="hidden" name="checkIn" value="${checkIn || ''}">
            <input type="hidden" name="checkOut" value="${checkOut || ''}">
            <div style="margin-bottom:10px;">
                <input required name="nome" type="text" placeholder="Name *" style="width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;">
                <input required name="email" type="email" placeholder="Email *" style="width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;">
                <input name="telefono" type="tel" placeholder="Phone (optional)" style="width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;">
                <input required name="persone" type="number" min="1" max="8" placeholder="Number of guests *" style="width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;">
            </div>
            <textarea name="messaggio" placeholder="Message (optional)" style="width:100%;padding:10px;border-radius:5px;border:1px solid #ccc;min-height:60px;max-height:120px;font-size:0.95em;margin-bottom:12px;box-sizing:border-box;display:block;"></textarea>
            <div style="display:flex;gap:10px;padding-bottom:10px;flex-wrap:wrap;">
                <button type="submit" style="flex:2;background:#2d7a46;color:#fff;padding:12px;border:none;border-radius:6px;font-size:1em;font-weight:600;cursor:pointer;">Send request</button>
                <button type="button" id="cancelQuickPreventivoBtn" style="flex:1;background:#f3f4f6;color:#1f2937;padding:12px;border:1px solid #d1d5db;border-radius:6px;font-size:1em;cursor:pointer;">Cancel</button>
            </div>
        </form>
    `;

    modalDiv.style.display = 'flex';

    const cancelBtn = document.getElementById('cancelQuickPreventivoBtn');
    if (cancelBtn) {
        cancelBtn.onclick = function() {
            modalDiv.style.display = 'none';
        };
    }

    const quickForm = document.getElementById('quickPreventivoForm');
    if (quickForm) {
        quickForm.onsubmit = async function(ev) {
            ev.preventDefault();
            const form = ev.currentTarget;

            try {
                const response = await fetch('https://demo-mail-993653817397.europe-west8.run.app/api/preventivi/public', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    body: new URLSearchParams({
                        nome: form.nome.value,
                        email: form.email.value,
                        telefono: form.telefono.value,
                        checkIn: form.checkIn.value || '',
                        checkOut: form.checkOut.value || '',
                        persone: String(Number(form.persone.value)),
                        messaggio: form.messaggio.value,
                        appartamento: form.appartamento.value,
                        prezzo: form.prezzo.value || '',
                        source: 'booking-static-modal'
                    })
                });

                if (!response.ok) throw new Error('Error sending quote request');

                modalBody.innerHTML = `<div style="text-align:center;padding:32px 0;"><h2 style="color:#2d7a46;">Request sent!</h2><p>Thank you for your enquiry.<br>We will get back to you as soon as possible.</p><button id="closePrenotaModal2" style="margin-top:18px;background:#2d7a46;color:#fff;padding:10px 22px;border:none;border-radius:6px;font-size:1em;cursor:pointer;">Close</button></div>`;
                const closeBtn = document.getElementById('closePrenotaModal2');
                if (closeBtn) closeBtn.onclick = function() { modalDiv.style.display = 'none'; };
            } catch (err) {
                modalBody.innerHTML = `<div style="text-align:center;padding:32px 0;color:#b91c1c;"><h2>Error</h2><p>There was a problem sending your request.<br>Please try again later.</p><button id="closePrenotaModal2" style="margin-top:18px;background:#f3f4f6;color:#1f2937;padding:10px 22px;border:1px solid #d1d5db;border-radius:6px;font-size:1em;cursor:pointer;">Close</button></div>`;
                const closeBtn = document.getElementById('closePrenotaModal2');
                if (closeBtn) closeBtn.onclick = function() { modalDiv.style.display = 'none'; };
            }
        };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.open-preventivo-modal');
    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openPreventivoRequestModal(link.dataset.appartamento || '', '', '', '', link.dataset.casaId || '');
        });
    });
});

document.getElementById('booking-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const ospiti = document.getElementById('ospiti').value;
    const resultsDiv = document.getElementById('results');
    const staticHomesList = document.getElementById('staticHomesList');
    // Validazione campi obbligatori
    let errorMsg = '';
    if (!checkIn && !checkOut) {
        errorMsg = 'Please enter both check-in and check-out dates.';
    } else if (!checkIn) {
        errorMsg = 'Please enter a check-in date.';
    } else if (!checkOut) {
        errorMsg = 'Please enter a check-out date.';
    } else if (!ospiti) {
        errorMsg = 'Please enter the number of guests.';
    }
    if (errorMsg) {
        resultsDiv.innerHTML = `<p style=\"color:#b91c1c;font-weight:600;margin-top:18px;\">${errorMsg}</p>`;
        // Evidenzia input mancanti
        if (!checkIn) document.getElementById('checkIn').style.borderColor = '#b91c1c';
        if (!checkOut) document.getElementById('checkOut').style.borderColor = '#b91c1c';
        if (!ospiti) document.getElementById('ospiti').style.borderColor = '#b91c1c';
        setTimeout(() => {
            if (!checkIn) document.getElementById('checkIn').style.borderColor = '';
            if (!checkOut) document.getElementById('checkOut').style.borderColor = '';
            if (!ospiti) document.getElementById('ospiti').style.borderColor = '';
        }, 2000);
        return;
    }
    if (staticHomesList) {
        staticHomesList.style.display = 'none';
    }
    resultsDiv.innerHTML = 'Searching availability...';
    try {
        function formatEuro(value) {
            const num = Number(value);
            if (!Number.isFinite(num)) return '';
            return num.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
        }

        function formatDateIt(value) {
            if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || '';
            const parts = value.split('-');
            return parts[2] + '/' + parts[1] + '/' + parts[0];
        }

        function getGalleryImagesForHouse(casa) {
            const id = Number(casa && casa.id);
            const idToFolder = {
                1: 'img/casa-bella-vista',
                2: 'img/casa-giorgio',
                3: 'img/casa-giorgio2',
                4: 'img/casa-bella-vista1',
                5: 'img/respirodimare'
            };
            const folder = idToFolder[id];
            if (!folder) {
                return [casa.immagine || 'img/default.webp'];
            }

            const imagesById = {
                1: ['prospetto-mobile.webp', 'giardino_1.webp', 'giardino_2.webp', 'soggiorno_2.webp', 'cucina.webp', 'prima_camera_1.webp', 'prima_camera_2.webp', 'prima_camera_3.webp', 'seconda_camera.webp', 'seconda_camera_2.webp', 'seconda_camera_5.webp', 'primo_bagno.webp', 'secondo_bagno.webp'],
                2: ['prospetto.webp', 'soggiorno.webp', 'cucina.webp', 'cortileinterno.webp', 'cortileinterno1.webp', 'camera.webp', 'camera2.webp', 'camera3.webp', 'camera4.webp', 'camera5.webp', 'camera6.webp', 'bagno1.webp'],
                3: ['prospetto_mare.webp', 'prospetto3.webp', 'balcone.webp', 'soggiorno.webp', 'camera.webp', 'camera2.webp', 'camera3.webp', 'camera4.webp', 'camera5.webp', 'camera6.webp', 'bagno.webp', 'soggiorno2.webp'],
                4: ['prospetto.jpg', 'veranda.jpg', 'veranda2.jpg', 'corridoio.jpg', 'corridoio1.jpg', 'cucina.jpg', 'camera.jpg', 'camera2.jpg', 'camera3.jpg', 'seconda-camera.jpg', 'secondacamera2.jpg', 'bagno.jpg'],
                5: ['prospetto.webp', 'soggiorno.webp', 'camera.webp', 'camera2.webp', 'camera3.webp', 'cucina.webp', 'bagno.webp']
            };

            const imageNames = imagesById[id] || [];
            if (!imageNames.length) {
                return [casa.immagine || 'img/default.webp'];
            }
            return imageNames.map(function(name) {
                return folder + '/' + name;
            });
        }

        function getEnglishHouseDescription(casa) {
            const id = Number(casa && casa.id);
            const name = String((casa && casa.nome) || '').toLowerCase();

            const descriptionsById = {
                1: 'Ground-floor apartment about 20m from the sea, with private outdoor spaces and all main comforts for families and groups.',
                2: 'Ground-floor apartment about 40m from the beach, with equipped outdoor spaces, 3 bedrooms, air conditioning and parking pass.',
                3: 'First-floor 90 sqm apartment about 40m from the beach, with sea-view veranda, 3 bedrooms and equipped outdoor spaces.',
                4: 'Ground-floor apartment in Torre Pali, with furnished veranda, practical interior spaces and quick access to beach and services.',
                5: 'First-floor apartment close to the beach, with sea-view veranda, 3 bedrooms and equipped spaces for outdoor dining.'
            };

            if (descriptionsById[id]) {
                return descriptionsById[id];
            }

            if (name.includes('bellavista 1')) {
                return descriptionsById[4];
            }
            if (name.includes('bellavista 2')) {
                return descriptionsById[1];
            }
            if (name.includes('giorgio 4')) {
                return descriptionsById[2];
            }
            if (name.includes('giorgio 6')) {
                return descriptionsById[3];
            }
            if (name.includes('respiro')) {
                return descriptionsById[5];
            }

            return casa && casa.descrizione ? casa.descrizione : '';
        }

        const queryParams = new URLSearchParams({
            checkIn: checkIn,
            checkOut: checkOut,
            ospiti: ospiti
        });
        const res = await fetch(`https://demo-mail-993653817397.europe-west8.run.app/api/disponibilita/case?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Request failed');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            ensurePrenotaModalContainer();

            resultsDiv.innerHTML = '<h2 id="fadeSlideTitle" class="fade-slide-in" style="text-align:center;margin-top:48px;margin-bottom:32px;">Available properties:</h2>' +
                '<div class="properties-grid fade-slide-in" id="fadeSlideResults">' +
                data.map((item, idx) => {
                    const casa = item.casa || {};
                    const prezzoTotale = typeof item.prezzoTotale === 'number' ? item.prezzoTotale : null;
                    const cin = String(casa.cin || casa.CIN || casa.codiceCin || casa.codice_cin || '').trim();
                    const cis = String(casa.cis || casa.CIS || casa.codiceCis || casa.codice_cis || '').trim();
                    const galleryImages = getGalleryImagesForHouse(casa);
                    const galleryId = `prenotazione-gallery-${idx}`;
                    let galleryHtml = '';
                    if (galleryImages.length > 0) {
                        galleryHtml = `<div class="property-gallery">`;
                        galleryHtml += `<a data-fancybox="${galleryId}" href="${galleryImages[0]}" class="image-link-casa" style="display:block;position:relative;overflow:hidden;border-radius:10px;">` +
                            `<img src="${galleryImages[0]}" alt="${casa.nome || 'Casa'}" width="648" height="486" style="cursor:pointer;transition:transform 0.25s;display:block;width:100%;height:100%;object-fit:cover;">` +
                            `<span class="image-overlay-label" style="position:absolute;left:10px;bottom:10px;background:rgba(0,0,0,0.62);color:#fff;padding:7px 12px;border-radius:999px;font-size:0.9em;font-weight:600;">View photos</span>` +
                        `</a>`;
                        if (galleryImages.length > 1) {
                            galleryImages.slice(1).forEach(function(img) {
                                galleryHtml += `<a data-fancybox="${galleryId}" href="${img}" style="display:none"></a>`;
                            });
                        }
                        galleryHtml += `</div>`;
                    }
                    let caratteristiche = casa.caratteristiche;
                    if (typeof caratteristiche === 'string') {
                        caratteristiche = caratteristiche.split(',').map(f => f.trim()).filter(Boolean);
                    }
                    if (!Array.isArray(caratteristiche)) caratteristiche = [];
                    // id univoco per il pulsante
                    const btnId = `prenota-btn-${idx}`;
                    const onlineBtnId = `prenota-online-btn-${idx}`;
                    const descriptionText = getEnglishHouseDescription(casa);
                    let englishDetailLink = casa.link_dettaglio || '';
                    if (String(englishDetailLink).includes('casa-bellavista-1')) englishDetailLink = 'casa-bellavista-1-en';
                    else if (String(englishDetailLink).includes('casa-bellavista-2')) englishDetailLink = 'casa-bellavista-2-en';
                    else if (String(englishDetailLink).includes('casa-giorgio-4')) englishDetailLink = 'casa-giorgio-4-en';
                    else if (String(englishDetailLink).includes('casa-giorgio-6')) englishDetailLink = 'casa-giorgio-6-en';
                    else if (String(englishDetailLink).includes('respiro-di-mare') || String(englishDetailLink).includes('respiro-di-mare')) englishDetailLink = 'respiro-di-mare-en';
                    return `
                    <div class="property-card" style="margin-bottom: 68px;">
                        <div class="availability-badge" style="font-size:1.08rem;font-weight:800;letter-spacing:0.02em;background:linear-gradient(90deg,#0f766e 0%,#15803d 100%);color:#fff;padding:10px 16px;text-transform:uppercase;box-shadow:0 6px 18px rgba(21,128,61,0.35);">${casa.nome || casa.id || 'Casa'}</div>
                        <div class="property-image">
                            ${galleryHtml}
                        </div>
                        <div class="property-info">                            
                            ${prezzoTotale !== null ? `<p style="margin:8px 0 8px 0;font-size:1.05em;color:#166534;font-weight:700;">Total price: ${formatEuro(prezzoTotale)}</p>` : ''} 
                            <p style="margin:0 0 10px 0;font-size:0.9em;line-height:1.4;color:#334155;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:8px 10px;"><strong>CIN:</strong> ${cin || '-'}<br><strong>CIS:</strong> ${cis || '-'}</p>
                            <div class="property-features">
                                ${caratteristiche.map(f => `<span class="feature-badge">${f}</span>`).join(' ')}
                            </div>
                            <p class="property-description">${descriptionText}</p>
                            <div style="margin-top: 18px; margin-bottom: 10px;">
                                ${englishDetailLink ? `<a href="${englishDetailLink}" style="color: #48bb78; text-decoration: underline; font-weight: 500; font-size: 1.24em; display: block; margin-bottom: 10px;">📋 View property</a>` : ''}
                            <!--    <a href="#" class="prenota-online-btn" id="${onlineBtnId}" style="color: #48bb78; text-decoration: underline; font-weight: 500; font-size: 1.24em; display: block; margin-bottom: 10px;">✨ Prenota </a> -->
                            </div>
                        </div>
                    </div>
                    `;
                }).join('') + '</div>';
            // Attiva animazione fade-slide
            setTimeout(() => {
                const el = document.getElementById('fadeSlideResults');
                if (el) el.classList.add('visible');
                const title = document.getElementById('fadeSlideTitle');
                if (title) title.classList.add('visible');
                // Aggiungi event listener ai pulsanti Prenota
                data.forEach((item, idx) => {
                    const casa = item.casa || {};
                    const prezzoTotale = typeof item.prezzoTotale === 'number' ? item.prezzoTotale : null;
                    const btn = document.getElementById(`prenota-btn-${idx}`);
                    const onlineBtn = document.getElementById(`prenota-online-btn-${idx}`);
                    const openModal = (e) => { e.preventDefault();
                            const modal = document.getElementById('prenota-modal');
                            const modalBody = document.getElementById('prenota-modal-body');
                            // Modale con date precompilate dalla ricerca (non modificabili)
                            modalBody.innerHTML = `
                                <div style=\"margin-bottom:12px;display:flex;justify-content:space-between;align-items:flex-start;gap:10px; margin-top: 30px;\">
                                    <h2 style=\"margin:0;font-size:1.15em;color:#2d7a46;\">Dati prenotazione</h2>
                                    ${prezzoTotale != null ? `<div style=\"text-align:right;color:grey;font-weight:700;font-size:1.0em;\">Prezzo totale: ${formatEuro(prezzoTotale)}<br><span style=\"color:grey;font-weight:700;font-size:1.0em;\">Importo caparra: ${formatEuro(prezzoTotale * 0.2)}</span></div>` : ''}  
                                </div>
                                
                                <div style=\"margin-bottom:12px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px 14px;\">
                                    <p style=\"margin:0; font-size:0.9em; color:#374151; line-height:1.6;\"><strong style=\"color:#166534;\">Politica cancellazione:</strong> la caparra è rimborsata integralmente solo per cancellazioni comunicate almeno 90 giorni prima del check-in; oltre tale termine la caparra non è rimborsabile.</p>
                                </div>

                                <div style=\"margin-bottom:12px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px 14px;\">
                                    <p style=\"margin:0 0 8px 0; font-weight:700; font-size:0.98em; color:#166534;\">Info soggiorno essenziali</p>
                                    <ul style=\"margin:0; padding-left:18px; font-size:0.9em; color:#374151; line-height:1.6;\">
                                        <li>Il prezzo include pulizia finale, cambio biancheria, tassa di soggiorno, supporto all'arrivo, pass parcheggio, spese di consumo. Non sono previste altre spese aggiuntive.</li>
                                        <li>Al vostro arrivo saremo presenti in struttura per accoglienza, consegna chiavi e tutte le informazioni utili sul soggiorno e sulla zona.</li>
                                        <li>Al termine della prenotazione riceverai una email di riepilogo con tutte le informazioni utili per il soggiorno.</li>
                                        <li>È ammesso al massimo 1 animale domestico per soggiorno: ti chiediamo di indicarlo nel campo messaggio qui sotto.</li>
                                        <li><strong>Check-in:</strong> dalle 15:00 alle 20:00</li>
                                        <li><strong>Check-out:</strong> entro le 10:00</li>
                                    </ul>
                                </div>

                                <div style=\"margin-bottom:10px; font-weight:600; font-size:0.95em;\">${casa.nome || casa.id || 'Casa'}</div>

                                <form id=\"prenotaForm\" style=\"margin-bottom:0;\">
                                    <input type=\"hidden\" name=\"casa\" value=\"${casa.nome || casa.id || ''}\">
                                    <input type=\"hidden\" name=\"prezzoTotale\" value=\"${prezzoTotale !== null ? prezzoTotale : ''}\">
                                    <input type=\"hidden\" name=\"checkIn\" value=\"${checkIn}\">
                                    <input type=\"hidden\" name=\"checkOut\" value=\"${checkOut}\">
                                    
                                    <div style=\"margin-bottom:10px;\">
                                        <div style=\"padding:8px 10px;border-radius:6px;border:1px solid #d1fae5;background:#f0fdf4;color:#14532d;font-size:0.85em;margin-bottom:6px;\"><strong>Check-in:</strong> ${formatDateIt(checkIn)}</div>
                                        <div style=\"padding:8px 10px;border-radius:6px;border:1px solid #d1fae5;background:#f0fdf4;color:#14532d;font-size:0.85em;\"><strong>Check-out:</strong> ${formatDateIt(checkOut)}</div>
                                    </div>

                                    <div style=\"margin-bottom:10px;\">
                                        <input required name=\"nome\" type=\"text\" placeholder=\"Full name *\" style=\"width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;\">
                                        <input required name=\"email\" type=\"email\" placeholder=\"Email *\" style=\"width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;\">
                                        <input name=\"telefono\" type=\"tel\" placeholder=\"Phone (optional)\" style=\"width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;\">
                                        <input required name=\"persone\" type=\"number\" min=\"1\" max=\"8\" value=\"${ospiti || ''}\" placeholder=\"Numero di Persone *\" style=\"width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;\">
                                    </div>

                                    <textarea name=\"messaggio\" placeholder=\"Messaggio (opzionale)\" style=\"width:100%;padding:10px;border-radius:5px;border:1px solid #ccc;min-height:50px;max-height:80px;font-size:0.95em;margin-bottom:12px;box-sizing:border-box;display:block;\"></textarea>
                                                                        <label style="display:flex;align-items:flex-start;gap:8px;margin-bottom:14px;font-size:0.88em;color:#374151;cursor:pointer;line-height:1.5;">
                                        <input type="checkbox" name="accettaPolicy" required style="margin-top:3px;width:16px;height:16px;accent-color:#188841;flex-shrink:0;">
                                        <span>Prendo atto dell'informativa sul trattamento dei dati personali.</span>
                                    </label>
                                    <div style="display:flex;gap:10px;padding-bottom:10px;flex-wrap:wrap;">
                                     <!--   <button type="submit" style="flex:2;background:#2d7a46;color:#fff;padding:12px;border:none;border-radius:6px;font-size:1em;font-weight:600;cursor:pointer;">Invia richiesta</button> -->
                                        <button type="button" id="prenotaOnlineBtn" style="flex:2;background:#188841;color:#fff;padding:12px;border:none;border-radius:6px;font-size:1em;font-weight:600;cursor:pointer;">Procedi al pagamento</button> 
                                        <button type="button" id="cancelPrenotaBtn" style="flex:1;background:#f3f4f6;color:#1f2937;padding:12px;border:1px solid #d1d5db;border-radius:6px;font-size:1em;cursor:pointer;">Annulla</button>
                                    </div>
                                </form>
                            `;
                            modal.style.display = 'flex';
                            const cancelBtn = document.getElementById('cancelPrenotaBtn');
                            if (cancelBtn) {
                                cancelBtn.onclick = function() {
                                    modal.style.display = 'none';
                                };
                            }

                            const prenotaOnlineBtn = document.getElementById('prenotaOnlineBtn');
                            if (prenotaOnlineBtn) {
                                prenotaOnlineBtn.onclick = async function() {
                                    const form = document.getElementById('prenotaForm');
                                    let prenotazioneId = null;
                                    if (!form.checkValidity()) {
                                        form.reportValidity();
                                        return;
                                    }
                                    modalBody.innerHTML = `<div style="text-align:center;padding:32px 0;"><div style="border:4px solid #f3f3f3;border-top:4px solid #188841;border-radius:50%;width:32px;height:32px;animation:spin 1s linear infinite;margin:0 auto 18px auto;"></div><span style="color:#188841;font-weight:500;">Prenotazione in corso...</span></div>`;

                                    const renderPaymentRedirect = (paymentSession) => {
                                        const redirectDelaySeconds = 5;
                                        modalBody.innerHTML = `<div style="text-align:center;padding:32px 0;"><h2 style="color:#2d7a46;">Prenotazione creata!</h2><p>Importo caparra (20% del totale): <strong>${formatEuro(paymentSession.importoCaparra)}</strong></p><p>Reindirizzamento al pagamento tra <strong><span id="paymentRedirectCountdown">${redirectDelaySeconds}</span>s</strong>.</p><button id="goToPaymentNow" style="margin-top:12px;background:#188841;color:#fff;padding:10px 22px;border:none;border-radius:6px;font-size:1em;cursor:pointer;">Paga ora</button><p style="margin-top:12px;font-size:0.95em;color:#555;">Se non vieni reindirizzato, usa il pulsante oppure <a id="paymentFallbackLink" href="${paymentSession.paymentUrl}" target="_blank" rel="noopener">apri il pagamento in una nuova scheda</a>.</p></div>`;
                                        const goToPaymentNow = document.getElementById('goToPaymentNow');
                                        const paymentRedirectCountdown = document.getElementById('paymentRedirectCountdown');
                                        let countdown = redirectDelaySeconds;
                                        let isRedirecting = false;

                                        const doRedirect = () => {
                                            if (isRedirecting) {
                                                return;
                                            }
                                            isRedirecting = true;
                                            window.location.href = paymentSession.paymentUrl;
                                        };

                                        const countdownInterval = setInterval(() => {
                                            countdown -= 1;
                                            if (paymentRedirectCountdown && countdown >= 0) {
                                                paymentRedirectCountdown.textContent = String(countdown);
                                            }
                                            if (countdown <= 0) {
                                                clearInterval(countdownInterval);
                                            }
                                        }, 1000);

                                        if (goToPaymentNow) {
                                            goToPaymentNow.onclick = () => {
                                                clearInterval(countdownInterval);
                                                doRedirect();
                                            };
                                        }

                                        setTimeout(() => {
                                            clearInterval(countdownInterval);
                                            doRedirect();
                                        }, redirectDelaySeconds * 1000);
                                    };

                                    const renderPaymentRetry = (localPrenotazioneId) => {
                                        modalBody.innerHTML = `<div style="text-align:center;padding:32px 0;"><h2 style="color:#b45309;">Prenotazione creata</h2><p>La prenotazione è registrata, ma non siamo riusciti ad avviare il pagamento della caparra.</p><p style="font-size:0.95em;color:#555;">Codice prenotazione: <strong>${localPrenotazioneId}</strong></p><button id="retryPaymentSessionBtn" style="margin-top:12px;background:#188841;color:#fff;padding:10px 22px;border:none;border-radius:6px;font-size:1em;cursor:pointer;">Riprova pagamento</button><button id="closePrenotaModal2" style="margin-top:12px;margin-left:8px;background:#555;color:#fff;padding:10px 22px;border:none;border-radius:6px;font-size:1em;cursor:pointer;">Chiudi</button><p id="retryPaymentError" style="display:none;margin-top:12px;color:#b91c1c;font-size:0.95em;">Pagamento non disponibile in questo momento. Riprova tra poco.</p></div>`;
                                        const retryPaymentSessionBtn = document.getElementById('retryPaymentSessionBtn');
                                        const closePrenotaModal2 = document.getElementById('closePrenotaModal2');
                                        const retryPaymentError = document.getElementById('retryPaymentError');

                                        if (retryPaymentSessionBtn) {
                                            retryPaymentSessionBtn.onclick = async () => {
                                                if (retryPaymentError) {
                                                    retryPaymentError.style.display = 'none';
                                                }
                                                retryPaymentSessionBtn.disabled = true;
                                                retryPaymentSessionBtn.textContent = 'Riprovo...';
                                                try {
                                                    const retriedPaymentSession = await getPublicPaymentSession(localPrenotazioneId);
                                                    if (!retriedPaymentSession || !retriedPaymentSession.paymentUrl) {
                                                        throw new Error('Sessione pagamento non disponibile.');
                                                    }
                                                    renderPaymentRedirect(retriedPaymentSession);
                                                } catch (retryErr) {
                                                    retryPaymentSessionBtn.disabled = false;
                                                    retryPaymentSessionBtn.textContent = 'Riprova pagamento';
                                                    if (retryPaymentError) {
                                                        retryPaymentError.textContent = 'Pagamento non disponibile in questo momento. Riprova tra poco.';
                                                        retryPaymentError.style.display = 'block';
                                                    }
                                                }
                                            };
                                        }

                                        if (closePrenotaModal2) {
                                            closePrenotaModal2.onclick = () => {
                                                modal.style.display = 'none';
                                            };
                                        }
                                    };

                                    try {
                                        const prenotazione = {
                                            casaId: Number(casa.id),
                                            ospiteNome: form.nome.value.trim(),
                                            numOspiti: Number(form.persone.value),
                                            checkIn: form.checkIn.value,
                                            checkOut: form.checkOut.value,
                                            emailOspite: form.email.value.trim() || null,
                                            note: [
                                                form.messaggio.value.trim()
                                            ].filter(Boolean).join('\n'),
                                            telefonoOspite: form.telefono.value.trim() || null,
                                            prezzoTotale: form.prezzoTotale.value !== '' ? Number(form.prezzoTotale.value) : null,
                                            caparra: null,
                                            createdAt: null
                                        };
                                        const bookingResponse = await eseguiPrenotazioneOnline(prenotazione);
                                        prenotazioneId = (bookingResponse && (bookingResponse.prenotazioneId || bookingResponse.id)) || null;
                                        if (!prenotazioneId) {
                                            throw new Error('Prenotazione creata ma identificativo mancante.');
                                        }

                                        const paymentSession = await getPublicPaymentSession(prenotazioneId);
                                        if (!paymentSession || !paymentSession.paymentUrl) {
                                            throw new Error('Sessione pagamento non disponibile.');
                                        }
                                        renderPaymentRedirect(paymentSession);
                                    } catch (err) {
                                        if (prenotazioneId) {
                                            renderPaymentRetry(prenotazioneId);
                                            return;
                                        }

                                        let errorMessage = 'We could not complete the online booking.<br>You can send an enquiry instead or try again later.';
                                        if (err && err.status === 400) {
                                            errorMessage = 'I dati inseriti non sono validi oppure non rispettano le regole della casa.<br>Controlla date, ospiti e recapiti e riprova.';
                                        } else if (err && err.status === 409) {
                                            errorMessage = 'The selected dates are no longer available.<br>Please choose another period or send an enquiry.';
                                        } else if (err && err.status === 429) {
                                            errorMessage = 'Hai effettuato troppi tentativi in poco tempo.<br>Attendi qualche minuto e riprova.';
                                        } else if (err && err.message) {
                                            errorMessage = err.message;
                                        }
                                        modalBody.innerHTML = `<div style="text-align:center;padding:32px 0;"><h2 style="color:#b91c1c;">Prenotazione non completata</h2><p>${errorMessage}</p><button id="closePrenotaModal2" style="margin-top:18px;background:#b91c1c;color:#fff;padding:10px 22px;border:none;border-radius:6px;font-size:1em;cursor:pointer;">Chiudi</button></div>`;
                                        document.getElementById('closePrenotaModal2').onclick = () => {
                                            modal.style.display = 'none';
                                        };
                                    }
                                };
                            }

                            // Gestione submit form
                            document.getElementById('prenotaForm').onsubmit = async function(ev) {
                                ev.preventDefault();
                                const form = ev.target;
                                // Mostra spinner
                                modalBody.innerHTML = `<div style=\"text-align:center;padding:32px 0;\"><div style=\"border:4px solid #f3f3f3;border-top:4px solid #188841;border-radius:50%;width:32px;height:32px;animation:spin 1s linear infinite;margin:0 auto 18px auto;\"></div><span style=\"color:#188841;font-weight:500;\">Invio in corso...</span></div>`;
                                // Raccogli dati
                                const nome = form.nome.value;
                                const email = form.email.value;
                                const telefono = form.telefono.value;
                                const persone = form.persone.value;
                                // Enhanced conversions - Google Ads Advanced Conversions
                                // Funzione per hashare in SHA256
                                async function sha256(str) {
                                    const encoder = new TextEncoder();
                                    const data = encoder.encode(str);
                                    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                                    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                                }

                                (async function() {
                                    const userDataPayload = {};
                                    if (email) {
                                        const emailNorm = email.trim().toLowerCase();
                                        userDataPayload.email = await sha256(emailNorm);
                                    }
                                    if (telefono) {
                                        let phoneE164 = telefono.trim().replace(/[\s\-().]/g, '');
                                        if (!phoneE164.startsWith('+')) phoneE164 = '+39' + phoneE164.replace(/^0/, '');
                                        userDataPayload.phone_number = await sha256(phoneE164);
                                    }
                                    if ((userDataPayload.email || userDataPayload.phone_number) && typeof gtag === 'function') {
                                        gtag('set', 'user_data', userDataPayload);
                                    }
                                })();
                                const messaggio = form.messaggio.value;
                                const casa = form.casa.value;
                                const checkIn = form.checkIn.value;
                                const checkOut = form.checkOut.value;
                                const prezzoTotale = form.prezzoTotale.value;
                                try {
                                    const response = await fetch('https://demo-mail-993653817397.europe-west8.run.app/api/preventivi/public', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded',
                                            'Accept': 'application/json'
                                        },
                                        body: new URLSearchParams({
                                            nome: nome,
                                            email: email,
                                            telefono: telefono,
                                            persone: persone,
                                            appartamento: casa,
                                            checkIn: checkIn,
                                            checkOut: checkOut,
                                            prezzo: prezzoTotale,
                                            prezzoTotale: prezzoTotale,
                                            messaggio: messaggio,
                                            source: 'booking-modal'
                                        })
                                    });
                                    if (response.ok) {
                                        if (typeof gtag === 'function') {
                                            gtag('event', 'conversion', { 'send_to': 'AW-17941172028/OvpCCP_1jJQcELyegutC' });
                                        }
                                            modalBody.innerHTML = `<div style=\"text-align:center;padding:32px 0;\"><h2 style=\"color:#2d7a46;\">Request sent!</h2><p>Thank you for your enquiry.<br>We will get back to you as soon as possible.</p><button id=\"closePrenotaModal2\" style=\"margin-top:18px;background:#2d7a46;color:#fff;padding:10px 22px;border:none;border-radius:6px;font-size:1em;cursor:pointer;\">Close</button></div>`;
                                        document.getElementById('closePrenotaModal2').onclick = () => {
                                            modal.style.display = 'none';
                                        };
                                    } else {
                                        modalBody.innerHTML = `<div style=\"text-align:center;padding:32px 0;\"><h2 style=\"color:#b91c1c;\">Sending failed</h2><p>There was a problem sending your request.<br>Please try again or contact us on WhatsApp.</p><button id=\"closePrenotaModal2\" style=\"margin-top:18px;background:#b91c1c;color:#fff;padding:10px 22px;border:none;border-radius:6px;font-size:1em;cursor:pointer;\">Close</button></div>`;
                                        document.getElementById('closePrenotaModal2').onclick = () => {
                                            modal.style.display = 'none';
                                        };
                                    }
                                } catch (err) {
                                    modalBody.innerHTML = `<div style=\"text-align:center;padding:32px 0;\"><h2 style=\"color:#b91c1c;\">Sending failed</h2><p>There was a problem sending your request.<br>Please try again or contact us on WhatsApp.</p><button id=\"closePrenotaModal2\" style=\"margin-top:18px;background:#b91c1c;color:#fff;padding:10px 22px;border:none;border-radius:6px;font-size:1em;cursor:pointer;\">Close</button></div>`;
                                    document.getElementById('closePrenotaModal2').onclick = () => {
                                        modal.style.display = 'none';
                                    };
                                }
                            };
                    };
                    if (btn) {
                        btn.onclick = function(e) {
                            e.preventDefault();
                            openPreventivoRequestModal(casa.nome || casa.id || 'General request', prezzoTotale, checkIn, checkOut, casa.id || '');
                        };
                    }
                    if (onlineBtn) {
                        onlineBtn.onclick = openModal;
                    }
                });
            }, 50);
        } else {
            resultsDiv.innerHTML = '<p>Nessuna casa disponibile per il periodo selezionato.</p>';
        }
    } catch (err) {
        resultsDiv.innerHTML = `<p>Error: ${err.message}</p>`;
    }
});
