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

function openPreventivoRequestModal(appartamento) {
    const modalDiv = ensurePrenotaModalContainer();
    const modalBody = document.getElementById('prenota-modal-body');

    modalBody.innerHTML = `
        <div style="margin:10px 0 12px 0;display:flex;justify-content:space-between;align-items:center;gap:10px;">
            <h2 style="margin:0;font-size:1.2em;color:#2d7a46;">Richiedi preventivo</h2>
        </div>
        <p style="margin:0 0 12px 0;color:#4b5563;font-size:0.95em;">Compila il form e ti ricontatteremo in breve tempo.</p>
        <div style="margin-bottom:10px;font-weight:600;font-size:0.95em;">${appartamento || 'Richiesta generica'}</div>
        <form id="quickPreventivoForm" style="margin-bottom:0;">
            <input type="hidden" name="appartamento" value="${appartamento || ''}">
            <div style="margin-bottom:10px;">
                <input required name="nome" type="text" placeholder="Nome e Cognome *" style="width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;">
                <input name="email" type="email" placeholder="Email" style="width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;">
                <input name="telefono" type="tel" placeholder="Telefono" style="width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;">
                <select required name="preferenza_ricontatto" style="width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;background:#fff;">
                    <option value="" selected disabled>Come preferisci essere ricontattato? *</option>
                    <option value="telefono">Telefono</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                </select>
                <input required name="persone" type="number" min="1" max="8" placeholder="Numero di Persone *" style="width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;">
            </div>
            <textarea name="messaggio" placeholder="Messaggio (opzionale)" style="width:100%;padding:10px;border-radius:5px;border:1px solid #ccc;min-height:60px;max-height:120px;font-size:0.9em;margin-bottom:12px;box-sizing:border-box;display:block;"></textarea>
            <div style="display:flex;gap:10px;padding-bottom:10px;flex-wrap:wrap;">
                <button type="submit" style="flex:2;background:#2d7a46;color:#fff;padding:12px;border:none;border-radius:6px;font-size:1em;font-weight:600;cursor:pointer;">Invia richiesta</button>
                <button type="button" id="cancelQuickPreventivoBtn" style="flex:1;background:#f3f4f6;color:#1f2937;padding:12px;border:1px solid #d1d5db;border-radius:6px;font-size:1em;cursor:pointer;">Annulla</button>
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
            const pref = form.preferenza_ricontatto.value;

            if (pref === 'email' && !form.email.value.trim()) {
                form.email.setCustomValidity('Inserisci l\'email per essere ricontattato via email.');
                form.email.reportValidity();
                return;
            }
            if ((pref === 'telefono' || pref === 'whatsapp') && !form.telefono.value.trim()) {
                const channelLabel = pref === 'whatsapp' ? 'WhatsApp' : 'Telefono';
                form.telefono.setCustomValidity('Inserisci il telefono per essere ricontattato via ' + channelLabel + '.');
                form.telefono.reportValidity();
                return;
            }
            form.email.setCustomValidity('');
            form.telefono.setCustomValidity('');

            const preferenzaRicontatto = form.preferenza_ricontatto.value;
            const preferenzaRicontattoLabel =
                preferenzaRicontatto === 'whatsapp' ? 'WhatsApp' :
                preferenzaRicontatto === 'telefono' ? 'Telefono' :
                preferenzaRicontatto === 'email' ? 'Email' :
                preferenzaRicontatto;

            try {
                const response = await fetch('https://demo-mail-993653817397.europe-west8.run.app/api/preventivi/public', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nome: form.nome.value,
                        email: form.email.value,
                        telefono: form.telefono.value,
                        checkIn: null,
                        checkOut: null,
                        persone: Number(form.persone.value),
                        messaggio: form.messaggio.value,
                        preferenzaRicontatto: preferenzaRicontattoLabel,
                        appartamento: form.appartamento.value,
                        source: 'booking-static-modal'
                    })
                });

                if (!response.ok) throw new Error('Errore invio richiesta preventivo');

                modalBody.innerHTML = `<div style="text-align:center;padding:32px 0;"><h2 style="color:#2d7a46;">Richiesta inviata!</h2><p>Grazie per aver richiesto il preventivo.<br>Ti ricontatteremo al più presto.</p><button id="closePrenotaModal2" style="margin-top:18px;background:#2d7a46;color:#fff;padding:10px 22px;border:none;border-radius:6px;font-size:1em;cursor:pointer;">Chiudi</button></div>`;
                const closeBtn = document.getElementById('closePrenotaModal2');
                if (closeBtn) closeBtn.onclick = function() { modalDiv.style.display = 'none'; };
            } catch (err) {
                modalBody.innerHTML = `<div style="text-align:center;padding:32px 0;color:#b91c1c;"><h2>Errore</h2><p>Si e verificato un errore durante l'invio.<br>Riprova più tardi.</p><button id="closePrenotaModal2" style="margin-top:18px;background:#f3f4f6;color:#1f2937;padding:10px 22px;border:1px solid #d1d5db;border-radius:6px;font-size:1em;cursor:pointer;">Chiudi</button></div>`;
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
            openPreventivoRequestModal(link.dataset.appartamento || '');
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
        errorMsg = 'Inserisci la data di check-in e check-out.';
    } else if (!checkIn) {
        errorMsg = 'Inserisci la data di check-in.';
    } else if (!checkOut) {
        errorMsg = 'Inserisci la data di check-out.';
    } else if (!ospiti) {
        errorMsg = 'Inserisci il numero di ospiti.';
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
    resultsDiv.innerHTML = 'Ricerca in corso...';
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

        const queryParams = new URLSearchParams({
            checkIn: checkIn,
            checkOut: checkOut,
            ospiti: ospiti
        });
        const res = await fetch(`https://demo-mail-993653817397.europe-west8.run.app/api/disponibilita/case?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Errore nella richiesta');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            ensurePrenotaModalContainer();
            resultsDiv.innerHTML = '<h2 id="fadeSlideTitle" class="fade-slide-in" style="text-align:center;margin-top:48px;margin-bottom:32px;">Case disponibili:</h2>' +
                '<div class="properties-grid fade-slide-in" id="fadeSlideResults">' +
                data.map((item, idx) => {
                    const casa = item.casa || {};
                    const prezzoTotale = typeof item.prezzoTotale === 'number' ? item.prezzoTotale : null;
                    const galleryImages = getGalleryImagesForHouse(casa);
                    const galleryId = `prenotazione-gallery-${idx}`;
                    let galleryHtml = '';
                    if (galleryImages.length > 0) {
                        galleryHtml = `<div class="property-gallery">`;
                        galleryHtml += `<a data-fancybox="${galleryId}" href="${galleryImages[0]}" class="image-link-casa" style="display:block;position:relative;overflow:hidden;border-radius:10px;">` +
                            `<img src="${galleryImages[0]}" alt="${casa.nome || 'Casa'}" width="648" height="486" style="cursor:pointer;transition:transform 0.25s;display:block;width:100%;height:100%;object-fit:cover;">` +
                            `<span class="image-overlay-label" style="position:absolute;left:10px;bottom:10px;background:rgba(0,0,0,0.62);color:#fff;padding:7px 12px;border-radius:999px;font-size:0.9em;font-weight:600;">Vedi foto</span>` +
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
                    return `
                    <div class="property-card" style="margin-bottom: 68px;">
                        <div class="availability-badge" style="font-size:1.08rem;font-weight:800;letter-spacing:0.02em;background:linear-gradient(90deg,#0f766e 0%,#15803d 100%);color:#fff;padding:10px 16px;text-transform:uppercase;box-shadow:0 6px 18px rgba(21,128,61,0.35);">${casa.nome || casa.id || 'Casa'}</div>
                        <div class="property-image">
                            ${galleryHtml}
                        </div>
                        <div class="property-info">
                          <!--  ${prezzoTotale !== null ? `<p style="margin:8px 0 8px 0;font-size:1.05em;color:#166534;font-weight:700;">Prezzo totale: ${formatEuro(prezzoTotale)}</p>` : ''} 
                            <p style="margin:0 0 14px 0;font-size:0.9em;line-height:1.4;color:#374151;background:#f8fafc;border:1px solid #dbeafe;border-radius:8px;padding:10px 12px;"><strong>Info costi:</strong> include tutti i servizi: aria condizionata, registrazione ospiti, pulizie e pass parcheggio. <strong>Non effettuiamo</strong> il cambio biancheria. <strong>Caparra:</strong> 20% dell'importo totale.</p> -->
                            <div class="property-features">
                                ${caratteristiche.map(f => `<span class="feature-badge">${f}</span>`).join(' ')}
                            </div>
                            <p class="property-description">${casa.descrizione || ''}</p>
                            <div style="margin-top: 18px; margin-bottom: 10px;">
                                <a href="#" class="prenota-btn" id="${btnId}" style="color: #48bb78; text-decoration: underline; font-weight: 500; display: block; margin-bottom: 10px;">📋 Invia richiesta</a>
                                <!-- <a href="#" class="prenota-online-btn" id="${onlineBtnId}" style="color: #188841; text-decoration: underline; font-weight: 700; display: block; margin-bottom: 10px;">✨ Prenota online</a> -->
                                ${casa.link_dettaglio ? `<a href="${casa.link_dettaglio}" style="color: #48bb78; text-decoration: underline; font-weight: 500; display: block; margin-bottom: 10px;">📋 Vedi casa</a>` : ''}
                                ${casa.link_whatsapp ? `<a href="${casa.link_whatsapp}" target="_blank" style="color: #48bb78; text-decoration: underline; font-weight: 500; display: flex; align-items: center; gap: 7px; margin-bottom: 38px;"> <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 32 32\" fill=\"#fff\" style=\"background:#25d366; border-radius:3px;\"><path d=\"M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-4.713 1.262 1.262-4.669-0.292-0.508c-1.207-2.100-1.847-4.507-1.847-6.978 0-7.51 6.11-13.619 13.619-13.619s13.619 6.109 13.619 13.619c0 7.51-6.11 13.619-13.619 13.619zM21.789 18.75c-0.214-0.107-1.268-0.625-1.464-0.696s-0.339-0.107-0.482 0.107c-0.143 0.214-0.554 0.696-0.679 0.839s-0.25 0.161-0.464 0.054c-0.214-0.107-0.902-0.333-1.718-1.060-0.635-0.567-1.064-1.268-1.189-1.482s-0.013-0.329 0.094-0.435c0.096-0.096 0.214-0.25 0.321-0.375s0.143-0.214 0.214-0.357 0.036-0.268-0.018-0.375c-0.054-0.107-0.482-1.161-0.661-1.589s-0.349-0.362-0.482-0.369c-0.125-0.007-0.268-0.007-0.411-0.007s-0.375 0.054-0.571 0.268c-0.196 0.214-0.75 0.732-0.75 1.786s0.768 2.071 0.875 2.214c0.107 0.143 1.5 2.357 3.653 3.304 0.51 0.214 0.909 0.343 1.219 0.438 0.512 0.161 0.978 0.139 1.346 0.084 0.411-0.061 1.268-0.518 1.446-1.018s0.179-0.929 0.125-1.018c-0.054-0.089-0.196-0.143-0.411-0.25z\"/></svg> WhatsApp</a>` : ''}
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
                              <!--  <div style=\"margin-bottom:12px;display:flex;justify-content:space-between;align-items:flex-start;gap:10px; margin-top: 30px;\">
                                    <h2 style=\"margin:0;font-size:1.15em;color:#2d7a46;\">Richiesta prenotazione</h2>
                                    ${prezzoTotale != null ? `<div style=\"text-align:right;color:#166534;font-weight:700;font-size:1.05em;\">Prezzo totale: ${formatEuro(prezzoTotale)}</div>` : ''}
                                </div> -->
                                
                                <p style=\"margin-bottom:8px; font-size: 1em; color: #4b5563; line-height:1.2;\">Ti ricontatteremo in breve tempo via telefono, email o WhatsApp per confermare la disponibilità e fornire ulteriori info.</p>
                                 
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
                                        <input required name=\"nome\" type=\"text\" placeholder=\"Nome e Cognome *\" style=\"width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;\">
                                        <input name=\"email\" type=\"email\" placeholder=\"Email\" style=\"width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;\">
                                        <input name=\"telefono\" type=\"tel\" placeholder=\"Telefono\" style=\"width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;\">
                                        <select required name=\"preferenza_ricontatto\" style=\"width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;background:#fff;\">
                                            <option value=\"\" selected disabled>Come preferisci essere ricontattato? *</option>
                                            <option value=\"telefono\">Telefono</option>
                                            <option value=\"email\">Email</option>
                                            <option value=\"whatsapp\">WhatsApp</option>
                                        </select>
                                        <input required name=\"persone\" type=\"number\" min=\"1\" max=\"8\" placeholder=\"Numero di Persone *\" style=\"width:100%;padding:11px;border-radius:5px;border:1px solid #ccc;font-size:0.95em;box-sizing:border-box;margin-bottom:8px;\">
                                    </div>

                                    <textarea name=\"messaggio\" placeholder=\"Messaggio (opzionale)\" style=\"width:100%;padding:10px;border-radius:5px;border:1px solid #ccc;min-height:50px;max-height:80px;font-size:0.9em;margin-bottom:12px;box-sizing:border-box;display:block;\"></textarea>
                                    
                                    <div style="display:flex;gap:10px;padding-bottom:10px;flex-wrap:wrap;">
                                        <button type="submit" style="flex:2;background:#2d7a46;color:#fff;padding:12px;border:none;border-radius:6px;font-size:1em;font-weight:600;cursor:pointer;">Invia richiesta</button>
                                       <!-- <button type="button" id="prenotaOnlineBtn" style="flex:2;background:#188841;color:#fff;padding:12px;border:none;border-radius:6px;font-size:1em;font-weight:600;cursor:pointer;">Prenota online</button> -->
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
                                    const pref = form.preferenza_ricontatto.value;
                                    if (pref === 'email' && !form.email.value.trim()) {
                                        form.email.setCustomValidity('Inserisci l\'email per essere ricontattato via email.');
                                        form.email.reportValidity();
                                        return;
                                    }
                                    if ((pref === 'telefono' || pref === 'whatsapp') && !form.telefono.value.trim()) {
                                        const channelLabel = pref === 'whatsapp' ? 'WhatsApp' : 'Telefono';
                                        form.telefono.setCustomValidity('Inserisci il telefono per essere ricontattato via ' + channelLabel + '.');
                                        form.telefono.reportValidity();
                                        return;
                                    }
                                    form.email.setCustomValidity('');
                                    form.telefono.setCustomValidity('');
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
                                                form.messaggio.value.trim(),
                                                `Preferenza ricontatto: ${pref}`
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

                                        let errorMessage = 'Non è stato possibile registrare la prenotazione online.<br>Puoi inviare una richiesta oppure riprovare più tardi.';
                                        if (err && err.status === 400) {
                                            errorMessage = 'I dati inseriti non sono validi oppure non rispettano le regole della casa.<br>Controlla date, ospiti e recapiti e riprova.';
                                        } else if (err && err.status === 409) {
                                            errorMessage = 'Le date selezionate non sono piu disponibili.<br>Scegli un altro periodo o invia una richiesta.';
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

                            const prenotaFormEl = document.getElementById('prenotaForm');
                            const preferenzaSelect = prenotaFormEl.querySelector('select[name="preferenza_ricontatto"]');
                            const emailInput = prenotaFormEl.querySelector('input[name="email"]');
                            const telefonoInput = prenotaFormEl.querySelector('input[name="telefono"]');

                            function applyContactPreference() {
                                const pref = preferenzaSelect.value;
                                emailInput.required = pref === 'email';
                                telefonoInput.required = pref === 'telefono' || pref === 'whatsapp';

                                emailInput.placeholder = pref === 'email' ? 'Email *' : 'Email';
                                telefonoInput.placeholder = (pref === 'telefono' || pref === 'whatsapp') ? 'Telefono *' : 'Telefono';

                                if (pref === 'email') {
                                    telefonoInput.setCustomValidity('');
                                } else if (pref === 'telefono') {
                                    emailInput.setCustomValidity('');
                                }
                            }

                            preferenzaSelect.addEventListener('change', applyContactPreference);
                            applyContactPreference();

                            // Gestione submit form
                            document.getElementById('prenotaForm').onsubmit = async function(ev) {
                                ev.preventDefault();
                                const form = ev.target;
                                const pref = form.preferenza_ricontatto.value;
                                if (pref === 'email' && !form.email.value.trim()) {
                                    form.email.setCustomValidity('Inserisci l\'email per essere ricontattato via email.');
                                    form.email.reportValidity();
                                    return;
                                }
                                if ((pref === 'telefono' || pref === 'whatsapp') && !form.telefono.value.trim()) {
                                    const channelLabel = pref === 'whatsapp' ? 'WhatsApp' : 'Telefono';
                                    form.telefono.setCustomValidity('Inserisci il telefono per essere ricontattato via ' + channelLabel + '.');
                                    form.telefono.reportValidity();
                                    return;
                                }
                                form.email.setCustomValidity('');
                                form.telefono.setCustomValidity('');
                                // Mostra spinner
                                modalBody.innerHTML = `<div style=\"text-align:center;padding:32px 0;\"><div style=\"border:4px solid #f3f3f3;border-top:4px solid #188841;border-radius:50%;width:32px;height:32px;animation:spin 1s linear infinite;margin:0 auto 18px auto;\"></div><span style=\"color:#188841;font-weight:500;\">Invio in corso...</span></div>`;
                                // Raccogli dati
                                const nome = form.nome.value;
                                const email = form.email.value;
                                const telefono = form.telefono.value;
                                const preferenzaRicontatto = form.preferenza_ricontatto.value;
                                const preferenzaRicontattoLabel =
                                    preferenzaRicontatto === 'whatsapp' ? 'WhatsApp' :
                                    preferenzaRicontatto === 'telefono' ? 'Telefono' :
                                    preferenzaRicontatto === 'email' ? 'Email' :
                                    preferenzaRicontatto;
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
                                            preferenzaRicontatto: preferenzaRicontattoLabel,
                                            persone: persone,
                                            appartamento: casa,
                                            checkIn: checkIn,
                                            checkOut: checkOut,
                                            messaggio: messaggio,
                                            source: 'booking-modal'
                                        })
                                    });
                                    if (response.ok) {
                                        if (typeof gtag === 'function') {
                                            gtag('event', 'conversion', { 'send_to': 'AW-17941172028/OvpCCP_1jJQcELyegutC' });
                                        }
                                            modalBody.innerHTML = `<div style=\"text-align:center;padding:32px 0;\"><h2 style=\"color:#2d7a46;\">Richiesta inviata!</h2><p>Grazie per aver richiesto il preventivo.<br>Ti ricontatteremo al più presto.</p><button id=\"closePrenotaModal2\" style=\"margin-top:18px;background:#2d7a46;color:#fff;padding:10px 22px;border:none;border-radius:6px;font-size:1em;cursor:pointer;\">Chiudi</button></div>`;
                                        document.getElementById('closePrenotaModal2').onclick = () => {
                                            modal.style.display = 'none';
                                        };
                                    } else {
                                        modalBody.innerHTML = `<div style=\"text-align:center;padding:32px 0;\"><h2 style=\"color:#b91c1c;\">Errore nell'invio</h2><p>Si è verificato un errore nell'invio della richiesta.<br>Riprova o contattaci via WhatsApp.</p><button id=\"closePrenotaModal2\" style=\"margin-top:18px;background:#b91c1c;color:#fff;padding:10px 22px;border:none;border-radius:6px;font-size:1em;cursor:pointer;\">Chiudi</button></div>`;
                                        document.getElementById('closePrenotaModal2').onclick = () => {
                                            modal.style.display = 'none';
                                        };
                                    }
                                } catch (err) {
                                    modalBody.innerHTML = `<div style=\"text-align:center;padding:32px 0;\"><h2 style=\"color:#b91c1c;\">Errore nell'invio</h2><p>Si è verificato un errore nell'invio della richiesta.<br>Riprova o contattaci via WhatsApp.</p><button id=\"closePrenotaModal2\" style=\"margin-top:18px;background:#b91c1c;color:#fff;padding:10px 22px;border:none;border-radius:6px;font-size:1em;cursor:pointer;\">Chiudi</button></div>`;
                                    document.getElementById('closePrenotaModal2').onclick = () => {
                                        modal.style.display = 'none';
                                    };
                                }
                            };
                    };
                    if (btn) {
                        btn.onclick = openModal;
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
        resultsDiv.innerHTML = `<p>Errore: ${err.message}</p>`;
    }
});
