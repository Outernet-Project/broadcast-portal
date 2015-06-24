(function ($) {
    $.fn.input = function (cb) {
        var el = $(this);
        el.one('input', function() {
            el.off('change', cb);
            el.off('keyup', cb);
        });
        el.on('input', cb);
        el.on('change', cb);
        el.on('keyup', cb);
        return el;
    };
}(this.jQuery));

/**
 * check.js
 *
 * Copyright 2011 Branko Vukelic <branko@brankovukelic.com>
 * Copyright 2015 Outernet Inc <apps@outernet.is>
 *
 * This module contains functions for performing various credit card checks.
 * The checks it performs are:
 *
 *  + Luhn Mod-10 check (verifies if card number is valid)
 *  + CSC check (verifies if the CSC/CVV/CCV number has correct number of 
 *    digits)
 *  + Issuer check (determines the issuer of the card)
 *
 * This module can be converted for use in browsers by using the `checkamd` 
 * target in the makefile:
 *
 *     make checkamd
 *
 * The above command converts this module into an AMD module loadable with
 * AMD-compliant loaders like [RequireJS](http://requirejs.org/).
 *
 * @author Outernet Inc <apps@outernet.is>
 * @license GPLv3 / LGPLv3
 */

(function(window) {
    'use strict';

    var check = {},
        NON_DIGIT_CHARS = /[^\d]+/g;

    window.check = check;

    /**
     * ## check.issuers
     * *Issuer names with regexes for checking the card numbers and CSCs*
     *
     * Issuer check regexes are currently based on the following resources: 
     * 
     *  + [Anatomy of Credit Card Numbers](http://www.merriampark.com/anatomycc.htm)
     *  + [Wikipedia article](http://en.wikipedia.org/wiki/Credit_card_numbers)
     *
     * These regexes are bound to change as issuers landscape changes over
     * time.  They are also not meant to be comprehensive Issuer check. They
     * are meant to catch major cards for further CVC (CCV) check.
     *
     * Currently, the following issuers are detected by this module:
     *
     *  + Visa
     *  + MasterCard
     *  + American Express
     *  + Diners Club
     *  + Discover
     *  + JCB (Japan Credit Bureau)
     *  + China UnionPay
     *
     * Note that China UnionPay cards _will_ fail the Luhn Mod-10 check.
     */
    check.issuers = {
      VISA: ['Visa', /^4(\d{12}|\d{15})$/, /^\d{3}$/],
      MAST: ['MasterCard', /^5[1-5]\d{14}$/, /^\d{3}$/],
      AMEX: ['American Express', /^3[47]\d{13}$/, /^\d{4}$/],
      DINA: ['Diners Club', /^3(00|05|6\d|8\d)\d{11}$/, /^\d{3}$/],
      DISC: ['Discover', /^(622[1-9]|6011|64[4-9]\d|65\d{2})\d{12}$/, /^\d{3}$/], 
      JCB: ['JCB', /^35(28|29|[3-8]\d)\d{12}$/, /^\d{3}$/], 
      CHIN: ['China UnionPay', /^62\d{14}/, /^\d{3}$/]
    };

    /**
     * ## check.extractDigits(s)
     * *Removes all non-digit characters from a given string*
     *
     * This function replaces all non-digit strings with an empty string. The 
     * resulting string contains only digits.
     *
     * `check.extractDigits()` is used throughout the `check` module to make sure 
     * that the card numbers and CSCs are parsed correctly.
     *
     * Example:
     *
     *     var n = '1234-5678-1234-5678';
     *     console.log(check.extractDigits(n);
     *     // outputs: '1234567812345678'
     *     n = 'abcd';
     *     console.log(check.extractDigits(n);
     *     // outputs: ''
     *
     * @param {String} s String to operate on
     * @returns {String} String with stripped out non-digit characters
     */
    check.extractDigits = function(s) {
      return s.replace(NON_DIGIT_CHARS, '');
    };

    /**
     * ## check.getIssuer(card, [full])
     * Returns the issuer of the card
     *
     * The card number is stripped of any non-digit characters prior to
     * checking.  The `full` flag can be used to retrieve all issuer detauls
     * (regex for checking card numbers and CSC) or just the issuer name.
     *
     * Example:
     *
     *     check.getIssuer('4111111111111111');
     *     // returns: 'Visa'
     *     check.getIssuer('4111111111111111', true);
     *     // returns: ['Visa', /^4(\d{12}|\d{15})$/, /^\d{3}$/]
     *
     * @param {String} card Card number
     * @param {Boolean} [full] Whether to return the issuer details instead
     * of name
     * @returns {String} String representing the issuer name
     */
     check.getIssuer = function(card, full) {
         var lastMatch = full ? ['Unknown', /^\d{16}$/, /^\d{3}$/] : 'Unknown';
         card = check.extractDigits(card);
         if (!card) {
             return 'Unknown';
         }
         Object.keys(check.issuers).forEach(function(issuer) {
             if (check.issuers[issuer][1].test(card)) {
                 lastMatch = full ? check.issuers[issuer] : check.issuers[issuer][0];
             }
         });
         return lastMatch;
    };

    /**
     * ## check.mod10check(card)
     * *Checks the validity of credit card using the Luhn Mod-10 algorithm*
     *
     * The card number is checked after all non-digit characters are removed
     * from the original string. If the check succeeds, the sanitized number
     * is returned. Otherwise, `null` is returned.
     *
     * Please note that China UnionPay cards always fail the Luhn Mod-10
     * check.  If you need to support China UnionPay cards, you need to make
     * an exception for them when validating the card number:
     *
     *     if (check.getIssuer(cardNumber) === 'China UnionPay') {
     *       return cardNumber;
     *     } else {
     *       return check.mod10check(cardNumber);
     *     }
     *
     * Since we have no access to valid test numbers for China UnionPay
     * cards, we don't know if Samurai gateway itself will accept them.
     *
     * Example:
     *
     *     check.mod10check('4111-1111-1111-1111');
     *     // returns: '4111111111111111'
     *     check.mod10check('123-bogus');
     *     // returns: null
     *     check.mod10check();
     *     // returns: null
     *
     * @param {String} card Card number in string format
     * @param {Boolean} match16 Whether to test if number has 16 digits
     * @return {Object} Sanitized number if valid, otherwise `null`
     */
    check.mod10check = function(card, match16) {
        var sum = 0,
            totalDigits,
            oddEven,
            digits,
            digit,
            i,
            current;

        card = check.extractDigits(card);

        if (match16 && (String(card)).length < 16) {
            // Card number length is not 16 digits
            return null;
        }

        if (!card) {
            // Card number contains no digits
            return null;
        }

        totalDigits = card.length;
        oddEven = totalDigits & 1;
        digits = card.split(''); // Convert to array

        for (i = totalDigits; i; --i) {
            current = totalDigits - i; 
            digit = parseInt(digits[current], 10);

            if (!((current & 1) ^ oddEven)) {
                digit = digit * 2;
            }
            if (digit > 9) {
                digit -= 9;
            }

            sum = sum + digit;
        }

        return (sum % 10) === 0 && card;
    };

    /**
     * ## check.cscCheck(card, csc)
     * *Checks the card security code (CSC) given card number and the code*
     *
     * Card number is required because the CSC is not the same format for all
     * issuers. Currently, American Express cards have a 4-digit CSC, while
     * all other issuers (that we know of) have a 3-digit CSC.
     *
     * Example:
     *
     *     check.cscCheck('4111111111111111', '111');
     *     // returns: true
     *     check.cscCheck('4111111111111111', '11');
     *     // returns: false
     *
     * @param {String} card Credit card number
     * @param {String} csc Card security code
     * @returns {Boolean} Boolean value of the test status
     */
    check.cscCheck = function(card, csc) {
        var issuerDetails;

        csc = check.extractDigits(csc);
        if (!csc) { return false; }

        issuerDetails = check.getIssuer(card, true);
        return issuerDetails[2].test(csc);
    };

    // Alias
    check.cvcCheck = check.cscCheck;


    /**
     * ## check.expiry(month, year)
     * *Checks if expiry date is in future*
     */
    check.expiry = function (month, year) {
        var today = new Date(),
            thisyear,
            thismonth;

        thisyear = today.getFullYear();
        thismonth = today.getMonth() + 1;
        if (year < 2000) {
            year += 2000;
        }
        if (year === thisyear) {
            return month >= thismonth;
        }
        return year > thisyear;
    };
}(this));

