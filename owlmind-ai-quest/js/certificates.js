/* certificates.js — OwlMind AI Quest
   Exposes window.OWL.certificates
   Depends on: OWL.state, OWL.courses, OWL.app
   Certificates stored in localStorage.
*/
(function (OWL) {
  'use strict';

  var CERT_STORAGE_KEY = 'owl_certificates';

  /* ─── helpers ─── */
  function _appContent() { return document.getElementById('app-content'); }

  function _getAllCerts() {
    try { return JSON.parse(localStorage.getItem(CERT_STORAGE_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function _saveAllCerts(certs) {
    try { localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(certs)); }
    catch (e) {}
  }

  function _genId() {
    return 'OWL-' + Math.random().toString(36).substr(2,4).toUpperCase() + '-' +
      Math.random().toString(36).substr(2,4).toUpperCase() + '-' +
      Date.now().toString(36).toUpperCase().substr(-4);
  }

  function _formatDate(dateStr) {
    var d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /* ─── inject styles ─── */
  function _injectStyles() {
    if (document.getElementById('owl-cert-styles')) return;
    var style = document.createElement('style');
    style.id = 'owl-cert-styles';
    style.textContent = `
/* ─── Certificates Page ─── */
.cert-page { max-width: 1100px; margin: 0 auto; padding: 32px 16px; }
.cert-page-hero { text-align: center; margin-bottom: 36px; }
.cert-page-hero h2 { font-size: 2rem; font-weight: 800; color: #1e1b4b; margin: 0 0 8px; }
.cert-page-hero p { color: #6b7280; font-size: 1rem; }

/* Grid */
.certs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; margin-bottom: 36px; }
.cert-card { background: linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95);
  border-radius: 16px; padding: 24px; color: #fff; position: relative; overflow: hidden;
  box-shadow: 0 6px 24px rgba(99,102,241,.25); transition: transform .2s, box-shadow .2s; cursor: pointer; }
.cert-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(99,102,241,.35); }
.cert-card-badge { font-size: 2.4rem; margin-bottom: 12px; }
.cert-card-title { font-size: .72rem; text-transform: uppercase; letter-spacing: .1em;
  color: #a5b4fc; font-weight: 600; margin-bottom: 6px; }
.cert-card-course { font-size: 1.05rem; font-weight: 800; margin-bottom: 12px; }
.cert-card-meta { display: flex; gap: 12px; font-size: .78rem; color: #c7d2fe; flex-wrap: wrap; }
.cert-card-id { font-family: monospace; font-size: .72rem; color: #a5b4fc; margin-top: 10px; }
.cert-card-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.btn-cert-view { background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.3);
  color: #fff; border-radius: 8px; padding: 6px 14px; font-size: .8rem; font-weight: 600;
  cursor: pointer; transition: background .15s; }
.btn-cert-view:hover { background: rgba(255,255,255,.25); }
.btn-cert-dl { background: linear-gradient(90deg,#f59e0b,#fbbf24); color: #1e1b4b;
  border: none; border-radius: 8px; padding: 6px 14px; font-size: .8rem; font-weight: 700;
  cursor: pointer; transition: opacity .2s; }
.btn-cert-dl:hover { opacity: .88; }
.cert-card-shine { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,.04) 50%, transparent 60%);
  pointer-events: none; }

/* Empty state */
.cert-empty { text-align: center; padding: 60px 20px;
  background: #f8f7ff; border-radius: 20px; border: 2px dashed #c7d2fe; }
.cert-empty-owl { font-size: 4rem; margin-bottom: 16px; }
.cert-empty h3 { font-size: 1.3rem; font-weight: 700; color: #1e1b4b; margin-bottom: 8px; }
.cert-empty p { color: #6b7280; margin-bottom: 20px; }
.btn-earn-cert { background: linear-gradient(90deg,#6366f1,#8b5cf6); color: #fff;
  border: none; border-radius: 10px; padding: 12px 28px; font-weight: 700; cursor: pointer;
  font-size: .95rem; transition: opacity .2s; }
.btn-earn-cert:hover { opacity: .88; }

/* Verify section */
.cert-verify-section { background: #fff; border-radius: 16px; padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06); border: 1px solid #e0e7ff; margin-bottom: 28px; }
.cert-verify-section h3 { font-size: 1rem; font-weight: 700; color: #1e1b4b; margin: 0 0 14px; }
.verify-input-row { display: flex; gap: 10px; }
.verify-input { flex: 1; border: 2px solid #e0e7ff; border-radius: 10px; padding: 11px 14px;
  font-size: .92rem; color: #1e1b4b; outline: none; font-family: monospace; transition: border-color .15s; }
.verify-input:focus { border-color: #6366f1; }
.btn-verify { background: #6366f1; color: #fff; border: none; border-radius: 10px;
  padding: 11px 22px; font-weight: 700; cursor: pointer; font-size: .92rem; transition: opacity .2s; }
.btn-verify:hover { opacity: .88; }
.verify-result { margin-top: 14px; padding: 14px 16px; border-radius: 10px; font-size: .9rem; display: none; }
.verify-valid { background: #dcfce7; border: 1px solid #86efac; color: #065f46; }
.verify-invalid { background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; }

/* Canvas modal */
.cert-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 10000;
  display: flex; align-items: center; justify-content: center; padding: 20px; }
.cert-modal-box { background: #1e1b4b; border-radius: 20px; padding: 24px; max-width: 100%;
  width: 900px; position: relative; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.cert-modal-close { position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,.15);
  border: none; color: #fff; border-radius: 8px; width: 32px; height: 32px; font-size: 1.1rem;
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .15s; }
.cert-modal-close:hover { background: rgba(255,255,255,.25); }
.cert-canvas-wrap { max-width: 100%; overflow: auto; }
.cert-canvas-wrap canvas { max-width: 100%; height: auto; border-radius: 12px;
  box-shadow: 0 8px 40px rgba(0,0,0,.4); display: block; }
.cert-modal-actions { display: flex; gap: 12px; }
.btn-dl-cert { background: linear-gradient(90deg,#f59e0b,#fbbf24); color: #1e1b4b;
  border: none; border-radius: 10px; padding: 11px 24px; font-weight: 800; cursor: pointer;
  font-size: .92rem; transition: opacity .2s; }
.btn-dl-cert:hover { opacity: .88; }
.btn-close-modal { background: rgba(255,255,255,.1); color: #fff; border: 1px solid rgba(255,255,255,.2);
  border-radius: 10px; padding: 11px 24px; font-weight: 600; cursor: pointer;
  font-size: .92rem; transition: background .15s; }
.btn-close-modal:hover { background: rgba(255,255,255,.2); }

/* Section header */
.cert-section-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.cert-section-hdr h3 { font-size: 1.1rem; font-weight: 700; color: #1e1b4b; margin: 0; }
    `;
    document.head.appendChild(style);
  }

  /* ─── canvas certificate renderer ─── */
  function renderCertificate(cert) {
    var W = 1200, H = 850;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');

    /* Background gradient */
    var bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0f0c29');
    bg.addColorStop(0.5, '#1e1b4b');
    bg.addColorStop(1, '#2d2358');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    /* Subtle texture overlay - dot pattern */
    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    for (var xi = 0; xi < W; xi += 30) {
      for (var yi = 0; yi < H; yi += 30) {
        ctx.beginPath();
        ctx.arc(xi, yi, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* Outer gold border */
    function goldStroke(x, y, w, h, lw, alpha) {
      var grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, 'rgba(251,191,36,' + alpha + ')');
      grad.addColorStop(0.5, 'rgba(245,158,11,' + alpha + ')');
      grad.addColorStop(1, 'rgba(251,191,36,' + alpha + ')');
      ctx.strokeStyle = grad;
      ctx.lineWidth = lw;
      ctx.strokeRect(x, y, w, h);
    }

    goldStroke(16, 16, W - 32, H - 32, 4, 0.9);
    goldStroke(28, 28, W - 56, H - 56, 1.5, 0.6);
    goldStroke(36, 36, W - 72, H - 72, 0.8, 0.35);

    /* Corner ornaments */
    function drawCornerOrnament(cx, cy, angle) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      var cg = ctx.createRadialGradient(0, 0, 5, 0, 0, 40);
      cg.addColorStop(0, 'rgba(251,191,36,0.9)');
      cg.addColorStop(1, 'rgba(245,158,11,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      for (var p = 0; p < 8; p++) {
        var angle2 = (p * Math.PI * 2) / 8;
        var r = p % 2 === 0 ? 36 : 20;
        if (p === 0) ctx.moveTo(Math.cos(angle2) * r, Math.sin(angle2) * r);
        else ctx.lineTo(Math.cos(angle2) * r, Math.sin(angle2) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    drawCornerOrnament(56, 56, 0);
    drawCornerOrnament(W - 56, 56, Math.PI / 2);
    drawCornerOrnament(W - 56, H - 56, Math.PI);
    drawCornerOrnament(56, H - 56, -Math.PI / 2);

    /* Horizontal divider lines */
    function dividerLine(y) {
      var dg = ctx.createLinearGradient(60, y, W - 60, y);
      dg.addColorStop(0, 'rgba(251,191,36,0)');
      dg.addColorStop(0.2, 'rgba(251,191,36,0.6)');
      dg.addColorStop(0.8, 'rgba(251,191,36,0.6)');
      dg.addColorStop(1, 'rgba(251,191,36,0)');
      ctx.strokeStyle = dg;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, y); ctx.lineTo(W - 60, y);
      ctx.stroke();
    }
    dividerLine(148);
    dividerLine(H - 148);

    /* Owl mascot (drawn with canvas) */
    function drawOwl(cx, cy, scale) {
      scale = scale || 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      // Body
      var bodyG = ctx.createRadialGradient(0, 10, 8, 0, 10, 45);
      bodyG.addColorStop(0, '#a78bfa');
      bodyG.addColorStop(1, '#4c1d95');
      ctx.fillStyle = bodyG;
      ctx.beginPath();
      ctx.ellipse(0, 10, 38, 46, 0, 0, Math.PI * 2);
      ctx.fill();

      // Face
      ctx.fillStyle = '#ede9fe';
      ctx.beginPath();
      ctx.ellipse(0, -5, 28, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      [-13, 13].forEach(function(ex) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ex, -8, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(ex + 1, -8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.arc(ex + 2, -10, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        ctx.beginPath();
        ctx.arc(ex + 3, -11, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Beak
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(0, -1); ctx.lineTo(-7, 5); ctx.lineTo(7, 5);
      ctx.closePath(); ctx.fill();

      // Ears/tufts
      ctx.fillStyle = '#6d28d9';
      [[-22, -32], [22, -32]].forEach(function(pt) {
        ctx.beginPath();
        ctx.moveTo(pt[0], pt[1] + 12);
        ctx.lineTo(pt[0] - 7 * (pt[0] < 0 ? 1 : -1), pt[1]);
        ctx.lineTo(pt[0] + 5 * (pt[0] < 0 ? 1 : -1), pt[1]);
        ctx.closePath(); ctx.fill();
      });

      // Wings
      ctx.fillStyle = '#7c3aed';
      [-1, 1].forEach(function(side) {
        ctx.save();
        ctx.scale(side, 1);
        ctx.beginPath();
        ctx.ellipse(42, 15, 12, 28, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Feet
      ctx.fillStyle = '#f59e0b';
      [[-14, 54], [14, 54]].forEach(function(ft) {
        ctx.beginPath();
        ctx.moveTo(ft[0], ft[1]);
        [-8,-3,3,8].forEach(function(tx, i) {
          if(i===0) ctx.moveTo(ft[0]+tx, ft[1]);
          ctx.lineTo(ft[0]+tx, ft[1]+10);
        });
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();
      });

      ctx.restore();
    }
    drawOwl(W / 2, 96, 1.1);

    /* Header text */
    ctx.textAlign = 'center';

    // OWLMIND
    ctx.font = 'bold 18px "Inter", "Arial", sans-serif';
    ctx.fillStyle = '#a5b4fc';
    ctx.letterSpacing = '0.2em';
    ctx.fillText('OWLMIND AI QUEST', W / 2, 176);

    // CERTIFICATE OF COMPLETION
    var goldGrad = ctx.createLinearGradient(W/2 - 300, 0, W/2 + 300, 0);
    goldGrad.addColorStop(0, '#fbbf24');
    goldGrad.addColorStop(0.5, '#f59e0b');
    goldGrad.addColorStop(1, '#fbbf24');
    ctx.fillStyle = goldGrad;
    ctx.font = 'bold 44px "Georgia", "Times New Roman", serif';
    ctx.fillText('CERTIFICATE OF COMPLETION', W / 2, 238);

    /* Thin divider stars */
    ctx.fillStyle = 'rgba(251,191,36,0.7)';
    ctx.font = '16px Arial';
    ctx.fillText('✦ ✦ ✦', W / 2, 262);

    /* This certifies that */
    ctx.fillStyle = '#c7d2fe';
    ctx.font = 'italic 20px "Georgia", serif';
    ctx.fillText('This certifies that', W / 2, 310);

    /* Student Name */
    var nameGrad = ctx.createLinearGradient(W/2 - 250, 0, W/2 + 250, 0);
    nameGrad.addColorStop(0, '#e0e7ff');
    nameGrad.addColorStop(0.5, '#ffffff');
    nameGrad.addColorStop(1, '#e0e7ff');
    ctx.fillStyle = nameGrad;
    ctx.font = 'bold 58px "Georgia", "Times New Roman", serif';
    ctx.fillText(cert.studentName || 'Student Name', W / 2, 380);

    /* Underline name */
    var uw = ctx.measureText(cert.studentName || 'Student Name').width;
    var underlineG = ctx.createLinearGradient(W/2 - uw/2, 0, W/2 + uw/2, 0);
    underlineG.addColorStop(0, 'rgba(251,191,36,0)');
    underlineG.addColorStop(0.5, 'rgba(251,191,36,0.8)');
    underlineG.addColorStop(1, 'rgba(251,191,36,0)');
    ctx.strokeStyle = underlineG;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W/2 - uw/2, 392); ctx.lineTo(W/2 + uw/2, 392);
    ctx.stroke();

    /* has successfully completed */
    ctx.fillStyle = '#c7d2fe';
    ctx.font = 'italic 20px "Georgia", serif';
    ctx.fillText('has successfully completed the course', W / 2, 432);

    /* Course name */
    var courseGrad = ctx.createLinearGradient(W/2 - 300, 0, W/2 + 300, 0);
    courseGrad.addColorStop(0, '#a5b4fc');
    courseGrad.addColorStop(0.5, '#e0e7ff');
    courseGrad.addColorStop(1, '#a5b4fc');
    ctx.fillStyle = courseGrad;
    ctx.font = 'bold 36px "Inter", "Arial", sans-serif';
    ctx.fillText(cert.courseName || 'AI Course', W / 2, 492);

    /* Date and ID section */
    var mid = H - 120;

    // Left — date
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(165,180,252,0.6)';
    ctx.font = '13px "Inter", Arial, sans-serif';
    ctx.fillText('DATE OF COMPLETION', 100, mid);
    ctx.fillStyle = '#e0e7ff';
    ctx.font = 'bold 17px "Georgia", serif';
    ctx.fillText(_formatDate(cert.date || new Date().toISOString()), 100, mid + 24);

    // Right — cert ID
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(165,180,252,0.6)';
    ctx.font = '13px "Inter", Arial, sans-serif';
    ctx.fillText('CERTIFICATE ID', W - 100, mid);
    ctx.fillStyle = '#e0e7ff';
    ctx.font = 'bold 17px "Georgia", serif';
    ctx.fillText(cert.id || 'OWL-XXXX-XXXX', W - 100, mid + 24);

    // Center — OwlMind signature line
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(165,180,252,0.5)';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('─────────────────────────────', W / 2, mid - 5);
    ctx.fillStyle = '#818cf8';
    ctx.font = 'italic bold 16px "Georgia", serif';
    ctx.fillText('OwlMind Academy', W / 2, mid + 16);
    ctx.fillStyle = 'rgba(165,180,252,0.6)';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('Authorized Signature', W / 2, mid + 32);

    /* QR-like pattern */
    function drawQR(x, y, size) {
      var cells = 7;
      var cell = size / cells;
      var qData = cert.id || 'OWL';
      for (var r = 0; r < cells; r++) {
        for (var c = 0; c < cells; c++) {
          var filled = (qData.charCodeAt((r * cells + c) % qData.length) + r + c) % 3 === 0;
          // Finder patterns
          if ((r < 2 && c < 2) || (r < 2 && c >= cells - 2) || (r >= cells - 2 && c < 2)) filled = true;
          ctx.fillStyle = filled ? 'rgba(165,180,252,0.7)' : 'transparent';
          if (filled) ctx.fillRect(x + c * cell, y + r * cell, cell - 1, cell - 1);
        }
      }
    }
    drawQR(W / 2 - 38, H - 80, 60);

    /* verify label under QR */
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(165,180,252,0.45)';
    ctx.font = '10px Arial, sans-serif';
    ctx.fillText('VERIFY AT OWLMIND.APP', W / 2, H - 12);

    return canvas;
  }

  /* ─── generate certificate ─── */
  function generate(courseId, studentName) {
    var courses = OWL.courses || [];
    var course = courses.find(function(c) { return c.id === courseId; }) || { title: courseId, id: courseId };
    var user = (OWL.state && OWL.state.user) || {};

    var cert = {
      id: _genId(),
      courseId: courseId,
      courseName: course.title || courseId,
      studentName: studentName || user.name || user.username || 'Learner',
      studentId: user.id || 'guest',
      date: new Date().toISOString(),
      verifyCode: _genId()
    };

    // Save
    var allCerts = _getAllCerts();
    allCerts.push(cert);
    _saveAllCerts(allCerts);

    // Also save to user profile
    try {
      var userKey = 'owl_user_certs_' + (user.id || 'guest');
      var userCerts = JSON.parse(localStorage.getItem(userKey) || '[]');
      userCerts.push(cert.id);
      localStorage.setItem(userKey, JSON.stringify(userCerts));
    } catch(e) {}

    return cert;
  }

  /* ─── download certificate ─── */
  function downloadCertificate(certId) {
    var allCerts = _getAllCerts();
    var cert = allCerts.find(function(c) { return c.id === certId; });
    if (!cert) { alert('Certificate not found.'); return; }
    var canvas = renderCertificate(cert);
    var link = document.createElement('a');
    link.download = 'OwlMind-Certificate-' + cert.id + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  /* ─── show certificate in modal ─── */
  function _showModal(cert) {
    var existing = document.getElementById('cert-modal-overlay');
    if (existing) existing.remove();

    var canvas = renderCertificate(cert);

    var overlay = document.createElement('div');
    overlay.className = 'cert-modal-overlay';
    overlay.id = 'cert-modal-overlay';
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

    var box = document.createElement('div');
    box.className = 'cert-modal-box';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'cert-modal-close';
    closeBtn.textContent = '✕';
    closeBtn.onclick = function() { overlay.remove(); };

    var wrap = document.createElement('div');
    wrap.className = 'cert-canvas-wrap';
    wrap.appendChild(canvas);

    var actions = document.createElement('div');
    actions.className = 'cert-modal-actions';
    actions.innerHTML = `
      <button class="btn-dl-cert" onclick="OWL.certificates.downloadCertificate('${cert.id}')">⬇ Download PNG</button>
      <button class="btn-close-modal" onclick="document.getElementById('cert-modal-overlay').remove()">Close</button>`;

    box.appendChild(closeBtn);
    box.appendChild(wrap);
    box.appendChild(actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  /* ─── verify certificate ─── */
  function verifyCertificate(verifyCode) {
    var allCerts = _getAllCerts();
    var cert = allCerts.find(function(c) { return c.id === verifyCode || c.verifyCode === verifyCode; });
    var resultEl = document.getElementById('verify-result');
    if (!resultEl) return;
    resultEl.style.display = 'block';
    if (cert) {
      resultEl.className = 'verify-result verify-valid';
      resultEl.innerHTML = `✅ <strong>Valid Certificate!</strong><br>
        Awarded to <strong>${cert.studentName}</strong> for completing <strong>${cert.courseName}</strong> on ${_formatDate(cert.date)}.`;
    } else {
      resultEl.className = 'verify-result verify-invalid';
      resultEl.innerHTML = '❌ <strong>Certificate not found.</strong> Please check the ID and try again.';
    }
  }

  /* ─── show page ─── */
  function show() {
    _injectStyles();
    var user = (OWL.state && OWL.state.user) || {};
    var userId = user.id || 'guest';
    var allCerts = _getAllCerts();
    var userCerts = allCerts.filter(function(c) { return c.studentId === userId; });

    var certsHtml = '';
    if (userCerts.length === 0) {
      certsHtml = `
      <div class="cert-empty">
        <div class="cert-empty-owl">🦉</div>
        <h3>No certificates yet</h3>
        <p>Complete a full course to earn your first certificate of completion!</p>
        <button class="btn-earn-cert" onclick="OWL.app.navigate('courses')">Browse Courses</button>
      </div>`;
    } else {
      var cards = userCerts.map(function(cert) {
        return `
        <div class="cert-card">
          <div class="cert-card-shine"></div>
          <div class="cert-card-badge">🏆</div>
          <div class="cert-card-title">Certificate of Completion</div>
          <div class="cert-card-course">${cert.courseName}</div>
          <div class="cert-card-meta">
            <span>📅 ${_formatDate(cert.date)}</span>
            <span>👤 ${cert.studentName}</span>
          </div>
          <div class="cert-card-id">ID: ${cert.id}</div>
          <div class="cert-card-actions">
            <button class="btn-cert-view" onclick="OWL.certificates._showModal(${JSON.stringify(cert).replace(/"/g,'&quot;')})">View</button>
            <button class="btn-cert-dl" onclick="OWL.certificates.downloadCertificate('${cert.id}')">⬇ Download</button>
          </div>
        </div>`;
      }).join('');
      certsHtml = `<div class="certs-grid">${cards}</div>`;
    }

    _appContent().innerHTML = `
    <div class="cert-page">
      <div class="cert-page-hero">
        <h2>🏆 My Certificates</h2>
        <p>Showcase your AI learning achievements. Download and share your certificates.</p>
      </div>

      ${certsHtml}

      <div class="cert-verify-section">
        <h3>🔍 Verify a Certificate</h3>
        <div class="verify-input-row">
          <input class="verify-input" id="verify-input" type="text"
            placeholder="Enter Certificate ID (e.g. OWL-ABCD-1234)"
            onkeydown="if(event.key==='Enter')OWL.certificates.verifyCertificate(document.getElementById('verify-input').value)" />
          <button class="btn-verify" onclick="OWL.certificates.verifyCertificate(document.getElementById('verify-input').value)">Verify</button>
        </div>
        <div class="verify-result" id="verify-result"></div>
      </div>
    </div>`;
  }

  /* ─── expose ─── */
  OWL.certificates = {
    show: show,
    generate: generate,
    renderCertificate: renderCertificate,
    downloadCertificate: downloadCertificate,
    verifyCertificate: verifyCertificate,
    _showModal: _showModal
  };

}(window.OWL = window.OWL || {}));
