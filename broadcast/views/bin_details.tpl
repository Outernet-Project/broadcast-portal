<%inherit file='base.tpl'/>
<%namespace name="bin_details" file="_bin_details.tpl"/>

<%block name="main">
    <div class="bin-heading">
        <h1 class="title">${_("Bin Details")}</h1>
        <div class="bin-info-display">
            <span class="line">${_("Current bin size: {size} / {usage}%".format(size=h.hsize(bin.size), usage=round(bin.usage, 2)))}</span>
            <br />
            <span class="line">${_("Broadcast date: {time}".format(time=bin.closes.strftime('%b %d, %H:%M UTC')))}</span>
        </div>
        <span class="bin-usage-bar light">
            <span class="bin-usage-bar-indicator" style="width: ${bin.usage}%"></span>
        </span>
    </div>

    <div class="bin">
        <div class="items">
            ${bin_details.body()}
        </div>
    </div>
</%block>

