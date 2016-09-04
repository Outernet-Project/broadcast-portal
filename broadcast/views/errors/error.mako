<%inherit file="/_inner.mako"/>
<%namespace name="error" file="_error.mako"/>

<%block name="page_title">${message}</%block>

<%block name="body_class">error error-${err.status_code}</%block>

<h1 class="error-code">
    <span class="icon icon-alert-${icon}"></span>
    <span class="heading-text">${message}</span>
</h1>

<section id="error-description" class="error-description">
${error.body()}
</section>