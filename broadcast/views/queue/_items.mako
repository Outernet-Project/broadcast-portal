<%def name="content_item(item)">
    <p class="item-info item-name">
        <span class="icon icon-file"></span>
        <a href="${url('queue:download', item_id=item.id)}" target="_blank">
            ${item.filename}
        </a>
    </p>
    <p class="item-info item-attribution">
        ${_('Uploaded by {username} {timeago}').format(username=item.username, timeago=th.human_time(item.created))}
    </p>
    <p class="item-info item-download item-abuse">
        <a class="button button-small" href="${url('queue:download', item_id=item.id)}" target="_blank">
            <span class="icon icon-download"></span>
            <span class="invisible-label">${_('download')}</span>
            <span class="supplementary-info">${h.hsize(item.size)}</span>
        </a> 
        <a class="button button-small" href="mailto:report@outernet.is?subject=Reporting+abuse+for+file+ID+${item.id}">
            <span class="icon icon-flag"></span>
            <span class="invisible-label">${_('Report')}</span>
        </a>
    </p>
    <% canvote = (not item.user_vote) and request.user.has_role(request.user.MODERATOR) %>
    <form class="vote-form" action="${url('queue:vote', item_id=item.id)}" method="POST">
        <input type="hidden" name="next" value="${request.fullpath}">
        %if canvote:
            <button class="vote-icon vote-up" type="submit" name="upvote" value="yes"${' disabled' if novote else ''}>
                <span class="icon icon-expand-up"></span>
                <span class="invisible-label">${_('upvote')}</span>
            </button>
        %endif
        <span class="vote-count">${item.votes}</span>
        %if canvote:
            <button class="vote-icon vote-down" type="submit" name="upvote" value="no"${' disabled' if novote else ''}>
                <span class="invisible-label">${_('downvote')}</span>
                <span class="icon icon-expand-down"></span>
            </button>
        %endif
        %if not canvote:
            <p class="vote-label">${ngettext('vote', 'votes', item.votes)}</p>
        %endif
    </form>
</%def>
