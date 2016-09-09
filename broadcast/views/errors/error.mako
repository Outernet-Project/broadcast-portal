<%inherit file="/_inner.mako"/>
<%namespace name="error" file="_error.mako"/>

<%block name="page_title">${message}</%block>

<%block name="body_class">error error-${err.status_code}</%block>

<%block name="extra_head">
    %if err.status_code == 401:
    <meta http-equiv="refresh" content="0; ${url('auth:login', next=request.fullpath)}">
    %endif
</%block>

<h1 class="error-code">
    <span class="icon icon-alert-${icon}"></span>
    <span class="heading-text">${message}</span>
</h1>

<section id="error-description" class="error-description">
${error.body()}
</section>
