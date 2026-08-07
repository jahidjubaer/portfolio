import { validateContactPayload } from "../utils/contactValidation.js";
import { deliverContactMessage } from "../services/contactService.js";

export async function postContact(req, res, next) {
  try {
    const { valid, errors, value, isSpam } = validateContactPayload(req.body);

    if (!valid) {
      res.status(400).json({
        success: false,
        message: "Please correct the highlighted fields.",
        errors,
      });
      return;
    }

    if (isSpam) {
      // Respond exactly as a real success would, without actually
      // delivering anything — telling a bot its submission was rejected
      // just teaches it to remove the honeypot field.
      res.status(200).json({
        success: true,
        message: "Your message has been received.",
      });
      return;
    }

    const result = await deliverContactMessage(value);

    if (!result.delivered) {
      res.status(503).json({
        success: false,
        message:
          "The contact form is temporarily unavailable. Please email directly instead.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Your message has been received.",
    });
  } catch (error) {
    next(error);
  }
}
