import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Update an existing event by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    title,
    type,
    sport_name,
    start_datetime,
    end_datetime,
    location,
    entry_fee,
    description,
  } = req.body;

  // Basic validation
  const missingFields = [];
  if (!title) missingFields.push("title");
  if (!type) missingFields.push("type");
  if (!sport_name) missingFields.push("sport_name");
  if (!start_datetime) missingFields.push("start_datetime");
  if (!end_datetime) missingFields.push("end_datetime");
  if (!location) missingFields.push("location");
  if (!description) missingFields.push("description");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: "Missing required field(s).",
      missing: missingFields,
    });
  }

  try {
    const { data, error } = await supabase
      .from("events")
      .update({
        title,
        type,
        sport_name,
        start_datetime,
        end_datetime,
        location,
        entry_fee,
        description,
      })
      .eq("event_id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error.message, error.details);
      return res.status(500).json({ message: "Failed to update event.", error: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: "Event not found." });
    }

    return res.status(200).json({
      message: "Event updated successfully.",
      event: data,
    });
  } catch (err) {
    console.error("Server error during event update:", err);
    return res.status(500).json({ message: "Unexpected server error." });
  }
});

export default router;
