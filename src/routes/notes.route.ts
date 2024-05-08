import * as NotesController from "../controllers/notes.controller";
import express from "express";

const router = express.Router();

router.get("/", NotesController.getNotes);
router.post("/", NotesController.createNotes);
router.get("/:noteId", NotesController.getNote);
router.patch("/:noteId", NotesController.updateNote);
router.delete("/:noteId", NotesController.deleteNote);

export default router;
