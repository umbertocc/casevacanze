document.getElementById('booking-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Ricerca in corso...';
    try {
        const res = await fetch(`https://demo-mail-993653817397.europe-west8.run.app/api/disponibilita/case?checkIn=${checkIn}&checkOut=${checkOut}`);
        if (!res.ok) throw new Error('Errore nella richiesta');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            resultsDiv.innerHTML = '<h2 id="fadeSlideTitle" class="fade-slide-in" style="text-align:center;margin-top:48px;margin-bottom:32px;">Case disponibili:</h2>' +
                '<div class="properties-grid fade-slide-in" id="fadeSlideResults">' +
                data.map(casa => {
                    // Card stile case-vacanze
                    let caratteristiche = casa.caratteristiche;
                    if (typeof caratteristiche === 'string') {
                        caratteristiche = caratteristiche.split(',').map(f => f.trim()).filter(Boolean);
                    }
                    if (!Array.isArray(caratteristiche)) caratteristiche = [];
                    return `
                    <div class="property-card" style="margin-bottom: 68px;">
                        <div class="availability-badge">✔️ Disponibile</div>
                        <div class="property-image">
                            <img src="${casa.immagine || 'img/casa-bella-vista/prospetto-mobile.jpg'}" alt="${casa.nome || 'Casa'}" width="320" height="220">
                        </div>
                        <div class="property-info">
                            <h3 class="property-title">${casa.nome || casa.id || 'Casa'}</h3>
                            <p class="property-subtitle">${casa.sottotitolo || ''}</p>
                            <div class="property-features">
                                ${caratteristiche.map(f => `<span class="feature-badge">${f}</span>`).join(' ')}
                            </div>
                            <p class="property-description">${casa.descrizione || ''}</p>
                            <div style="margin-top: 18px; margin-bottom: 10px;">
                                ${casa.linkPreventivo ? `<a href="${casa.linkPreventivo}" style="color: #48bb78; text-decoration: underline; font-weight: 500; display: block; margin-bottom: 10px;">Richiedi Preventivo</a>` : ''}
                                ${casa.linkDettaglio ? `<a href="${casa.linkDettaglio}" style="color: #48bb78; text-decoration: underline; font-weight: 500; display: block; margin-bottom: 10px;">📋 Vedi casa</a>` : ''}
                                ${casa.linkWhatsapp ? `<a href="${casa.linkWhatsapp}" target="_blank" style="color: #48bb78; text-decoration: underline; font-weight: 500; display: flex; align-items: center; gap: 7px; margin-bottom: 38px;"> <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 32 32\" fill=\"#fff\" style=\"background:#25d366; border-radius:3px;\"><path d=\"M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-4.713 1.262 1.262-4.669-0.292-0.508c-1.207-2.100-1.847-4.507-1.847-6.978 0-7.51 6.11-13.619 13.619-13.619s13.619 6.109 13.619 13.619c0 7.51-6.11 13.619-13.619 13.619zM21.789 18.75c-0.214-0.107-1.268-0.625-1.464-0.696s-0.339-0.107-0.482 0.107c-0.143 0.214-0.554 0.696-0.679 0.839s-0.25 0.161-0.464 0.054c-0.214-0.107-0.902-0.333-1.718-1.060-0.635-0.567-1.064-1.268-1.189-1.482s-0.013-0.329 0.094-0.435c0.096-0.096 0.214-0.25 0.321-0.375s0.143-0.214 0.214-0.357 0.036-0.268-0.018-0.375c-0.054-0.107-0.482-1.161-0.661-1.589s-0.349-0.362-0.482-0.369c-0.125-0.007-0.268-0.007-0.411-0.007s-0.375 0.054-0.571 0.268c-0.196 0.214-0.75 0.732-0.75 1.786s0.768 2.071 0.875 2.214c0.107 0.143 1.5 2.357 3.653 3.304 0.51 0.214 0.909 0.343 1.219 0.438 0.512 0.161 0.978 0.139 1.346 0.084 0.411-0.061 1.268-0.518 1.446-1.018s0.179-0.929 0.125-1.018c-0.054-0.089-0.196-0.143-0.411-0.25z\"/></svg> WhatsApp</a>` : ''}
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
            }, 50);
        } else {
            resultsDiv.innerHTML = '<p>Nessuna casa disponibile per il periodo selezionato.</p>';
        }
    } catch (err) {
        resultsDiv.innerHTML = `<p>Errore: ${err.message}</p>`;
    }
});
