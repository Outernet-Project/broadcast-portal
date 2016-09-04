import time
import random
import logging

from bottle_utils import form
from bottle_utils.i18n import dummy_gettext as _
from mailchimp3 import MailChimp

from ..app.exts import container as exts
from ..models.auth import User, InvitationToken
from ..util.validators import EmailValidator


class BetaSignupForm(form.Form):
    email = form.StringField(
        # Translators, used as label in create user form
        _("Email"),
        validators=[form.Required(), EmailValidator()],
        placeholder=_('you@example.com'))

    def random_pause(self):
        # Simulates sending emails
        time.sleep(random.randint(2, 5))

    def subscribe(self, email):
        client = MailChimp(exts.config['mailchimp.username'],
                           exts.config['mailchimp.secret'])
        data = {'email_address': email, 'status': 'subscribed'}
        client.member.create(exts.config['mailchimp.beta_list_id'], data)

    def validate(self):
        email = self.processed_data['email']
        try:
            User.get(email=email)
        except User.NotFound:
            pass
        else:
            # User already exits, so we bail here after a random timeout
            self.random_pause()
            return
        if email in exts.beta_whitelist:
            token = InvitationToken.new(email)
            token.send()
        else:
            self.random_pause()
            if exts.config['mailchimp.beta_list_id']:
                self.subscribe(email)
            else:
                logging.debug('BETA: %s', email)