/**
 * priority.js: priority form code
 *
 * Copyright 2015, Outernet Inc.
 * Some rights reserved.
 *
 * This software is free software licensed under the terms of GPLv3. See
 * COPYING file that comes with the source code, or
 * http://www.gnu.org/licenses/gpl.txt.
 */

(function (window, $, Stripe) {
    'use strict';

    var self = {},
        check = window.check,
        pubKey = $('#id_stripe_public_key').val(),
        paymentForm = $('#payment-form'),
        checkCard,
        checkCvc,
        checkExpiry,
        cardField = $('#id_card_number'),
        yearField = $('#id_exp_year'),
        monthField = $('#id_exp_month'),
        cvcField = $('#id_cvc');

    $.fn.markNegative = function () {
        var el = $(this);
        el.removeClass('positive').addClass('negative');
        return el;
    };

    $.fn.markPositive = function () {
        var el = $(this);
        
        el.addClass('positive').removeClass('negative');
        return el;
    };

    $.fn.togglePositive = function (val) {
        var el = $(this);

        if (val) {
            el.markPositive();
        } else {
            el.markNegative();
        }
        return el;
    };

    $.fn.removeMarks = function () {
        return $(this).removeClass('positive').removeClass('negative');
    };

    checkCard = function () {
        var el = $(this).removeMarks(),
            parent = el.parent('p'),
            isCardValid,
            card = check.extractDigits(el.val());
        parent.clearErrors();
        if (card.length < 16) {
            return;
        }
        isCardValid = check.mod10check(card);
        el.togglePositive(isCardValid);
        if (!isCardValid) {
            parent.markError(window.messages.cardError);
        }
    };

    checkCvc = function () {
        var el = $(this).removeMarks(),
            parent = el.parent('p'),
            card = check.extractDigits(cardField.val()),
            cvc = check.extractDigits(el.val()),
            isCvcValid;
        parent.clearErrors();
        if (!cvc.length) {
            return;
        }
        if (card) {
            isCvcValid = check.cvcCheck(card, cvc);
        } else {
            isCvcValid = cvc.length === 3 || cvc.length === 4;
        }
        el.togglePositive(isCvcValid);
        if (!isCvcValid) {
            parent.markError(window.messages.cvcError);
        }
    };

    checkExpiry = function () {
        var month = monthField.removeMarks().val(),
            year = yearField.removeMarks().val(),
            parent = monthField.parent('p'),
            expiryOK;

        parent.clearErrors();

        if (!month.toString().length || year.toString().length < 2) {
            return;
        }

        month = parseInt(month, 10);
        year = parseInt(year, 10);

        if (isNaN(month) || isNaN(year)) {
            monthField.markNegative();
            yearField.markNegative();
            parent.markError(window.messages.dateError);
            return;
        }

        if (month < 0 || month > 12) {
            monthField.markNegative();
            yearField.markNegative();
            parent.markError(window.messages.monthRangeError);
            return;
        }

        expiryOK = check.expiry(month, year);

        monthField.togglePositive(expiryOK);
        yearField.togglePositive(expiryOK);

        if (!expiryOK) {
            parent.markError(window.messages.expError);
        }
    };

    cardField.input(checkCard);
    cvcField.input(checkCvc);
    monthField.input(checkExpiry);
    yearField.input(checkExpiry);

    Stripe.setPublishableKey(pubKey);

    self.stripeResponseHandler = function (status, response) {
        var formErrors,
            tokenEl;
        if (response.error) {
            formErrors = paymentForm.find('.form-errors');

            if (formErrors.length === 0) {
                formErrors = $('<ul class="form-errors"></ul>');
                paymentForm.prepend(formErrors);
            }
            formErrors.append($('<li></li>').text(response.error.message));
            formErrors.show();
            self.attachHandler();
        } else {
            tokenEl = $('<input type="hidden" name="stripe_token" />').val(response.id);
            paymentForm.append(tokenEl);
            paymentForm.find("[data-stripe=number]").remove();
            paymentForm.find("[data-stripe=cvc]").remove();
            paymentForm.find("[data-stripe=exp-year]").remove();
            paymentForm.find("[data-stripe=exp-month]").remove();
            paymentForm.submit();
        }
    };

    self.submitPayment = function (e) {
        e.preventDefault();
        self.detachHandler();
        Stripe.card.createToken(paymentForm, self.stripeResponseHandler);
    };

    self.attachHandler = function () {
        paymentForm.on('submit', self.submitPayment);
    };

    self.detachHandler = function () {
        paymentForm.off('submit', self.submitPayment);
    };

    self.attachHandler();
}(this, this.jQuery, this.Stripe));
