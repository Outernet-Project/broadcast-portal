<%inherit file='base.tpl'/>

<%block name="main">
<div class="grid">
    <div class="grid-container">
        <div class="grid-row broadcast">
            <div class="col content">
                ${h.form('post', action=url('broadcast'), enctype="multipart/form-data")}
                    % if form.error:
                    ${form.error}
                    % endif
                    ${csrf_tag()}
                    ${form.content_id}
                    ${form.signature}
                    <p class="field form-input-required form-input-file">
                        ${form.content_file.label}
                        ${form.content_file}
                        % if form.content_file.error:
                        ${form.content_file.error}
                        % endif
                    </p>
                    <p class="field form-input-required">
                        ${form.title.label}
                        ${form.title}
                        % if form.title.error:
                        ${form.title.error}
                        % endif
                    </p>
                    <p class="field form-input-required form-select">
                        ${form.license.label}
                        ${form.license}
                        % if form.license.error:
                        ${form.license.error}
                        % endif
                        <span class="field-help">${_("Use All Rights Reserved if you want to keep all rights to yourself, and here is a good starting point if you feel it's important that users have more freedom.")}</span>
                    </p>
                    <p class="field form-input-required content-path">
                        ${form.path.label}
                        <input type="text" readonly class="path-prefix" value="${path_prefix}" />
                        ${form.path}
                        % if form.path.error:
                        ${form.path.error}
                        % endif
                        <span class="field-help preview"></span>
                        <span class="field-help">${_("This will be the direct link to your content on Outernet. It's similar to a regular internet link. You are free to use any URL provided that it only consists of letters (a-z), numbers (0-9), dashes (-), underscores (_) and slashes (/).")}</span>
                    </p>
                    <p>
                        <button type="submit"><span class="icon"></span> ${_('Continue')}</button>
                    </p>
                </form>
            </div>
        </div>
    </div>
</div>
</%block>

<%block name="extra_scripts">
    <script src="${assets['js/broadcast']}"></script>
</%block>
