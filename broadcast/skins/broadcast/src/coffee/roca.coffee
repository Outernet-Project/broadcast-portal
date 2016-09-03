((window, $) ->
  MULTIPART = 'multipart/form-data'

  win = $ window
  doc = $ window.document.body

  $.fn.loading = () ->
    el = $ @
    el.each () ->
      el = $ @
      el.data 'loading-orig-html', el.html()
      el.html $.template 'loading'

  $.fn.cancelLoading = () ->
    el = $ @
    el.each () ->
      origHtml = el.data 'loading-orig-html'
      if not origHtml
        return
      el.html origHtml
      el.removeData 'loading-orig-html'

  $.createSubmitFrame = (id) ->
    # Create a hidden iframe for form submission
    submitFrame = $ '<iframe></iframe>'
    submitFrame.hide()
    submitFrame.attr 'id', id
    submitFrame.attr 'name', id
    doc.append submitFrame
    submitFrame

  $.fn.makePartial = () ->
    # Append a hidden field to the selected element, that causes it to be
    # treated as XHR submission even though it may be submitted without XHR.
    el = $ @
    el.append '<input type="hidden" name="partial" value="yes">'

  $.fn.funnelSubmit = () ->
    # Causes the forms within the selected element to be submitted using XHR,
    # or hidden iframe, and results loaded within the selected element.
    el = $ @
    containerId = el.attr 'id'
    submitTarget = "#{containerId}-submit-frame"
    submitFrame = $.createSubmitFrame submitTarget

    submitComplete = () -> win.trigger "#{containerId}-submit"

    submitFrameHandler = (e) ->
      frameContent = submitFrame.contents().find 'body'
      el.html frameContent.html()
      status = (frameContent.find '.feedback-message').data 'status'
      submitComplete() if status is 'ok'

    submitHandler = (e) ->
      form = $ @
      if (form.attr 'enctype') is MULTIPART
        form.makePartial().attr 'target', submitTarget
        submitFrame.one 'load', submitFrameHandler
      else
        e.preventDefault()
        formData = form.serialize()
        action = (form.attr 'action') or window.location.pathname
        res = $.post action, formData
        res.done (resp) ->
          el.html resp
          submitComplete()
        res.fail (xhr) ->
          el.html xhr.responseText

    el.on 'submit', 'form', submitHandler

  $.fn.reload = (fn) ->
    el = $ @
    id = el.attr 'id'
    url = el.data 'roca-url'
    el.load (url), (res, status, xhr) ->
      switch xhr.status
        when 200
          fn?(xhr.status)
          win.trigger 'roca-load', [el]
          win.trigger "#{id}-roca-load", [el]
        else
          fn?(xhr.status)
          el.cancelLoading()
          win.trigger 'roca-error', [el]
          win.trigger "#{id}-roca-error"
      return

  $.fn.rocaLoad = () ->
    # Load content from the URL pointed to by elements' `href` attribute into
    # target specified by the `data-roca-target` attribute.
    el = $ @

    autoRefresh = (target, interval) ->
      # Reload target every `interval` seconds
      refresh = () -> target.loading().reload reschedule
      reschedule = () -> setTimeout refresh, interval
      reschedule()

    refreshOn = (target, event, delay) ->
      # Reload target when `event` is fired
      refresh = () ->
        _delay = (delay || 0) * 1000
        _refresh = () -> target.loading().reload()
        setTimeout _refresh, _delay
      win.on event, refresh

    el.each () ->
      el = $ @
      url = el.attr 'href'
      target = $ "##{el.data 'roca-target'}"
      if not target.length
        return
      target.data 'roca-url', url
      target.loading().reload()
      if (el.data 'roca-trap-submit') is 'yes'
        options = { "onCompleteEvent": el.data 'roca-submit-complete-event' }
        target.funnelSubmit(options)

      # Optionally reload container when specific events are fired, delayed by
      # a specified time
      event = el.data 'roca-refresh-on'
      if event
        delay = el.data 'roca-refresh-delay'
        refreshOn target, event, delay

      # Optionally reload container on specific time intervals
      interval = el.data 'roca-refresh-interval'
      if interval
        autoRefresh target, interval * 1000

) this, this.jQuery
