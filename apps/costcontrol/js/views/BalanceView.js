/* global _, Formatting */
/* exported BalanceView */
'use strict';

function BalanceView(balanceLabel, timestampLabel, minimumDelay) {

  minimumDelay = minimumDelay || 0;

  var viewTimestamp;

  var timeHighlightColors = [
    {threshold: minimumDelay / 3, className: 'first-third'},
    {threshold: 2 * minimumDelay / 3, className: 'second-third'},
    {threshold: minimumDelay, className: 'third-third'},
    {threshold: 24 * 60 * 60 * 1000, className: 'yesterday'},
    {threshold: Infinity, className: 'before'}
  ];

  function update(balanceResult, isUpdating) {
    if (!balanceResult) {
      setBalanceToNotAvailable();
    } else {
      updateBalance(balanceResult.balance, balanceResult.currency);
      updateTimestamp(balanceResult.timestamp, isUpdating);
    }
  }

  function setBalanceToNotAvailable() {
    balanceLabel.setAttribute('data-l10n-id', 'not-available');
    timestampLabel.innerHTML = '';
  }

  function updateBalance(balance, currencySymbol) {
    balanceLabel.textContent = _('currency', {
      value: balance,
      currency: currencySymbol
    });
  }

  function updateTimeFormat() {
    updateTimestamp(viewTimestamp);
  }

  function updateTimestamp(timestamp, isUpdating) {
    timestampLabel.innerHTML = '';
    viewTimestamp = timestamp;

    if (isUpdating) {
      timestampLabel.setAttribute('data-l10n-id', 'updating-ellipsis');
    } else if (typeof timestamp !== 'undefined') {
      var time = getTimeTagFor(timestamp);
      timestampLabel.appendChild(time);
      time.classList.add(getHighlightColor(timestamp));
    }
  }

  function getTimeTagFor(timestamp) {
    var time = document.createElement('time');
    time.setAttribute('datetime', timestamp.toISOString());
    time.textContent = Formatting.formatTimeSinceNow(timestamp);
    return time;
  }

  function getHighlightColor(timestamp) {
    if (!minimumDelay) {
      return 'first-third';
    }

    var now = new Date(), then = new Date(timestamp);
    var age = now - then;
    for (var i = 0, l = timeHighlightColors.length; i < l; i++) {
      var category = timeHighlightColors[i];
      if (age < category.threshold) {
        return category.className;
      }
    }
    return timeHighlightColors[l - 1].className;
  }

  window.addEventListener('timeformatchange', updateTimeFormat);

  this.update = update;
}
