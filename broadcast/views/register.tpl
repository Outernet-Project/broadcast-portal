<%inherit file="base.tpl"/>
<%namespace name='register_form' file='_register.tpl'/>
<%namespace name='messages' file='_messages.tpl'/>

<%block name="title">
    ${_("Register")}
</%block>

<div class="h-bar">
    <h2>${_('Get started')}</h2>
</div>
<div class="full-page-form" data-url="${url('check_available')}" id="register-form">
    <p class="note">
    ${_('''In order for us to manage your submissions and track payment status,
    you need to create an account and confirm your email address. Confirmation
    email will be sent to your inbox after registration.''')}
    </p>

    ${register_form.body()}
</div>

<%block name="extra_scripts">
${messages.messages(registration_form)}
<script type="text/javascript">
    window.pwlen = ${registration_form.min_password_length};
</script>
<script src="${assets['js/accounts']}"></script>
</%block>
