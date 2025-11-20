import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("event_id", id)
    .single();

  if (error) {
    return res.status(404).json({ error: "Event not found" });
  }

  res.json({
  ...data,
  date: data.start_datetime ? new Date(data.start_datetime) : null,
  endDate: data.end_datetime ? new Date(data.end_datetime) : null,
});

});

export default router;
