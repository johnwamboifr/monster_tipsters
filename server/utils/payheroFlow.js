export const extractPayHeroPayload = (body = {}) => {
  if (!body || typeof body !== "object") {
    return null;
  }

  if (body.response && typeof body.response === "object") {
    return body.response;
  }

  if (body.data && typeof body.data === "object") {
    return body.data;
  }

  return body;
};

export const buildPaymentLookupCandidates = ({
  checkoutRequestId,
  reference,
  externalReference,
  merchantReference,
} = {}) => {
  const candidates = [];

  if (checkoutRequestId) {
    candidates.push({ checkoutRequestId });
  }

  const paymentReference = reference || externalReference;

  if (paymentReference) {
    candidates.push({ reference: paymentReference });
    candidates.push({ externalReference: paymentReference });
  }

  if (merchantReference) {
    candidates.push({ merchantReference });
  }

  return candidates;
};

export const isSuccessfulPayHeroPayload = (payload = {}) => {
  const normalizedStatus = String(
    payload?.Status ??
    payload?.status ??
    payload?.paymentStatus ??
    payload?.payment_status ??
    ""
  )
    .trim()
    .toLowerCase();

  const resultCodeValue = String(
    payload?.ResultCode ??
    payload?.resultCode ??
    payload?.result_code ??
    ""
  ).trim();

  if (resultCodeValue === "0") {
    return true;
  }

  return [
    "success",
    "successful",
    "paid",
    "completed",
    "complete",
  ].includes(normalizedStatus);
};

export const parseExternalReference = (reference) => {
  if (!reference) {
    return null;
  }

  const parts = String(reference).split("-");

  if (parts.length < 3) {
    return null;
  }

  const [, userId, planRef] = parts;

  const parsedUserId = Number(userId);

  return {
    userId: Number.isFinite(parsedUserId)
      ? parsedUserId
      : null,
    planRef: planRef || null,
  };
};

