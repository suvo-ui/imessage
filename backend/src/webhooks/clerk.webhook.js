import express from "express";
import User from "../models/user.model.js";
import { verifyWebhook } from "@clerk/backend/webhooks";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("====================================");
  console.log("WEBHOOK RECEIVED");
  console.log("====================================");

  try {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    if (!signingSecret) {
      console.error("CLERK_WEBHOOK_SIGNING_SECRET is missing");

      return res.status(500).json({
        message: "Webhook secret is not provided",
      });
    }

    const payload = Buffer.isBuffer(req.body)
      ? req.body.toString("utf-8")
      : String(req.body);

    console.log("Payload length:", payload.length);

    const request = new Request("http://internal/webhooks/clerk", {
      method: "POST",
      headers: new Headers(req.headers),
      body: payload,
    });

    console.log("Verifying webhook...");

    const evt = await verifyWebhook(request, {
      signingSecret,
    });

    console.log("Webhook verified successfully");
    console.log("EVENT TYPE:", evt.type);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      console.log("Processing user create/update");

      const u = evt.data;

      console.log("Clerk User ID:", u.id);

      const email =
        u.email_addresses?.find((e) => e.id === u.primary_email_address_id)
          ?.email_address ?? u.email_addresses?.[0]?.email_address;

      const fullName =
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||
        u.username ||
        email?.split("@")[0];

      console.log("Email:", email);
      console.log("Full Name:", fullName);

      const result = await User.findOneAndUpdate(
        {
          clerkID: u.id,
        },
        {
          clerkID: u.id,
          email,
          fullName,
          profilePic: u.image_url,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      );

      console.log("MongoDB update successful");
      console.log("Saved user:", result);
    }

    if (evt.type === "user.deleted") {
      console.log("Processing user deletion");

      if (evt.data.id) {
        const deletedUser = await User.findOneAndDelete({
          clerkID: evt.data.id,
        });

        console.log("Deleted user:", deletedUser);
      }
    }

    console.log("Webhook completed successfully");

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("====================================");
    console.error("WEBHOOK ERROR");
    console.error(error);
    console.error("====================================");

    return res.status(400).json({
      message: "Webhook Verification Failed",
      error: error.message,
    });
  }
});

export default router;
