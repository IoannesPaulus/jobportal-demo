'use strict';

function wrapResponse(err, data) {
  const success = !err;
  let msg;
  if (err) {
    msg = err.message;
  } else {
    msg = null;
  }

  const resp = {
    error: msg,
    data: data || null,
    success
  };

  return resp;
}

module.exports = {
  wrapResponse
};
