/**
 * render.js -- Content renderer for new sections-based post.json format
 * Supports: content, list, subsections[], faqs[], image, quote, callout, table
 */

(function (w) {
  'use strict';

  /* -- Helpers ------------------------------------------- */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function slugify(text) {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  }

  /* -- Section renderers --------------------------------- */
  function renderContent(text) {
    return '<p>' + text + '</p>';
  }

  function renderList(items) {
    return '<ul>' + items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>';
  }

  function normalizePath(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path) || path.indexOf('//') === 0) return path;
    if (path.charAt(0) === '/') return path;
    return '/' + String(path).replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
  }

  function renderSubsections(subsections) {
    return subsections.map(function (sub) {
      var inner = '';
      if (sub.content) inner += '<p>' + sub.content + '</p>';
      if (sub.list)    inner += renderList(sub.list);
      return '<div class="subsection-block"><h3 class="subsection-title">' + esc(sub.title) + '</h3>' + inner + '</div>';
    }).join('');
  }

  function renderFaqs(faqs) {
    return faqs.map(function (faq, i) {
      return '<div class="faq-item">' +
        '<button class="faq-question" aria-expanded="false" data-faq="' + i + '">' +
          esc(faq.question) +
          '<span class="faq-icon" aria-hidden="true">+</span>' +
        '</button>' +
        '<div class="faq-answer" id="faq-answer-' + i + '">' +
          '<div class="faq-answer-inner">' + faq.answer + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function renderImage(block) {
    var caption = block.caption ? '<figcaption class="img-caption">' + esc(block.caption) + '</figcaption>' : '';
    return '<figure class="content-figure">' +
      '<img src="' + esc(normalizePath(block.src)) + '" alt="' + esc(block.alt || '') + '" class="content-image" loading="lazy">' +
      caption +
    '</figure>';
  }

  function renderQuote(block) {
    var cite = block.author ? '<cite>-- ' + esc(block.author) + '</cite>' : '';
    return '<div class="content-quote"><blockquote>' + block.text + '</blockquote>' + cite + '</div>';
  }

  function renderCallout(block) {
    var type = block.variant || 'info';
    var icons = { info: 'ℹ️', tip: '💡', warning: '⚠️' };
    return '<div class="callout callout-' + type + '">' +
      '<span class="callout-icon">' + (icons[type] || 'ℹ️') + '</span>' +
      '<p class="callout-text">' + block.text + '</p>' +
    '</div>';
  }

  function renderTable(block) {
    var thead = '<thead><tr>' + block.headers.map(function(h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead>';
    var tbody = '<tbody>' + block.rows.map(function (row) {
      return '<tr>' + row.map(function(c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody>';
    return '<div class="content-table-wrapper"><table class="content-table">' + thead + tbody + '</table></div>';
  }

  /* -- TOC builder --------------------------------------- */
  function buildTOC(sections) {
    if (!sections || sections.length === 0) return '';
    var items = sections.map(function (sec, i) {
      if (!sec.heading) return '';
      var id = 'section-' + slugify(sec.heading);
      return '<li><a href="#' + id + '">' + esc(sec.heading) + '</a></li>';
    }).join('');
    if (!items) return '';
    return '<nav class="toc-wrapper" aria-label="Table of contents">' +
      '<div class="toc-heading">📋 Table of Contents</div>' +
      '<ol class="toc-list">' + items + '</ol>' +
    '</nav>';
  }

  function buildTOCAccordion(sections) {
    if (!sections || sections.length === 0) return '';
    var items = sections.map(function (sec) {
      if (!sec.heading) return '';
      var id = 'section-' + slugify(sec.heading);
      return '<li><a href="#' + id + '">' + esc(sec.heading) + '</a></li>';
    }).join('');
    if (!items) return '';
    return '<div class="toc-accordion">' +
      '<button class="toc-accordion-btn" aria-expanded="false">' +
        '📋 Table of Contents' +
        '<span class="chevron">▾</span>' +
      '</button>' +
      '<div class="toc-accordion-content"><ol class="toc-list">' + items + '</ol></div>' +
    '</div>';
  }

  /* -- Main render function ------------------------------ */
  function renderPost(postData, containerEl) {
    var sections = postData.sections || [];
    var html = '';

    // Render TOC into dedicated left column if present
    var tocColumn = document.getElementById('post-toc-column');
    if (tocColumn) {
      tocColumn.innerHTML = buildTOC(sections);
    }
    // Render mobile TOC accordion
    var tocMobile = document.getElementById('post-toc-mobile');
    if (tocMobile) {
      tocMobile.innerHTML = buildTOCAccordion(sections);
    }

    // Sections
    sections.forEach(function (sec) {
      var sectionHtml = '';
      var sectionId = sec.heading ? 'id="section-' + slugify(sec.heading) + '"' : '';

      if (sec.heading) {
        sectionHtml += '<h2 ' + sectionId + '>' + esc(sec.heading) + '</h2>';
      }

      if (sec.content)     sectionHtml += renderContent(sec.content);
      if (sec.list)        sectionHtml += renderList(sec.list);
      if (sec.subsections) sectionHtml += renderSubsections(sec.subsections);
      if (sec.faqs)        sectionHtml += renderFaqs(sec.faqs);
      if (sec.image)       sectionHtml += renderImage(sec.image);
      if (sec.quote)       sectionHtml += renderQuote(sec.quote);
      if (sec.callout)     sectionHtml += renderCallout(sec.callout);
      if (sec.table)       sectionHtml += renderTable(sec.table);

      html += '<section class="post-section">' + sectionHtml + '</section>';
    });

    containerEl.innerHTML = html;

    // Bind FAQ accordions
    containerEl.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', String(!expanded));
        var answerId = 'faq-answer-' + this.dataset.faq;
        var answerEl = document.getElementById(answerId);
        if (answerEl) answerEl.classList.toggle('open', !expanded);
        this.querySelector('.faq-icon').textContent = !expanded ? '×' : '+';
      });
    });

    // Bind TOC accordion
    var tocBtn = containerEl.querySelector('.toc-accordion-btn');
    if (tocBtn) {
      tocBtn.addEventListener('click', function () {
        var expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', String(!expanded));
        var content = this.nextElementSibling;
        if (content) content.classList.toggle('open', !expanded);
      });
    }
  }

  /* -- Trending Reads renderer --------------------------- */
  function renderTrendingReads(posts, containerEl, currentSlug) {
    var filtered = posts.filter(function (p) { return p.slug !== currentSlug; });
    if (!filtered.length) { containerEl.innerHTML = ''; return; }

    var items = filtered.map(function (p, idx) {
      var url = '/blog/' + p.slug;
      var thumb = p.coverImage || ('https://source.unsplash.com/76x56/?dubai-travel&sig=' + idx);
      return '<li>' +
        '<a href="' + url + '" class="trending-card">' +
          '<img src="' + esc(thumb) + '" alt="' + esc(p.title) + '" class="trending-thumb" loading="lazy">' +
          '<div class="trending-card-meta">' +
            '<span class="trending-card-rank"># ' + (idx + 1) + ' Trending</span>' +
            '<span class="trending-card-title">' + esc(p.title) + '</span>' +
            '<span class="trending-card-date">' + (p.date || '') + '</span>' +
          '</div>' +
        '</a>' +
      '</li>';
    }).join('');

    containerEl.innerHTML =
      '<div class="trending-reads">' +
        '<div class="trending-reads-header">' +
          '<span class="trending-reads-title"><span class="flame-icon">🔥</span> Trending Reads</span>' +
        '</div>' +
        '<ul class="trending-reads-list">' + items + '</ul>' +
      '</div>';
  }

  /* -- Author avatar initial ----------------------------- */
  function renderAuthorAvatar(name) {
    return (name || 'A').charAt(0).toUpperCase();
  }

  /* -- Export -------------------------------------------- */
  w.PropInsightRender = {
    renderPost: renderPost,
    renderTrendingReads: renderTrendingReads,
    renderAuthorAvatar: renderAuthorAvatar,
    slugify: slugify
  };

}(window));
